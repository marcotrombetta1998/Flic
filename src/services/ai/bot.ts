import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/client';
import { videos, botConversations, users } from '../../db/schema';
import { openai } from '../../lib/openai';
import { deductCredits, getBalance } from '../credits';
import { matchCpaOffers, shouldShowOffer, logCpaEvent } from '../cpa';

interface BotMessage {
  role: 'user' | 'assistant';
  content: string;
  creditsSpent?: number;
  timestamp: string;
}

interface BotResponse {
  reply: string;
  engagementQuestion: string;
  commercialOffer: CommercialOffer | null;
  creditsSpent: number;
  creditsRemaining: number;
  conversationId: string;
}

interface CommercialOffer {
  offerId: string;
  brandName: string;
  offerText: string;
  ctaLabel: string;
  ctaUrl: string;
}

function buildSystemPrompt(video: Record<string, unknown>, vertical: string): string {
  const aiData = video.aiData as Record<string, unknown> | undefined;
  const creatorName = (video as { creator?: { displayName?: string } }).creator?.displayName ?? 'the creator';

  const base = `You are FLIC Bot — a knowledgeable, enthusiastic assistant for the video "${video.title}" by ${creatorName}.
You have deep knowledge of everything in this video and respond in a friendly, conversational Gen Z tone.
Keep responses under 80 words. Always end with a short engaging follow-up question.
Never make up information not in the video data. If unsure, be honest.`;

  const verticalPrompts: Record<string, string> = {
    food: `
FOOD VIDEO DATA: ${JSON.stringify(aiData ?? {})}
You know every ingredient, measurement, step, technique, and nutritional fact in this recipe.
When asked about ingredients, list them clearly. When asked about steps, be precise.`,
    travel: `
TRAVEL VIDEO DATA: ${JSON.stringify(aiData ?? {})}
You know every location visited, cost breakdown, hotel recommendation, transport tip, and hidden gem mentioned.
Always provide specific details like prices in EUR and exact place names.`,
    fitness: `
FITNESS VIDEO DATA: ${JSON.stringify(aiData ?? {})}
You know every exercise, set/rep scheme, muscle groups targeted, rest periods, and progression tips.
Be precise with numbers and always consider safety.`,
    finance: `
FINANCE VIDEO DATA: ${JSON.stringify(aiData ?? {})}
You know every ticker, strategy, risk level, and time horizon mentioned. 
Always remind users this is educational content, not financial advice.`,
    music: `
MUSIC VIDEO DATA: ${JSON.stringify(aiData ?? {})}
You know every chord, progression, BPM, key, and technique shown in the video.`,
  };

  return base + (verticalPrompts[vertical] ?? `\nVIDEO DATA: ${JSON.stringify(aiData ?? {})}`);
}

const ENGAGEMENT_QUESTIONS: Record<string, string[]> = {
  food: ['Have you tried this dish before? 🍝', 'Which step looks hardest to you?', 'Would you add any twist to this recipe?'],
  travel: ['Have you visited this place? ✈️', 'Which spot would you go to first?', "What's on your travel wishlist?"],
  fitness: ['Have you tried this exercise before? 💪', 'What muscle group are you focusing on?', 'How many reps can you do?'],
  finance: ['Are you already investing in any of these? 📈', 'What\'s your investment time horizon?', 'Have you tried this strategy?'],
  default: ['What did you think of this video? 🎬', 'Would you recommend this to a friend?', 'What part was most useful?'],
};

function getEngagementQuestion(vertical: string): string {
  const questions = ENGAGEMENT_QUESTIONS[vertical] ?? ENGAGEMENT_QUESTIONS.default!;
  return questions[Math.floor(Math.random() * questions.length)]!;
}

function calculateQueryCost(message: string): number {
  const len = message.length;
  if (len > 200) return 3;
  if (len > 100) return 2;
  return 1;
}

export async function handleBotMessage(
  userId: string,
  videoId: string,
  message: string,
  conversationId?: string
): Promise<BotResponse> {
  // 1. Load video
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
  if (!video) throw new Error('Video not found');

  // 2. Get or create conversation
  let conversation;
  if (conversationId) {
    const [existing] = await db.select().from(botConversations).where(eq(botConversations.id, conversationId));
    conversation = existing;
  }
  if (!conversation) {
    const [newConv] = await db
      .insert(botConversations)
      .values({ userId, videoId, messages: [], totalCreditsSpent: 0 })
      .returning();
    conversation = newConv;
  }
  if (!conversation) throw new Error('Failed to create conversation');

  // 3. Deduct credits
  const cost = calculateQueryCost(message);
  await deductCredits(userId, cost, 'query', videoId, { conversationId: conversation.id });

  // 4. Build messages array for GPT
  const history = (conversation.messages as BotMessage[]).slice(-10);
  const systemPrompt = video.botSystemPrompt ?? buildSystemPrompt(video as unknown as Record<string, unknown>, video.vertical);

  const gptMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: message },
  ];

  // 5. Call GPT-4o
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: gptMessages,
    temperature: 0.75,
    max_tokens: 300,
  });
  const reply = completion.choices[0]?.message?.content ?? 'I couldn\'t find an answer to that.';

  // 6. Engagement question
  const engagementQuestion = getEngagementQuestion(video.vertical);

  // 7. CPA offers
  let commercialOffer: CommercialOffer | null = null;
  const totalMsgs = history.length;
  if (shouldShowOffer(conversation.commercialOffersShown, totalMsgs)) {
    const offers = await matchCpaOffers(message, video.vertical);
    if (offers.length > 0) {
      const offer = offers[0]!;
      commercialOffer = {
        offerId: offer.id,
        brandName: offer.brandName,
        offerText: offer.offerText,
        ctaLabel: offer.ctaLabel,
        ctaUrl: offer.ctaUrl,
      };
      await logCpaEvent(offer.id, userId, videoId, conversation.id, 'shown');
      await db
        .update(botConversations)
        .set({ commercialOffersShown: conversation.commercialOffersShown + 1 })
        .where(eq(botConversations.id, conversation.id));
    }
  }

  // 8. Save messages
  const updatedMessages: BotMessage[] = [
    ...history,
    { role: 'user', content: message, creditsSpent: cost, timestamp: new Date().toISOString() },
    { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
  ];
  await db
    .update(botConversations)
    .set({
      messages: updatedMessages,
      totalCreditsSpent: conversation.totalCreditsSpent + cost,
      updatedAt: new Date(),
    })
    .where(eq(botConversations.id, conversation.id));

  // Increment flic count
  await db.update(videos).set({ flicCount: video.flicCount + 1 }).where(eq(videos.id, videoId));

  const creditsRemaining = await getBalance(userId);

  return {
    reply,
    engagementQuestion,
    commercialOffer,
    creditsSpent: cost,
    creditsRemaining,
    conversationId: conversation.id,
  };
}
