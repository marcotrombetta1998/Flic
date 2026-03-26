import 'dotenv/config';
import { db } from './db/client';
import { users, creators, videos, creditPacks, cpaOffers, fanCards, notifications } from './db/schema';
import { logger } from './lib/logger';

async function seed() {
  logger.info('Seeding FLIC database...');

  // Credit packs
  await db.insert(creditPacks).values([
    { name: 'Starter',  priceEur: '5.00',  creditsBase: 100,  creditsBonus: 0,   badge: null },
    { name: 'Popular',  priceEur: '10.00', creditsBase: 220,  creditsBonus: 20,  badge: null },
    { name: 'Pro',      priceEur: '20.00', creditsBase: 500,  creditsBonus: 80,  badge: 'Most popular' },
    { name: 'Max',      priceEur: '50.00', creditsBase: 1400, creditsBonus: 350, badge: 'Best value' },
  ]).onConflictDoNothing();
  logger.info('Credit packs seeded');

  // CPA offers
  await db.insert(cpaOffers).values([
    { brandName: 'Barilla',  verticals: ['food'],    triggerKeywords: ['pasta','recipe','cook','ingredient'], offerText: 'Get 20% off Barilla pasta via FLIC', ctaLabel: 'Shop now', ctaUrl: 'https://barilla.com?ref=flic', cpaValueEur: '0.50', budgetRemainingEur: '1000.00' },
    { brandName: 'Booking.com', verticals: ['travel'], triggerKeywords: ['hotel','stay','book','accommodation','where to stay'], offerText: 'Save 15% on hotels — FLIC exclusive', ctaLabel: 'Book now', ctaUrl: 'https://booking.com?ref=flic', cpaValueEur: '2.00', budgetRemainingEur: '5000.00' },
    { brandName: 'MyProtein',   verticals: ['fitness'], triggerKeywords: ['protein','supplement','workout','nutrition','shake'], offerText: '25% off MyProtein — code FLIC25', ctaLabel: 'Shop now', ctaUrl: 'https://myprotein.com?ref=flic', cpaValueEur: '1.50', budgetRemainingEur: '2000.00' },
    { brandName: 'eToro',       verticals: ['finance'], triggerKeywords: ['invest','stock','buy','portfolio','crypto','ticker'], offerText: 'Start investing — 0% commission with eToro', ctaLabel: 'Start now', ctaUrl: 'https://etoro.com?ref=flic', cpaValueEur: '10.00', budgetRemainingEur: '10000.00' },
    { brandName: 'GuitarCenter', verticals: ['music'],   triggerKeywords: ['guitar','chord','instrument','learn','play'], offerText: 'Get your first guitar — 10% off at Guitar Center', ctaLabel: 'Shop now', ctaUrl: 'https://guitarcenter.com?ref=flic', cpaValueEur: '3.00', budgetRemainingEur: '3000.00' },
  ]).onConflictDoNothing();
  logger.info('CPA offers seeded');

  // Sample users + creator
  const [adminUser] = await db.insert(users).values({
    email: 'admin@flic.app', username: 'admin', displayName: 'FLIC Admin', role: 'admin', creditsBalance: 9999,
  }).returning().onConflictDoNothing();

  const [creatorUser] = await db.insert(users).values({
    email: 'sofia@flic.app', username: 'sofia_conti', displayName: 'Sofia Conti',
    role: 'creator', creatorTier: 'verified', creditsBalance: 1250,
  }).returning().onConflictDoNothing();

  const [regularUser] = await db.insert(users).values({
    email: 'marco@flic.app', username: 'marco_t', displayName: 'Marco T.', creditsBalance: 450,
  }).returning().onConflictDoNothing();

  if (creatorUser) {
    await db.insert(creators).values({
      id: creatorUser.id,
      bio: 'Travel & food creator from Rome. Sharing authentic Italian recipes and hidden travel gems.',
      verticals: ['travel', 'food'],
      externalFollowers: 128000,
      commissionRate: '0.12',
      isVerified: true,
      subscriptionTiers: [
        { name: 'Bronze', creditsPerMonth: 3, perks: ['Early access', 'Creator badge'] },
        { name: 'Silver', creditsPerMonth: 8, perks: ['All Bronze', 'Monthly Q&A', 'DM once/month'] },
        { name: 'Gold',   creditsPerMonth: 20, perks: ['All Silver', 'Direct messages', 'Fan card airdrop'] },
      ],
    }).onConflictDoNothing();

    // Sample videos
    await db.insert(videos).values([
      {
        creatorId: creatorUser.id,
        title: 'Perfect Carbonara in Rome',
        description: 'Authentic Roman carbonara — no cream, ever! Full step-by-step with local tips.',
        vertical: 'food',
        videoUrl: 'https://storage.flic.app/videos/carbonara.mp4',
        thumbnailUrl: 'https://storage.flic.app/thumbnails/carbonara.jpg',
        durationSeconds: 512,
        unlockCostCredits: 1,
        isPublished: true,
        publishedAt: new Date(),
        viewCount: 12400,
        flicCount: 340,
        unlockCount: 2100,
        aiProcessed: true,
        aiData: {
          ingredients: [
            { name: 'Linguine', qty: 400, unit: 'g' },
            { name: 'Guanciale', qty: 200, unit: 'g' },
            { name: 'Egg yolks', qty: 4, unit: 'pcs' },
            { name: 'Pecorino Romano', qty: 80, unit: 'g' },
            { name: 'Black pepper', qty: 1, unit: 'tbsp' },
          ],
          steps: [
            'Render guanciale in cold pan until crispy',
            'Cook pasta al dente, reserve pasta water',
            'Mix egg yolks with grated Pecorino',
            'Remove pan from heat, add pasta, add egg mixture',
            'Emulsify with pasta water — never cream!',
          ],
          calories: 680,
          prepTime: 25,
          difficulty: 'medium',
          cuisine: 'Italian',
        },
      },
      {
        creatorId: creatorUser.id,
        title: 'Hidden gems in Kyoto — 7-day guide',
        description: 'Complete Kyoto itinerary with off-the-beaten-path spots, costs, and local tips.',
        vertical: 'travel',
        videoUrl: 'https://storage.flic.app/videos/kyoto.mp4',
        thumbnailUrl: 'https://storage.flic.app/thumbnails/kyoto.jpg',
        durationSeconds: 921,
        unlockCostCredits: 2,
        isPublished: true,
        publishedAt: new Date(Date.now() - 86400000),
        viewCount: 28700,
        flicCount: 892,
        unlockCount: 4800,
        aiProcessed: true,
        aiData: {
          locations: [
            { name: 'Fushimi Inari (at 5am)', coords: { lat: 34.9671, lng: 135.7727 }, type: 'shrine', tips: 'Go before 7am to avoid crowds', cost: 'Free', timestamp: 120 },
            { name: 'Philosopher\'s Path', coords: { lat: 35.0253, lng: 135.7955 }, type: 'walk', tips: 'Best in cherry blossom season', cost: 'Free', timestamp: 340 },
            { name: 'Nishiki Market', coords: { lat: 35.0051, lng: 135.7654 }, type: 'food market', tips: 'Try the pickled vegetables and tofu donuts', cost: 'EUR 5-15', timestamp: 580 },
          ],
          totalBudget: 'EUR 800-1200 for 7 days',
          duration: '7 days',
          transport: ['Shinkansen from Tokyo', 'Day passes for buses', 'Bicycle rental'],
        },
      },
    ]).onConflictDoNothing();

    // Fan card
    await db.insert(fanCards).values({
      creatorId: creatorUser.id,
      name: 'Sofia Conti — Verified OG',
      rarity: 'legendary',
      totalSupply: 100,
      minted: 47,
      creditsCost: 25,
      perks: [{ type: 'discount', value: '10% off all unlocks' }, { type: 'access', value: 'Exclusive content' }],
    }).onConflictDoNothing();
  }

  if (regularUser) {
    await db.insert(notifications).values([
      { userId: regularUser.id, type: 'earning',     title: '⚡ Welcome bonus!', body: 'You\'ve received 50 free credits to start exploring FLIC.', data: {} },
      { userId: regularUser.id, type: 'new_content', title: '🎬 New from Sofia Conti!', body: '"Hidden gems in Kyoto" is now live.', data: { videoId: 'sample' } },
    ]).onConflictDoNothing();
  }

  logger.info('✅ Seed complete!');
  process.exit(0);
}

seed().catch((err) => { logger.error(err, 'Seed failed'); process.exit(1); });
