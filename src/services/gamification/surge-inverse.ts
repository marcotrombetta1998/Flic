import { redis } from '../../lib/redis';

interface SurgeData {
  spotsTotal: number;
  spotsRemaining: number;
  discountPct: number;
  expiresAt: number;
}

export async function activateSurgeInverse(
  videoId: string,
  spotsTotal = 50,
  discountPct = 50,
  durationSeconds = 3600
): Promise<void> {
  const data: SurgeData = {
    spotsTotal,
    spotsRemaining: spotsTotal,
    discountPct,
    expiresAt: Date.now() + durationSeconds * 1000,
  };
  await redis.setex(`surge:${videoId}`, durationSeconds, JSON.stringify(data));
}

export async function checkSurgePrice(videoId: string, baseCredits: number): Promise<number> {
  const raw = await redis.get(`surge:${videoId}`);
  if (!raw) return baseCredits;
  const surge: SurgeData = JSON.parse(raw);
  if (surge.spotsRemaining <= 0 || Date.now() > surge.expiresAt) return baseCredits;
  await redis.set(`surge:${videoId}`, JSON.stringify({ ...surge, spotsRemaining: surge.spotsRemaining - 1 }), 'KEEPTTL');
  return Math.max(1, Math.floor(baseCredits * (1 - surge.discountPct / 100)));
}

export async function getSurgeStatus(videoId: string): Promise<SurgeData | null> {
  const raw = await redis.get(`surge:${videoId}`);
  if (!raw) return null;
  const surge: SurgeData = JSON.parse(raw);
  if (Date.now() > surge.expiresAt) { await redis.del(`surge:${videoId}`); return null; }
  return surge;
}
