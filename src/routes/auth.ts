import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users, creditTransactions, botConversations, comments, userFanCards } from '../db/schema';
import { supabase } from '../lib/supabase';

const registerSchema = z.object({
  displayName: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const { data, error } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });
    if (error) return reply.code(400).send({ error: error.message });
    const [user] = await db.insert(users).values({
      id: data.user!.id,
      email: body.email,
      username: body.username,
      displayName: body.displayName,
    }).returning();
    const token = fastify.jwt.sign({ id: user!.id, email: user!.email, role: user!.role }, { expiresIn: '24h' });
    return reply.code(201).send({ token, user });
  });

  fastify.post('/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const { data, error } = await supabase.auth.signInWithPassword({ email: body.email, password: body.password });
    if (error) return reply.code(401).send({ error: 'Invalid credentials' });
    const [user] = await db.select().from(users).where(eq(users.email, body.email));
    if (!user) return reply.code(404).send({ error: 'User not found' });
    const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role }, { expiresIn: '24h' });
    return { token, user };
  });

  fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  });

  fastify.patch('/me', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const body = z.object({ displayName: z.string().optional(), avatarUrl: z.string().url().optional() }).parse(request.body);
    const [user] = await db.update(users).set({ ...body, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return user;
  });

  // Social auth: exchange Supabase OAuth session token for FLIC JWT
  fastify.post('/social', async (request, reply) => {
    const { provider, accessToken } = z.object({
      provider: z.enum(['apple', 'google']),
      accessToken: z.string(),
    }).parse(request.body);

    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user) return reply.code(401).send({ error: 'Invalid social token' });

    const supaUser = data.user;
    let [user] = await db.select().from(users).where(eq(users.email, supaUser.email!));
    if (!user) {
      const displayName = supaUser.user_metadata?.full_name ?? supaUser.email!.split('@')[0];
      const username = `${provider}_${supaUser.id.replace(/-/g, '').slice(0, 16)}`;
      [user] = await db.insert(users).values({
        id: supaUser.id,
        email: supaUser.email!,
        username,
        displayName,
        avatarUrl: supaUser.user_metadata?.avatar_url ?? null,
      }).returning();
    }

    const token = fastify.jwt.sign({ id: user!.id, email: user!.email, role: user!.role }, { expiresIn: '24h' });
    return { token, user };
  });

  fastify.delete('/me/data', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    const { id } = request.user as { id: string };
    await supabase.auth.admin.deleteUser(id);
    await db.delete(users).where(eq(users.id, id));
    return reply.code(204).send();
  });

  // GDPR Art. 15 — Subject Access Request
  fastify.get('/me/export', { onRequest: [fastify.authenticate] }, async (request) => {
    const { id } = request.user as { id: string };
    const [user] = await db.select().from(users).where(eq(users.id, id));
    const transactions = await db.select().from(creditTransactions).where(eq(creditTransactions.userId, id));
    const conversations = await db.select().from(botConversations).where(eq(botConversations.userId, id));
    const userComments = await db.select().from(comments).where(eq(comments.userId, id));
    const fanCardOwnership = await db.select().from(userFanCards).where(eq(userFanCards.userId, id));
    return {
      exportedAt: new Date().toISOString(),
      subject: 'GDPR Art. 15 Subject Access Request — FLIC',
      data: {
        profile: user,
        creditTransactions: transactions,
        botConversations: conversations,
        comments: userComments,
        fanCards: fanCardOwnership,
      },
    };
  });
}
