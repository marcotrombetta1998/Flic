import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db/client';
import { notifications } from '../db/schema';
import type { InferSelectModel } from 'drizzle-orm';

type NotifType = InferSelectModel<typeof notifications>['type'];

export async function createNotification(
  userId: string,
  type: NotifType,
  title: string,
  body: string,
  data: Record<string, unknown>
) {
  const [notif] = await db.insert(notifications).values({ userId, type, title, body, data }).returning();
  return notif;
}

export async function getNotifications(userId: string, limit = 30) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markAsRead(userId: string, notificationId?: string) {
  if (notificationId) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  } else {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }
}
