import type { FastifyRequest, FastifyReply } from 'fastify';
import { getBalance } from '../services/credits';

export function requireCredits(minCredits: number) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user as { id?: string };
    if (!user?.id) { reply.code(401).send({ error: 'Unauthorized' }); return; }
    const balance = await getBalance(user.id);
    if (balance < minCredits) {
      reply.code(402).send({
        error: 'InsufficientCredits',
        message: `You need at least ${minCredits} credits. Current balance: ${balance}`,
        balance,
      });
    }
  };
}
