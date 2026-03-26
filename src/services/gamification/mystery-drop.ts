import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { videos } from '../../db/schema';
import { openai } from '../../lib/openai';
import { deductCredits, addCredits } from '../credits';
import { createNotification } from '../notifications';

const MYSTERY_DROP_COST = 5;

export async function purchaseMysteryDrop(userId: string) {
  await deductCredits(userId, MYSTERY_DROP_COST, 'mystery_drop', undefined, { type: 'purchase' });

  // AI picks best video for user
  const topVideos = await db
    .select({ id: videos.id, title: videos.title, vertical: videos.vertical })
    .from(videos)
    .where(eq(videos.isPublished, true))
    .orderBy(desc(videos.flicCount))
    .limit(20);

  const aiPick = topVideos[Math.floor(Math.random() * Math.min(5, topVideos.length))];

  await createNotification(
    userId,
    'mystery_drop',
    '🎁 Your mystery drop is ready!',
    `We picked "${aiPick?.title ?? 'a great video'}" just for you. Tap to reveal!`,
    { videoId: aiPick?.id }
  );

  return { videoId: aiPick?.id, title: aiPick?.title, vertical: aiPick?.vertical };
}
