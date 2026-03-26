import type { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    reply.code(401).send({ error: 'Unauthorized', message: 'Valid authentication required' });
  }
}

export async function requireCreator(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  const user = request.user as { role?: string; creatorTier?: string };
  if (user.role !== 'creator' && user.role !== 'admin') {
    reply.code(403).send({ error: 'Forbidden', message: 'Creator access required' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await requireAuth(request, reply);
  const user = request.user as { role?: string };
  if (user.role !== 'admin') {
    reply.code(403).send({ error: 'Forbidden', message: 'Admin access required' });
  }
}
