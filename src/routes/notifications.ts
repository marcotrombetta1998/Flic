import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { getNotifications, markAsRead } from '../services/notifications';

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [requireAuth] }, async (request) => {
    const { id } = request.user as { id: string };
    const { limit } = z.object({ limit: z.coerce.number().default(30) }).parse(request.query);
    return getNotifications(id, limit);
  });

  fastify.patch('/read-all', { onRequest: [requireAuth] }, async (request) => {
    const { id } = request.user as { id: string };
    await markAsRead(id);
    return { ok: true };
  });

  fastify.patch('/:id/read', { onRequest: [requireAuth] }, async (request) => {
    const { id: userId } = request.user as { id: string };
    const { id: notifId } = z.object({ id: z.string().uuid() }).parse(request.params);
    await markAsRead(userId, notifId);
    return { ok: true };
  });
}
