import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

export type CreatorTier = 'VERIFIED' | 'RISING' | 'ASPIRING';

export interface Creator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
  tier: CreatorTier;
  followers: number;
  totalFLICs: number;
  unlockRate: number;
  verticals: string[];
  isSubscribed: boolean;
  isFollowed: boolean;
}

export interface Video {
  id: string;
  creatorId: string;
  creator: Creator;
  title: string;
  caption: string;
  thumbnail: string;
  videoUrl: string;
  duration: number;
  views: number;
  flics: number;
  replicas: number;
  unlocks: number;
  unlockCost: number;
  isUnlocked: boolean;
  vertical: string;
  tags: string[];
  publishedAt: string;
  aiData?: {
    type: 'travel' | 'food' | 'fitness' | 'finance' | 'music';
    data: Record<string, string>;
  };
}

export interface Message {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: string;
  offerCard?: CommercialOffer;
}

export interface CommercialOffer {
  id: string;
  brand: string;
  title: string;
  description: string;
  discount: string;
  ctaUrl: string;
  logoEmoji: string;
}

export interface Conversation {
  videoId: string;
  messages: Message[];
}

export interface Notification {
  id: string;
  type: 'flic' | 'unlock' | 'reply' | 'earn' | 'surge' | 'fancard';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'spend' | 'earn' | 'bonus';
  amount: number;
  description: string;
  timestamp: string;
}

export interface FanCard {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  edition: string;
  total: number;
  rarity: 'Common' | 'Rare' | 'Legendary';
  acquiredAt: string;
}

export interface CreditPack {
  id: string;
  credits: number;
  bonus: number;
  priceEur: number;
  badge?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CREATORS: Creator[] = [
  {
    id: 'c1',
    name: 'Sofia Marchetti',
    username: '@sofiamarchetti',
    avatar: 'https://i.pravatar.cc/150?img=47',
    coverImage: 'https://picsum.photos/seed/c1cover/800/300',
    bio: 'Travel creator · 47 countries · I answer every question ✈️',
    tier: 'VERIFIED',
    followers: 248000,
    totalFLICs: 19200,
    unlockRate: 0.74,
    verticals: ['Travel', 'Lifestyle'],
    isSubscribed: true,
    isFollowed: true,
  },
  {
    id: 'c2',
    name: 'Luca Ferretti',
    username: '@lucaferretti.chef',
    avatar: 'https://i.pravatar.cc/150?img=12',
    coverImage: 'https://picsum.photos/seed/c2cover/800/300',
    bio: 'Michelin-trained chef. Every ingredient has a story 🍝',
    tier: 'VERIFIED',
    followers: 312000,
    totalFLICs: 28700,
    unlockRate: 0.81,
    verticals: ['Food', 'Cooking'],
    isSubscribed: false,
    isFollowed: true,
  },
  {
    id: 'c3',
    name: 'Mia Chen',
    username: '@mia.moves',
    avatar: 'https://i.pravatar.cc/150?img=5',
    coverImage: 'https://picsum.photos/seed/c3cover/800/300',
    bio: 'NASM certified · Your questions build better workouts 💪',
    tier: 'RISING',
    followers: 87000,
    totalFLICs: 6400,
    unlockRate: 0.62,
    verticals: ['Fitness', 'Wellness'],
    isSubscribed: false,
    isFollowed: false,
  },
  {
    id: 'c4',
    name: 'Jake Williams',
    username: '@jakewilliams.finance',
    avatar: 'https://i.pravatar.cc/150?img=33',
    coverImage: 'https://picsum.photos/seed/c4cover/800/300',
    bio: 'Ex-Goldman. Broke finance so anyone can understand it 📈',
    tier: 'VERIFIED',
    followers: 445000,
    totalFLICs: 41200,
    unlockRate: 0.88,
    verticals: ['Finance', 'Business'],
    isSubscribed: true,
    isFollowed: true,
  },
  {
    id: 'c5',
    name: 'Aria Santos',
    username: '@ariasantos.music',
    avatar: 'https://i.pravatar.cc/150?img=9',
    coverImage: 'https://picsum.photos/seed/c5cover/800/300',
    bio: 'Songwriter, producer & music theory nerd 🎵',
    tier: 'RISING',
    followers: 54000,
    totalFLICs: 3100,
    unlockRate: 0.55,
    verticals: ['Music', 'Creative'],
    isSubscribed: false,
    isFollowed: false,
  },
  {
    id: 'c6',
    name: 'Marco Ricci',
    username: '@marco.ricci.sport',
    avatar: 'https://i.pravatar.cc/150?img=18',
    coverImage: 'https://picsum.photos/seed/c6cover/800/300',
    bio: 'Pro athlete turned coach. Data-driven performance 🏆',
    tier: 'ASPIRING',
    followers: 12000,
    totalFLICs: 890,
    unlockRate: 0.41,
    verticals: ['Sport', 'Fitness'],
    isSubscribed: false,
    isFollowed: false,
  },
  {
    id: 'c7',
    name: 'Zara Kim',
    username: '@zarakim.travel',
    avatar: 'https://i.pravatar.cc/150?img=25',
    coverImage: 'https://picsum.photos/seed/c7cover/800/300',
    bio: 'Budget travel queen. 30+ countries under €500/month 🌍',
    tier: 'RISING',
    followers: 128000,
    totalFLICs: 9800,
    unlockRate: 0.69,
    verticals: ['Travel', 'Budget'],
    isSubscribed: false,
    isFollowed: true,
  },
  {
    id: 'c8',
    name: 'David Okafor',
    username: '@davidokafor.eats',
    avatar: 'https://i.pravatar.cc/150?img=68',
    coverImage: 'https://picsum.photos/seed/c8cover/800/300',
    bio: 'Street food hunter. Lagos to Tokyo, one bite at a time 🌶️',
    tier: 'ASPIRING',
    followers: 29000,
    totalFLICs: 2200,
    unlockRate: 0.48,
    verticals: ['Food', 'Street Food'],
    isSubscribed: false,
    isFollowed: false,
  },
];

const CREATORS_MAP: Record<string, Creator> = Object.fromEntries(CREATORS.map(c => [c.id, c]));

const VIDEOS: Video[] = [
  {
    id: 'v1',
    creatorId: 'c1',
    creator: CREATORS_MAP['c1'],
    title: 'Hidden Amalfi Coast spots that locals keep secret',
    caption:
      "I spent 3 weeks mapping every hidden cove and off-menu restaurant on the Amalfi Coast. Ask me anything — best time to visit, cheapest ferry routes, where to stay for under €80/night. This video has all the data.",
    thumbnail: 'https://picsum.photos/seed/v1/600/340',
    videoUrl: '',
    duration: 487,
    views: 142000,
    flics: 3240,
    replicas: 182,
    unlocks: 890,
    unlockCost: 5,
    isUnlocked: false,
    vertical: 'Travel',
    tags: ['Italy', 'Amalfi', 'Travel', 'Budget'],
    publishedAt: '2026-03-24T09:00:00Z',
    aiData: {
      type: 'travel',
      data: {
        'Best Month': 'May or September',
        'Budget/day': '€80–120',
        'Ferry pass': '€25 (3-day)',
        'Secret cove': 'Fiordo di Furore',
        'Top restaurant': 'Da Adolfo (boat access)',
      },
    },
  },
  {
    id: 'v2',
    creatorId: 'c2',
    creator: CREATORS_MAP['c2'],
    title: 'Making authentic Cacio e Pepe — the chef\'s secret ratio',
    caption:
      "This dish has 3 ingredients and takes 12 minutes. Yet 90% of people get it wrong. I'm sharing the exact gram-level ratios I use at the restaurant. FLIC me to get the full proportions + technique unlocked.",
    thumbnail: 'https://picsum.photos/seed/v2/600/340',
    videoUrl: '',
    duration: 312,
    views: 298000,
    flics: 8700,
    replicas: 421,
    unlocks: 2100,
    unlockCost: 3,
    isUnlocked: true,
    vertical: 'Food',
    tags: ['Italian', 'Pasta', 'Cooking', 'Recipe'],
    publishedAt: '2026-03-23T14:30:00Z',
    aiData: {
      type: 'food',
      data: {
        Pasta: 'Tonnarelli 100g/person',
        'Pecorino Romano': '50g per portion',
        'Black Pepper': '2g, freshly cracked',
        'Water temp': '65°C for emulsion',
        Technique: 'Off-heat, constant stirring',
      },
    },
  },
  {
    id: 'v3',
    creatorId: 'c3',
    creator: CREATORS_MAP['c3'],
    title: '30-min full body burn — zero equipment needed',
    caption:
      "This circuit is based on the training plan I built for 200+ clients. Progressive overload, zero equipment. FLIC me to get your personalized version based on your fitness level.",
    thumbnail: 'https://picsum.photos/seed/v3/600/340',
    videoUrl: '',
    duration: 1860,
    views: 67000,
    flics: 1800,
    replicas: 94,
    unlocks: 310,
    unlockCost: 4,
    isUnlocked: false,
    vertical: 'Fitness',
    tags: ['Workout', 'HIIT', 'NoEquipment', 'Fitness'],
    publishedAt: '2026-03-22T07:00:00Z',
    aiData: {
      type: 'fitness',
      data: {
        'Round 1': 'Burpees 45s / 15s rest',
        'Round 2': 'Jump Squats 45s / 15s rest',
        'Round 3': 'Mountain Climbers 45s / 15s rest',
        'Round 4': 'Push-up Rows 45s / 15s rest',
        Recovery: '90s between circuits',
      },
    },
  },
  {
    id: 'v4',
    creatorId: 'c4',
    creator: CREATORS_MAP['c4'],
    title: 'Why your savings account is stealing from you (fix it)',
    caption:
      "The average EU savings account returns 0.4%. Inflation is 3.2%. You're losing 2.8% every year doing nothing. I break down exactly where to move your money in 2026. FLIC for the exact ETF allocations.",
    thumbnail: 'https://picsum.photos/seed/v4/600/340',
    videoUrl: '',
    duration: 624,
    views: 521000,
    flics: 14200,
    replicas: 2100,
    unlocks: 5800,
    unlockCost: 8,
    isUnlocked: false,
    vertical: 'Finance',
    tags: ['Investing', 'ETF', 'Finance', 'Money'],
    publishedAt: '2026-03-21T18:00:00Z',
    aiData: {
      type: 'finance',
      data: {
        'EU Inflation 2026': '3.2%',
        'Avg savings rate': '0.4%',
        'Real loss/year': '-2.8%',
        'ETF pick 1': 'VWCE (80%)',
        'ETF pick 2': 'IGLN (20%)',
      },
    },
  },
  {
    id: 'v5',
    creatorId: 'c5',
    creator: CREATORS_MAP['c5'],
    title: 'The chord progression behind every viral pop song',
    caption:
      "I analyzed 100 songs that hit #1 in 2025. 73% use the same 4-chord trick. I'll show you what it is, why it works neurologically, and how to put your own spin on it.",
    thumbnail: 'https://picsum.photos/seed/v5/600/340',
    videoUrl: '',
    duration: 428,
    views: 43000,
    flics: 920,
    replicas: 67,
    unlocks: 180,
    unlockCost: 3,
    isUnlocked: false,
    vertical: 'Music',
    tags: ['Music', 'Production', 'Songwriting', 'Theory'],
    publishedAt: '2026-03-20T11:00:00Z',
  },
  {
    id: 'v6',
    creatorId: 'c7',
    creator: CREATORS_MAP['c7'],
    title: 'Tokyo for under €400 — 7 days, complete guide',
    caption:
      "I just came back from 7 days in Tokyo on €387 total, flights included. Here's every hack, every cheap-but-amazing eat, and the exact itinerary. FLIC me with your dates and I'll build your custom plan.",
    thumbnail: 'https://picsum.photos/seed/v6/600/340',
    videoUrl: '',
    duration: 712,
    views: 189000,
    flics: 5600,
    replicas: 340,
    unlocks: 1200,
    unlockCost: 6,
    isUnlocked: false,
    vertical: 'Travel',
    tags: ['Tokyo', 'Japan', 'Budget', 'Travel'],
    publishedAt: '2026-03-19T08:00:00Z',
    aiData: {
      type: 'travel',
      data: {
        'Total budget': '€387 (flights incl.)',
        Accommodation: '€18/night (capsule hotel)',
        'Daily food': '€12–15',
        Transport: 'IC Card + day pass',
        'Best area': 'Shimokitazawa (local vibe)',
      },
    },
  },
  {
    id: 'v7',
    creatorId: 'c6',
    creator: CREATORS_MAP['c6'],
    title: 'VO2max training: why you\'re doing zone 2 wrong',
    caption:
      "Most athletes train too hard on easy days and too easy on hard days. The polarized model fixed my VO2max by 8 points in 12 weeks. Here's the exact protocol.",
    thumbnail: 'https://picsum.photos/seed/v7/600/340',
    videoUrl: '',
    duration: 548,
    views: 31000,
    flics: 780,
    replicas: 45,
    unlocks: 120,
    unlockCost: 4,
    isUnlocked: false,
    vertical: 'Sport',
    tags: ['Training', 'Endurance', 'VO2max', 'Sport'],
    publishedAt: '2026-03-18T06:30:00Z',
  },
  {
    id: 'v8',
    creatorId: 'c8',
    creator: CREATORS_MAP['c8'],
    title: 'Best street food cities in Europe — my definitive ranking',
    caption:
      "I've eaten street food in 24 European cities over 2 years. I'm ranking them based on diversity, quality, and price. Spoiler: #1 will surprise you.",
    thumbnail: 'https://picsum.photos/seed/v8/600/340',
    videoUrl: '',
    duration: 392,
    views: 58000,
    flics: 1640,
    replicas: 98,
    unlocks: 320,
    unlockCost: 3,
    isUnlocked: false,
    vertical: 'Food',
    tags: ['StreetFood', 'Europe', 'Food', 'Travel'],
    publishedAt: '2026-03-17T12:00:00Z',
  },
  {
    id: 'v9',
    creatorId: 'c1',
    creator: CREATORS_MAP['c1'],
    title: 'Santorini in 48h: what actually matters vs Instagram lies',
    caption:
      "The famous blue domes? 20 minute walk from the main tourist path. I'll show you how to actually experience Santorini without the crowds or the €200 restaurant bills.",
    thumbnail: 'https://picsum.photos/seed/v9/600/340',
    videoUrl: '',
    duration: 521,
    views: 204000,
    flics: 6100,
    replicas: 290,
    unlocks: 1450,
    unlockCost: 5,
    isUnlocked: false,
    vertical: 'Travel',
    tags: ['Greece', 'Santorini', 'Travel', 'Tips'],
    publishedAt: '2026-03-16T10:00:00Z',
  },
  {
    id: 'v10',
    creatorId: 'c4',
    creator: CREATORS_MAP['c4'],
    title: 'Compound interest: the honest math nobody shows you',
    caption:
      "€100/month from age 25 vs €200/month from age 35. The difference at 65 is insane. I'm doing the actual math with real historical market returns, not the marketing BS.",
    thumbnail: 'https://picsum.photos/seed/v10/600/340',
    videoUrl: '',
    duration: 445,
    views: 389000,
    flics: 11800,
    replicas: 1700,
    unlocks: 4200,
    unlockCost: 6,
    isUnlocked: true,
    vertical: 'Finance',
    tags: ['Investing', 'Compound', 'Wealth', 'Finance'],
    publishedAt: '2026-03-15T16:00:00Z',
  },
];

const CONVERSATIONS: Conversation[] = [
  {
    videoId: 'v1',
    messages: [
      {
        id: 'm1',
        role: 'bot',
        content:
          "Ciao! I'm FLIC — Sofia's AI for this video. I can answer anything about the Amalfi Coast: hidden spots, ferry routes, accommodation, food, the best times to visit. What do you want to know? 🌊",
        timestamp: '2026-03-24T09:01:00Z',
      },
      {
        id: 'm2',
        role: 'user',
        content: 'What\'s the cheapest time to visit?',
        timestamp: '2026-03-24T09:03:00Z',
      },
      {
        id: 'm3',
        role: 'bot',
        content:
          "Great question! May and September are the sweet spots — about 40% cheaper than July–August, much less crowded, and the water is still warm enough to swim. Sofia specifically recommends the second week of September when the summer crowds have left but the weather is still perfect. Accommodation can drop from €180/night to under €70. Want me to break down the exact costs? 🗓️",
        timestamp: '2026-03-24T09:03:10Z',
      },
      {
        id: 'm4',
        role: 'user',
        content: 'Yes! And what about the hidden coves?',
        timestamp: '2026-03-24T09:04:00Z',
      },
      {
        id: 'm5',
        role: 'bot',
        content:
          "Sofia mapped 11 hidden coves — the most stunning is Fiordo di Furore, only accessible by a small boat or a steep 20-min hike. It's featured in exactly 0 tourist brochures but has been featured in Italian Vogue 3 times. For the full list with GPS coordinates, you can unlock Sofia's detailed guide — it's 5 credits and includes a downloadable map. Want to unlock it? 🗺️",
        timestamp: '2026-03-24T09:04:15Z',
        offerCard: {
          id: 'oc1',
          brand: 'Sofia\'s Amalfi Guide',
          title: 'Complete Hidden Coves Map',
          description: '11 GPS-tagged secret spots + ferry hacks + restaurant list',
          discount: '5 credits',
          ctaUrl: '',
          logoEmoji: '🗺️',
        },
      },
    ],
  },
  {
    videoId: 'v2',
    messages: [
      {
        id: 'm6',
        role: 'bot',
        content:
          "Benvenuto! I'm FLIC, Luca's AI for this Cacio e Pepe video. Ask me anything — ratios, technique, what to substitute, how to scale for 10 people, anything. What's your question? 🍝",
        timestamp: '2026-03-23T14:31:00Z',
      },
      {
        id: 'm7',
        role: 'user',
        content: 'Can I substitute Pecorino with Parmesan?',
        timestamp: '2026-03-23T14:33:00Z',
      },
      {
        id: 'm8',
        role: 'bot',
        content:
          "You can, but Luca says it's a different dish at that point — Parmesan is milder and melts differently. If you do substitute, use a 70/30 Parmesan/Pecorino blend and add an extra half teaspoon of cracked pepper to compensate. Also reduce the water temperature to 60°C as Parmesan is more heat-sensitive. Italians will judge you, but it'll still taste amazing. 😄 What else do you want to know?",
        timestamp: '2026-03-23T14:33:12Z',
      },
    ],
  },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'flic',
    title: 'Someone FLICed your video!',
    body: '@travelbug99 asked: "What\'s the best month to visit?" on your Amalfi video',
    timestamp: '2026-03-26T08:45:00Z',
    isRead: false,
    avatar: 'https://i.pravatar.cc/50?img=14',
  },
  {
    id: 'n2',
    type: 'earn',
    title: '⚡ You earned 12 credits today',
    body: 'Your Amalfi video generated 12 credits from FLICs and unlocks',
    timestamp: '2026-03-26T08:00:00Z',
    isRead: false,
  },
  {
    id: 'n3',
    type: 'surge',
    title: '🔥 Surge pricing on: Finance',
    body: '23 spots left at half price for Jake Williams content. Ends in 4h',
    timestamp: '2026-03-26T07:30:00Z',
    isRead: false,
  },
  {
    id: 'n4',
    type: 'fancard',
    title: '🎴 New Fan Card available!',
    body: 'Sofia Marchetti just released 100 limited Amalfi edition fan cards',
    timestamp: '2026-03-25T20:00:00Z',
    isRead: true,
  },
  {
    id: 'n5',
    type: 'reply',
    title: 'Sofia replied to your question',
    body: '"Great question! The September timing is perfect because…"',
    timestamp: '2026-03-25T18:30:00Z',
    isRead: true,
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 'n6',
    type: 'unlock',
    title: '🔓 @fitnessbro unlocked your guide',
    body: 'Your 30-min workout guide was unlocked — you earned 3 credits',
    timestamp: '2026-03-25T16:00:00Z',
    isRead: true,
  },
  {
    id: 'n7',
    type: 'flic',
    title: 'Your video is trending 🔥',
    body: '47 people FLICed your finance video in the last 2 hours',
    timestamp: '2026-03-25T14:00:00Z',
    isRead: true,
  },
  {
    id: 'n8',
    type: 'earn',
    title: '💰 Weekly earnings: €34.80',
    body: 'Your content earned €34.80 this week from 28 FLICs and 12 unlocks',
    timestamp: '2026-03-24T12:00:00Z',
    isRead: true,
  },
  {
    id: 'n9',
    type: 'surge',
    title: '⚡ Surge inverse: Travel vertical',
    body: 'Earn 2x credits on Travel FLICs today. 6 hours remaining.',
    timestamp: '2026-03-24T09:00:00Z',
    isRead: true,
  },
  {
    id: 'n10',
    type: 'flic',
    title: 'New FLIC from @zara.explore',
    body: 'Asked: "What are your top budget tips for Tokyo under €500?"',
    timestamp: '2026-03-23T22:00:00Z',
    isRead: true,
    avatar: 'https://i.pravatar.cc/50?img=25',
  },
];

const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: 'purchase',
    amount: 50,
    description: 'Purchased Starter Pack (€5)',
    timestamp: '2026-03-26T07:00:00Z',
  },
  {
    id: 't2',
    type: 'spend',
    amount: -8,
    description: 'Unlocked Jake Williams Finance Guide',
    timestamp: '2026-03-25T18:00:00Z',
  },
  {
    id: 't3',
    type: 'earn',
    amount: 12,
    description: 'Earnings from Amalfi video FLICs',
    timestamp: '2026-03-25T08:00:00Z',
  },
  {
    id: 't4',
    type: 'spend',
    amount: -5,
    description: 'FLICed Sofia Marchetti - Santorini Guide',
    timestamp: '2026-03-24T14:00:00Z',
  },
  {
    id: 't5',
    type: 'bonus',
    amount: 10,
    description: 'SpinWheel jackpot! 🎉',
    timestamp: '2026-03-24T10:30:00Z',
  },
  {
    id: 't6',
    type: 'spend',
    amount: -3,
    description: 'FLICed Luca Ferretti - Cacio e Pepe',
    timestamp: '2026-03-23T14:00:00Z',
  },
  {
    id: 't7',
    type: 'earn',
    amount: 8,
    description: 'Earnings from workout video unlocks',
    timestamp: '2026-03-22T09:00:00Z',
  },
  {
    id: 't8',
    type: 'purchase',
    amount: 120,
    description: 'Purchased Creator Pack (€10)',
    timestamp: '2026-03-20T16:00:00Z',
  },
];

const FAN_CARDS: FanCard[] = [
  {
    id: 'fc1',
    creatorId: 'c1',
    creatorName: 'Sofia Marchetti',
    creatorAvatar: 'https://i.pravatar.cc/150?img=47',
    edition: '47',
    total: 100,
    rarity: 'Rare',
    acquiredAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 'fc2',
    creatorId: 'c4',
    creatorName: 'Jake Williams',
    creatorAvatar: 'https://i.pravatar.cc/150?img=33',
    edition: '12',
    total: 50,
    rarity: 'Legendary',
    acquiredAt: '2026-03-18T14:00:00Z',
  },
  {
    id: 'fc3',
    creatorId: 'c2',
    creatorName: 'Luca Ferretti',
    creatorAvatar: 'https://i.pravatar.cc/150?img=12',
    edition: '88',
    total: 200,
    rarity: 'Common',
    acquiredAt: '2026-03-15T08:00:00Z',
  },
];

export const CREDIT_PACKS: CreditPack[] = [
  { id: 'p1', credits: 50, bonus: 0, priceEur: 5 },
  { id: 'p2', credits: 120, bonus: 20, priceEur: 10 },
  { id: 'p3', credits: 280, bonus: 80, priceEur: 20, badge: '🔥 Most popular' },
  { id: 'p4', credits: 600, bonus: 200, priceEur: 50, badge: '⚡ Best value' },
];

// ─── Zustand Stores ─────────────────────────────────────────────────────────

interface UserState {
  userId: string;
  name: string;
  username: string;
  avatar: string;
  isCreator: boolean;
  hasOnboarded: boolean;
  setHasOnboarded: (v: boolean) => void;
  setIsCreator: (v: boolean) => void;
}

interface FeedState {
  videos: Video[];
  loading: boolean;
  refreshFeed: () => void;
}

interface PlayerState {
  currentVideoId: string | null;
  isPlaying: boolean;
  setCurrentVideo: (id: string) => void;
  setIsPlaying: (v: boolean) => void;
}

interface ChatState {
  conversations: Record<string, Conversation>;
  sendMessage: (videoId: string, content: string) => void;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
}

interface WalletState {
  creditsBalance: number;
  transactions: Transaction[];
  fanCards: FanCard[];
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => void;
}

interface CreatorState {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalFLICs: number;
  unlockRate: number;
  chartData: number[];
}

// Merge all state slices
type AppStore = UserState &
  FeedState &
  PlayerState &
  ChatState &
  NotificationsState &
  WalletState &
  CreatorState & {
    creators: Creator[];
    getCreator: (id: string) => Creator | undefined;
    getVideosByCreator: (creatorId: string) => Video[];
  };

export const useStore = create<AppStore>((set, get) => ({
  // User
  userId: 'u1',
  name: 'Marco Trombetta',
  username: '@marcotrombetta',
  avatar: 'https://i.pravatar.cc/150?img=52',
  isCreator: true,
  hasOnboarded: false,
  setHasOnboarded: (v) => set({ hasOnboarded: v }),
  setIsCreator: (v) => set({ isCreator: v }),

  // Feed
  videos: VIDEOS,
  loading: false,
  refreshFeed: () => {
    set({ loading: true });
    setTimeout(() => set({ loading: false }), 1000);
  },

  // Player
  currentVideoId: null,
  isPlaying: false,
  setCurrentVideo: (id) => set({ currentVideoId: id }),
  setIsPlaying: (v) => set({ isPlaying: v }),

  // Chat
  conversations: Object.fromEntries(CONVERSATIONS.map((c) => [c.videoId, c])),
  sendMessage: (videoId, content) => {
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    const botMsg: Message = {
      id: `msg_${Date.now() + 1}`,
      role: 'bot',
      content: `Great question! Based on the video content, ${content.toLowerCase().includes('?') ? "here's what you need to know:" : "I can tell you that"} this is something the creator covers in detail. Would you like me to unlock the full AI analysis for this video? 🔍`,
      timestamp: new Date(Date.now() + 1500).toISOString(),
    };
    set((state) => {
      const existing = state.conversations[videoId] ?? { videoId, messages: [] };
      return {
        conversations: {
          ...state.conversations,
          [videoId]: {
            ...existing,
            messages: [...existing.messages, userMsg, botMsg],
          },
        },
      };
    });
  },

  // Notifications
  notifications: NOTIFICATIONS,
  unreadCount: NOTIFICATIONS.filter((n) => !n.isRead).length,
  markAllRead: () =>
    set({
      notifications: NOTIFICATIONS.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }),

  // Wallet
  creditsBalance: 124,
  transactions: TRANSACTIONS,
  fanCards: FAN_CARDS,
  addCredits: (amount) => set((state) => ({ creditsBalance: state.creditsBalance + amount })),
  spendCredits: (amount) =>
    set((state) => ({ creditsBalance: Math.max(0, state.creditsBalance - amount) })),

  // Creator dashboard
  todayEarnings: 4.8,
  weekEarnings: 34.8,
  monthEarnings: 127.4,
  totalFLICs: 19200,
  unlockRate: 0.74,
  chartData: [12, 18, 9, 24, 31, 28, 42, 38, 45, 52, 48, 61, 58, 70],

  // Creators
  creators: CREATORS,
  getCreator: (id) => CREATORS_MAP[id],
  getVideosByCreator: (creatorId) => VIDEOS.filter((v) => v.creatorId === creatorId),
}));

export { CREATORS, VIDEOS };
