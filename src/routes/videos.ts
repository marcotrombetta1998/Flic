import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc, lt, and, sql } from 'drizzle-orm';
import { db } from '../db/client';
import { videos } from '../db/schema';

// CRIT-05: Only allow video URLs from trusted storage domains
const ALLOWED_VIDEO_HOSTS = (process.env.ALLOWED_VIDEO_HOSTS ?? 'supabase.co,amazonaws.com,cloudfront.net').split(',');
function isAllowedVideoUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return ALLOWED_VIDEO_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch { return false; }
}
import { requireAuth, requireCreator } from '../middleware/auth';
import { deductCredits } from '../services/credits';
import { checkSurgePrice } from '../services/gamification/surge-inverse';
import { videoProcessingQueue } from '../queues/video-processing';
import { createNotification } from '../services/notifications';

export async function videoRoutes(fastify: FastifyInstance) {
  // GET /videos — paginated feed
  fastify.get('/', async (request) => {
    const { vertical, cursor, limit = 20 } = z.object({
      vertical: z.string().optional(),
      cursor:   z.string().optional(),
      limit:    z.coerce.number().default(20).max(50),
    }).parse(request.query);

    const conditions = [eq(videos.isPublished, true)];
    if (vertical) conditions.push(eq(videos.vertical, vertical));
    if (cursor) conditions.push(lt(videos.publishedAt, new Date(cursor)));

    const feed = await db
      .select()
      .from(videos)
      .where(and(...conditions))
      .orderBy(desc(videos.publishedAt))
      .limit(limit + 1);

    const hasMore = feed.length > limit;
    const items = hasMore ? feed.slice(0, limit) : feed;
    const nextCursor = hasMore ? items[items.length - 1]?.publishedAt?.toISOString() : null;
    return { items, nextCursor, hasMore };
  });

  // GET /videos/trending
  fastify.get('/trending', async (request) => {
    const { vertical } = z.object({ vertical: z.string().optional() }).parse(request.query);
    const conditions = [eq(videos.isPublished, true)];
    if (vertical) conditions.push(eq(videos.vertical, vertical));
    return db.select().from(videos).where(and(...conditions)).orderBy(desc(videos.flicCount)).limit(10);
  });

  // GET /videos/:id — strip sensitive fields from unauthenticated response (MED-11)
  fastify.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const [video] = await db
      .select({
        id: videos.id, creatorId: videos.creatorId, title: videos.title, description: videos.description,
        vertical: videos.vertical, videoUrl: videos.videoUrl, thumbnailUrl: videos.thumbnailUrl,
        durationSeconds: videos.durationSeconds, unlockCostCredits: videos.unlockCostCredits,
        isPublished: videos.isPublished, viewCount: videos.viewCount, flicCount: videos.flicCount,
        unlockCount: videos.unlockCount, replicaCount: videos.replicaCount, aiProcessed: videos.aiProcessed,
        createdAt: videos.createdAt, publishedAt: videos.publishedAt,
        // botSystemPrompt, transcript, aiData intentionally excluded — returned only after unlock
      })
      .from(videos)
      .where(eq(videos.id, id));
    if (!video) return reply.code(404).send({ error: 'Video not found' });
    return video;
  });

  // POST /videos/:id/view — atomic increment (HIGH-09)
  fastify.post('/:id/view', { onRequest: [requireAuth] }, async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await db.update(videos).set({ viewCount: sql`${videos.viewCount} + 1` }).where(eq(videos.id, id));
    return { ok: true };
  });

  // POST /videos/:id/unlock
  fastify.post('/:id/unlock', { onRequest: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { id: userId } = request.user as { id: string };
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    if (!video) return reply.code(404).send({ error: 'Video not found' });
    const cost = await checkSurgePrice(id, video.unlockCostCredits);
    await deductCredits(userId, cost, 'unlock', id);
    await db.update(videos).set({ unlockCount: video.unlockCount + 1 }).where(eq(videos.id, id));
    // Notify creator
    await createNotification(video.creatorId, 'unlock', '🔒 Video unlocked!', `Someone unlocked "${video.title}" (+${Math.floor(cost * 0.7)} credits)`, { videoId: id });
    return { unlocked: true, creditsSpent: cost, aiData: video.aiData, transcript: video.transcript };
  });

  // POST /videos/:id/replica
  fastify.post('/:id/replica', { onRequest: [requireAuth] }, async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    await db.update(videos).set({ replicaCount: (video?.replicaCount ?? 0) + 1 }).where(eq(videos.id, id));
    return { ok: true };
  });

  // GET /videos/:id/ai-data
  fastify.get('/:id/ai-data', { onRequest: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const [video] = await db.select({ aiData: videos.aiData, aiProcessed: videos.aiProcessed }).from(videos).where(eq(videos.id, id));
    if (!video) return reply.code(404).send({ error: 'Not found' });
    if (!video.aiProcessed) return reply.code(202).send({ message: 'AI processing in progress' });
    return { aiData: video.aiData };
  });

  // POST /videos — upload (creator only)
  fastify.post('/', { onRequest: [requireCreator] }, async (request, reply) => {
    const body = z.object({
      title:       z.string().min(3).max(200),
      description: z.string().optional(),
      vertical:    z.enum(['travel','food','fitness','finance','music','interior','sport']),
      videoUrl:    z.string().url().refine(isAllowedVideoUrl, { message: 'videoUrl must be from an allowed storage domain' }),
      durationSeconds: z.number().int().positive(),
      unlockCostCredits: z.number().int().min(1).max(100).default(1),
    }).parse(request.body);

    const { id: creatorId } = request.user as { id: string };
    const [video] = await db.insert(videos).values({
      ...body,
      creatorId,
      isPublished: false,
      publishedAt: new Date(),
    }).returning();

    // Queue AI processing
    await videoProcessingQueue.add('process', { videoId: video!.id, videoPath: body.videoUrl }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });

    return reply.code(201).send(video);
  });

  // PATCH /videos/:id — only the video's creator may update (HIGH-01)
  fastify.patch('/:id', { onRequest: [requireCreator] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { id: creatorId } = request.user as { id: string };
    const body = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      isPublished: z.boolean().optional(),
    }).parse(request.body);
    const [video] = await db
      .update(videos)
      .set(body)
      .where(and(eq(videos.id, id), eq(videos.creatorId, creatorId)))
      .returning();
    if (!video) return reply.code(404).send({ error: 'Video not found or access denied' });
    return video;
  });

  // DELETE /videos/:id — only the video's creator may delete (HIGH-01)
  fastify.delete('/:id', { onRequest: [requireCreator] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { id: creatorId } = request.user as { id: string };
    const result = await db.delete(videos).where(and(eq(videos.id, id), eq(videos.creatorId, creatorId))).returning({ id: videos.id });
    if (result.length === 0) return reply.code(404).send({ error: 'Video not found or access denied' });
    return reply.code(204).send();
  });
}
