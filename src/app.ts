import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { logger } from './lib/logger';
import { redis } from './lib/redis';

import { authRoutes }         from './routes/auth';
import { videoRoutes }        from './routes/videos';
import { botRoutes }          from './routes/bot';
import { creditRoutes }       from './routes/credits';
import { creatorRoutes }      from './routes/creators';
import { subscriptionRoutes } from './routes/subscriptions';
import { commentRoutes }      from './routes/comments';
import { fanCardRoutes }      from './routes/fan-cards';
import { notificationRoutes } from './routes/notifications';
import { dashboardRoutes }    from './routes/dashboard';
import { startVideoProcessingWorker } from './queues/video-processing';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
}

async function bootstrap() {
  const app = Fastify({ logger: false, trustProxy: true });

  // Plugins
  if (!process.env.APP_URL) throw new Error('Missing APP_URL env var');
  if (!process.env.JWT_SECRET) throw new Error('Missing JWT_SECRET env var');

  await app.register(cors, { origin: process.env.APP_URL, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute', redis, keyGenerator: (req) => (req.user as { id?: string } | undefined)?.id ?? req.ip });
  await app.register(jwt, { secret: process.env.JWT_SECRET });
  await app.register(multipart, { limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB

  // JWT decorator
  app.decorate('authenticate', async (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => {
    try { await request.jwtVerify(); } catch { reply.code(401).send({ error: 'Unauthorized' }); }
  });

  // Zod error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({ error: 'ValidationError', issues: error.issues });
    }
    logger.error({ err: error.message, stack: error.stack }, 'Unhandled error');
    // MED-05: never leak internal error messages for 5xx responses
    const statusCode = error.statusCode ?? 500;
    const message = statusCode < 500 ? (error.message ?? 'Bad Request') : 'Internal Server Error';
    return reply.code(statusCode).send({ error: message });
  });

  // Routes
  const v1 = '/api/v1';
  await app.register(authRoutes,         { prefix: `${v1}/auth` });
  await app.register(videoRoutes,        { prefix: `${v1}/videos` });
  await app.register(botRoutes,          { prefix: `${v1}/bot` });
  await app.register(creditRoutes,       { prefix: `${v1}/credits` });
  await app.register(creatorRoutes,      { prefix: `${v1}/creators` });
  await app.register(subscriptionRoutes, { prefix: `${v1}/subscriptions` });
  await app.register(commentRoutes,      { prefix: `${v1}/comments` });
  await app.register(fanCardRoutes,      { prefix: `${v1}/fan-cards` });
  await app.register(notificationRoutes, { prefix: `${v1}/notifications` });
  await app.register(dashboardRoutes,    { prefix: `${v1}/dashboard` });

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString(), service: 'flic-api' }));

  // Start queue worker
  if (process.env.NODE_ENV !== 'test') {
    startVideoProcessingWorker();
    logger.info('Video processing worker started');
  }

  const port = parseInt(process.env.PORT ?? '3000');
  await app.listen({ port, host: '0.0.0.0' });
  logger.info({ port }, '🚀 FLIC API running');
}

bootstrap().catch((err) => {
  logger.error(err, 'Fatal startup error');
  process.exit(1);
});
