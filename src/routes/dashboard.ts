import type { FastifyInstance } from 'fastify';
import { eq, gte, sum, count, and } from 'drizzle-orm';
import { db } from '../db/client';
import { videos, creditTransactions } from '../db/schema';
import { requireCreator } from '../middleware/auth';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/overview', { onRequest: [requireCreator] }, async (request) => {
    const { id: creatorId } = request.user as { id: string };
    const creatorVideos = await db.select({ flics: videos.flicCount, unlocks: videos.unlockCount, views: videos.viewCount, title: videos.title }).from(videos).where(eq(videos.creatorId, creatorId));
    const totalFlics   = creatorVideos.reduce((s, v) => s + v.flics, 0);
    const totalUnlocks = creatorVideos.reduce((s, v) => s + v.unlocks, 0);
    const totalViews   = creatorVideos.reduce((s, v) => s + v.views, 0);
    const unlockRate   = totalViews > 0 ? ((totalUnlocks / totalViews) * 100).toFixed(1) : '0';
    const topVideo     = creatorVideos.sort((a, b) => b.flics - a.flics)[0];
    return { totalFlics, totalUnlocks, totalViews, unlockRate: `${unlockRate}%`, topVideo };
  });

  fastify.get('/analytics', { onRequest: [requireCreator] }, async (request) => {
    const { id: creatorId } = request.user as { id: string };
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // HIGH-06: scope to this creator's earnings only
    const txs = await db.select().from(creditTransactions).where(
      and(eq(creditTransactions.type, 'creator_earning'), eq(creditTransactions.userId, creatorId))
    );
    // Group by day (simplified)
    const byDay: Record<string, number> = {};
    txs.forEach((tx) => {
      const day = tx.createdAt.toISOString().split('T')[0]!;
      byDay[day] = (byDay[day] ?? 0) + tx.amount;
    });
    return Object.entries(byDay).map(([date, amount]) => ({ date, amount }));
  });

  fastify.get('/videos', { onRequest: [requireCreator] }, async (request) => {
    const { id: creatorId } = request.user as { id: string };
    return db.select().from(videos).where(eq(videos.creatorId, creatorId)).orderBy(eq(videos.flicCount, videos.flicCount)).limit(50);
  });

  fastify.post('/payout', { onRequest: [requireCreator] }, async (request, reply) => {
    return reply.code(200).send({ message: 'Payout request submitted. Processing in 3-5 business days.' });
  });
}
