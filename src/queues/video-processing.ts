import { Queue, Worker } from 'bullmq';
import { eq } from 'drizzle-orm';
import { redis } from '../lib/redis';
import { db } from '../db/client';
import { videos, aiKnowledgeGraph } from '../db/schema';
import { transcribeVideo } from '../services/ai/transcription';
import { extractStructuredData, buildBotSystemPrompt } from '../services/ai/extraction';
import { createNotification } from '../services/notifications';
import { logger } from '../lib/logger';

export const videoProcessingQueue = new Queue('video-processing', { connection: redis });

export function startVideoProcessingWorker() {
  const worker = new Worker(
    'video-processing',
    async (job) => {
      const { videoId, videoPath } = job.data as { videoId: string; videoPath: string };
      logger.info({ videoId }, 'Starting AI pipeline');

      const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
      if (!video) throw new Error(`Video ${videoId} not found`);

      // Step 1: Transcription
      await job.updateProgress(10);
      logger.info({ videoId }, 'Step 1: Transcription');
      const { text: transcript } = await transcribeVideo(videoPath);
      await db.update(videos).set({ transcript }).where(eq(videos.id, videoId));

      // Step 2: Structured extraction
      await job.updateProgress(40);
      logger.info({ videoId, vertical: video.vertical }, 'Step 2: Structured extraction');
      const aiData = await extractStructuredData(transcript, video.vertical);
      await db.update(videos).set({ aiData }).where(eq(videos.id, videoId));

      // Step 3: Knowledge graph
      await job.updateProgress(65);
      logger.info({ videoId }, 'Step 3: Knowledge graph');
      const entities = extractEntitiesFromAiData(aiData, video.vertical);
      if (entities.length > 0) {
        await db.insert(aiKnowledgeGraph).values(
          entities.map((e) => ({ ...e, videoId, confidence: '0.85' }))
        );
      }

      // Step 4: Bot system prompt
      await job.updateProgress(85);
      logger.info({ videoId }, 'Step 4: Building bot context');
      const botSystemPrompt = await buildBotSystemPrompt(video.title, video.vertical, aiData);
      await db
        .update(videos)
        .set({ botSystemPrompt, aiProcessed: true })
        .where(eq(videos.id, videoId));

      // Step 5: Notify creator
      await job.updateProgress(100);
      await createNotification(
        video.creatorId,
        'new_content',
        '🤖 AI processing complete!',
        `Your video "${video.title}" is now fully AI-powered and ready for FLICs.`,
        { videoId }
      );

      logger.info({ videoId }, 'AI pipeline complete');
    },
    { connection: redis, concurrency: 3 }
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'Video processing job failed');
  });

  return worker;
}

function extractEntitiesFromAiData(aiData: Record<string, unknown>, vertical: string) {
  const entities: Array<{ entityType: string; entityName: string; entityData: Record<string, unknown> }> = [];

  if (vertical === 'food') {
    const ingredients = aiData.ingredients as Array<{ name: string }> | undefined;
    ingredients?.forEach((ing) => {
      entities.push({ entityType: 'recipe', entityName: ing.name, entityData: ing as unknown as Record<string, unknown> });
    });
  } else if (vertical === 'travel') {
    const locations = aiData.locations as Array<{ name: string }> | undefined;
    locations?.forEach((loc) => {
      entities.push({ entityType: 'location', entityName: loc.name, entityData: loc as unknown as Record<string, unknown> });
    });
  } else if (vertical === 'fitness') {
    const exercises = aiData.exercises as Array<{ name: string }> | undefined;
    exercises?.forEach((ex) => {
      entities.push({ entityType: 'exercise', entityName: ex.name, entityData: ex as unknown as Record<string, unknown> });
    });
  }

  return entities;
}
