import {
  pgTable, pgEnum, uuid, varchar, text, integer, boolean,
  decimal, timestamp, jsonb, index,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['user', 'creator', 'admin']);
export const creatorTierEnum = pgEnum('creator_tier', ['aspiring', 'rising', 'verified']);
export const verticalEnum = pgEnum('vertical', ['travel', 'food', 'fitness', 'finance', 'music', 'interior', 'sport']);
export const entityTypeEnum = pgEnum('entity_type', ['location', 'product', 'person', 'recipe', 'exercise', 'ticker', 'chord']);
export const creditTxTypeEnum = pgEnum('credit_tx_type', [
  'purchase', 'query', 'unlock', 'subscription', 'reward',
  'spin_bonus', 'mystery_drop', 'cpa_commission', 'creator_earning',
]);
export const spinPrizeTypeEnum = pgEnum('spin_prize_type', ['multiplier', 'bonus_credits', 'mystery_drop', 'free_query']);
export const fanCardRarityEnum = pgEnum('fan_card_rarity', ['common', 'rare', 'legendary']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'cancelled', 'past_due']);
export const cpaEventTypeEnum = pgEnum('cpa_event_type', ['shown', 'clicked', 'converted']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'unlock', 'comment', 'earning', 'mystery_drop', 'surge', 'tier_upgrade', 'new_content',
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  email:                 varchar('email', { length: 255 }).notNull().unique(),
  username:              varchar('username', { length: 50 }).notNull().unique(),
  displayName:           varchar('display_name', { length: 100 }).notNull(),
  avatarUrl:             text('avatar_url'),
  role:                  userRoleEnum('role').notNull().default('user'),
  creatorTier:           creatorTierEnum('creator_tier'),
  creditsBalance:        integer('credits_balance').notNull().default(0),
  totalCreditsPurchased: integer('total_credits_purchased').notNull().default(0),
  createdAt:             timestamp('created_at').notNull().defaultNow(),
  updatedAt:             timestamp('updated_at').notNull().defaultNow(),
});

export const creators = pgTable('creators', {
  id:                  uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  bio:                 text('bio'),
  verticals:           text('verticals').array().notNull().default([]),
  externalFollowers:   integer('external_followers').notNull().default(0),
  monthlyFee:          decimal('monthly_fee', { precision: 10, scale: 2 }).notNull().default('0'),
  commissionRate:      decimal('commission_rate', { precision: 5, scale: 4 }).notNull().default('0.12'),
  isVerified:          boolean('is_verified').notNull().default(false),
  subscriptionTiers:   jsonb('subscription_tiers').notNull().default([]),
  totalEarningsCredits: integer('total_earnings_credits').notNull().default(0),
  payoutAccount:       jsonb('payout_account'),
  createdAt:           timestamp('created_at').notNull().defaultNow(),
});

export const videos = pgTable('videos', {
  id:               uuid('id').primaryKey().defaultRandom(),
  creatorId:        uuid('creator_id').notNull().references(() => creators.id, { onDelete: 'cascade' }),
  title:            varchar('title', { length: 200 }).notNull(),
  description:      text('description'),
  vertical:         varchar('vertical', { length: 50 }).notNull(),
  videoUrl:         text('video_url').notNull(),
  thumbnailUrl:     text('thumbnail_url'),
  durationSeconds:  integer('duration_seconds').notNull().default(0),
  unlockCostCredits: integer('unlock_cost_credits').notNull().default(1),
  isPublished:      boolean('is_published').notNull().default(false),
  viewCount:        integer('view_count').notNull().default(0),
  flicCount:        integer('flic_count').notNull().default(0),
  unlockCount:      integer('unlock_count').notNull().default(0),
  replicaCount:     integer('replica_count').notNull().default(0),
  aiProcessed:      boolean('ai_processed').notNull().default(false),
  aiData:           jsonb('ai_data'),
  botSystemPrompt:  text('bot_system_prompt'),
  transcript:       text('transcript'),
  createdAt:        timestamp('created_at').notNull().defaultNow(),
  publishedAt:      timestamp('published_at'),
}, (t) => [
  index('videos_creator_idx').on(t.creatorId),
  index('videos_vertical_idx').on(t.vertical),
  index('videos_published_idx').on(t.isPublished),
]);

export const aiKnowledgeGraph = pgTable('ai_knowledge_graph', {
  id:                uuid('id').primaryKey().defaultRandom(),
  videoId:           uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  entityType:        entityTypeEnum('entity_type').notNull(),
  entityName:        varchar('entity_name', { length: 200 }).notNull(),
  entityData:        jsonb('entity_data').notNull().default({}),
  confidence:        decimal('confidence', { precision: 5, scale: 4 }).notNull(),
  timestampInVideo:  integer('timestamp_in_video'),
  createdAt:         timestamp('created_at').notNull().defaultNow(),
}, (t) => [index('kg_video_idx').on(t.videoId)]);

export const botConversations = pgTable('bot_conversations', {
  id:                      uuid('id').primaryKey().defaultRandom(),
  userId:                  uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  videoId:                 uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  messages:                jsonb('messages').notNull().default([]),
  totalCreditsSpent:       integer('total_credits_spent').notNull().default(0),
  commercialOffersShown:   integer('commercial_offers_shown').notNull().default(0),
  commercialOffersClicked: integer('commercial_offers_clicked').notNull().default(0),
  createdAt:               timestamp('created_at').notNull().defaultNow(),
  updatedAt:               timestamp('updated_at').notNull().defaultNow(),
}, (t) => [index('conv_user_video_idx').on(t.userId, t.videoId)]);

export const creditTransactions = pgTable('credit_transactions', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount:          integer('amount').notNull(),
  type:            creditTxTypeEnum('type').notNull(),
  referenceId:     uuid('reference_id'),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  metadata:        jsonb('metadata').notNull().default({}),
  createdAt:       timestamp('created_at').notNull().defaultNow(),
}, (t) => [index('tx_user_idx').on(t.userId)]);

export const creditPacks = pgTable('credit_packs', {
  id:            uuid('id').primaryKey().defaultRandom(),
  name:          varchar('name', { length: 50 }).notNull(),
  priceEur:      decimal('price_eur', { precision: 8, scale: 2 }).notNull(),
  creditsBase:   integer('credits_base').notNull(),
  creditsBonus:  integer('credits_bonus').notNull().default(0),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  badge:         varchar('badge', { length: 50 }),
  isActive:      boolean('is_active').notNull().default(true),
});

export const spinResults = pgTable('spin_results', {
  id:            uuid('id').primaryKey().defaultRandom(),
  userId:        uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  transactionId: uuid('transaction_id').references(() => creditTransactions.id),
  prizeType:     spinPrizeTypeEnum('prize_type').notNull(),
  prizeValue:    jsonb('prize_value').notNull(),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

export const fanCards = pgTable('fan_cards', {
  id:          uuid('id').primaryKey().defaultRandom(),
  creatorId:   uuid('creator_id').notNull().references(() => creators.id, { onDelete: 'cascade' }),
  name:        varchar('name', { length: 100 }).notNull(),
  imageUrl:    text('image_url'),
  rarity:      fanCardRarityEnum('rarity').notNull().default('common'),
  totalSupply: integer('total_supply').notNull(),
  minted:      integer('minted').notNull().default(0),
  creditsCost: integer('credits_cost').notNull(),
  perks:       jsonb('perks').notNull().default([]),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

export const userFanCards = pgTable('user_fan_cards', {
  id:               uuid('id').primaryKey().defaultRandom(),
  userId:           uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fanCardId:        uuid('fan_card_id').notNull().references(() => fanCards.id, { onDelete: 'cascade' }),
  serialNumber:     integer('serial_number').notNull(),
  acquiredAt:       timestamp('acquired_at').notNull().defaultNow(),
  isForSale:        boolean('is_for_sale').notNull().default(false),
  salePriceCredits: integer('sale_price_credits'),
});

export const comments = pgTable('comments', {
  id:           uuid('id').primaryKey().defaultRandom(),
  videoId:      uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
  userId:       uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content:      varchar('content', { length: 80 }).notNull(),
  isPinned:     boolean('is_pinned').notNull().default(false),
  creditsPaid:  integer('credits_paid').notNull().default(0),
  reaction:     varchar('reaction', { length: 10 }),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
}, (t) => [index('comments_video_idx').on(t.videoId)]);

export const creatorSubscriptions = pgTable('creator_subscriptions', {
  id:                   uuid('id').primaryKey().defaultRandom(),
  userId:               uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  creatorId:            uuid('creator_id').notNull().references(() => creators.id, { onDelete: 'cascade' }),
  tierName:             varchar('tier_name', { length: 50 }).notNull(),
  creditsPerMonth:      integer('credits_per_month').notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  status:               subscriptionStatusEnum('status').notNull().default('active'),
  currentPeriodEnd:     timestamp('current_period_end'),
  createdAt:            timestamp('created_at').notNull().defaultNow(),
});

export const cpaOffers = pgTable('cpa_offers', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  brandName:          varchar('brand_name', { length: 100 }).notNull(),
  verticals:          text('verticals').array().notNull().default([]),
  triggerKeywords:    text('trigger_keywords').array().notNull().default([]),
  offerText:          text('offer_text').notNull(),
  ctaLabel:           varchar('cta_label', { length: 50 }).notNull(),
  ctaUrl:             text('cta_url').notNull(),
  cpaValueEur:        decimal('cpa_value_eur', { precision: 8, scale: 2 }).notNull(),
  isActive:           boolean('is_active').notNull().default(true),
  budgetRemainingEur: decimal('budget_remaining_eur', { precision: 10, scale: 2 }).notNull(),
});

export const cpaEvents = pgTable('cpa_events', {
  id:             uuid('id').primaryKey().defaultRandom(),
  offerId:        uuid('offer_id').notNull().references(() => cpaOffers.id),
  userId:         uuid('user_id').notNull().references(() => users.id),
  videoId:        uuid('video_id').notNull().references(() => videos.id),
  conversationId: uuid('conversation_id').references(() => botConversations.id),
  eventType:      cpaEventTypeEnum('event_type').notNull(),
  revenueEur:     decimal('revenue_eur', { precision: 8, scale: 2 }),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
});

export const notifications = pgTable('notifications', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:      notificationTypeEnum('type').notNull(),
  title:     varchar('title', { length: 150 }).notNull(),
  body:      text('body').notNull(),
  data:      jsonb('data').notNull().default({}),
  isRead:    boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (t) => [index('notif_user_idx').on(t.userId)]);
