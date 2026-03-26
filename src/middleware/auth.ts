import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized', message: 'Valid authentication required' });
  }
}

export async function requireCreator(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return; // auth failed, halt
  const { id } = request.user as { id: string };
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, id));
  if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
    reply.code(403).send({ error: 'Forbidden', message: 'Creator access required' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  if (reply.sent) return; // auth failed, halt
  const { id } = request.user as { id: string };
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, id));
  if (!user || user.role !== 'admin') {
    reply.code(403).send({ error: 'Forbidden', message: 'Admin access required' });
  }
}
