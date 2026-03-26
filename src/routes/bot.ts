import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/client';
import { botConversations, videos } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { handleBotMessage } from '../services/ai/bot';

const QUICK_SUGGESTIONS: Record<string, string[]> = {
  food:    ['Full recipe', 'Calories & macros', 'Wine pairing', 'Can I substitute ingredients?'],
  travel:  ['Where exactly is this?', 'What did it cost?', 'Best time to visit?', 'Book this spot'],
  fitness: ['How many sets?', 'Alternative exercises', 'Muscle groups targeted', 'Beginner modifications'],
  finance: ['Buy or sell signal?', 'Risk level?', 'Time horizon?', 'Similar tickers'],
  music:   ['Full chord chart', 'What key is this?', 'Beginner version?', 'BPM?'],
};

export async function botRoutes(fastify: FastifyInstance) {
  fastify.post('/chat', { onRequest: [requireAuth] }, async (request, reply) => {
    const { videoId, message, conversationId } = z.object({
      videoId:        z.string().uuid(),
      message:        z.string().min(1).max(500),
      conversationId: z.string().uuid().optional(),
    }).parse(request.body);

    const { id: userId } = request.user as { id: string };

    try {
      const result = await handleBotMessage(userId, videoId, message, conversationId);
      return result;
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Insufficient credits') {
        return reply.code(402).send({ error: 'InsufficientCredits', message: 'Not enough credits for this query' });
      }
      throw err;
    }
  });

  fastify.get('/conversations/:videoId', { onRequest: [requireAuth] }, async (request) => {
    const { videoId } = z.object({ videoId: z.string().uuid() }).parse(request.params);
    const { id: userId } = request.user as { id: string };
    const [conv] = await db
      .select()
      .from(botConversations)
      .where(and(eq(botConversations.userId, userId), eq(botConversations.videoId, videoId)));
    return conv ?? { messages: [] };
  });

  fastify.post('/suggestions/:videoId', { onRequest: [requireAuth] }, async (request) => {
    const { videoId } = z.object({ videoId: z.string().uuid() }).parse(request.params);
    const [video] = await db.select({ vertical: videos.vertical }).from(videos).where(eq(videos.id, videoId));
    const suggestions = QUICK_SUGGESTIONS[video?.vertical ?? 'food'] ?? QUICK_SUGGESTIONS.food!;
    return { suggestions: suggestions.slice(0, 3) };
  });
}
