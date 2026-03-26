import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useLocalSearchParams, router } from 'expo-router';
import { useStore } from '../../store';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '../../constants/theme';
import TierBadge from '../../components/TierBadge';
import VideoCard from '../../components/VideoCard';

const { width } = Dimensions.get('window');
const COVER_HEIGHT = 220;
const AVATAR_SIZE = 84;

const SUB_TIERS = [
  {
    name: 'Bronze',
    emoji: '🥉',
    priceMonth: 4.99,
    color: '#CD7F32',
    perks: ['Unlimited FLICs on all videos', 'Direct Q&A access', 'Monthly fan card'],
  },
  {
    name: 'Silver',
    emoji: '🥈',
    priceMonth: 9.99,
    color: '#C0C0C0',
    perks: ['Everything in Bronze', 'Exclusive subscriber videos', 'Priority responses', '2x fan cards/month'],
  },
  {
    name: 'Gold',
    emoji: '🥇',
    priceMonth: 19.99,
    color: Colors.gold,
    perks: ['Everything in Silver', '1:1 monthly call', 'Early access to drops', 'Legendary fan card'],
    featured: true,
  },
];

function GridVideo({
  video,
  index,
}: {
  video: ReturnType<typeof useStore>['videos'][0];
  index: number;
}) {
  const size = (width - Spacing.base * 2 - 4) / 3;
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300, delay: index * 50 }}
    >
      <TouchableOpacity
        onPress={() => router.push(`/video/${video.id}`)}
        style={[styles.gridVideo, { width: size, height: size }]}
        activeOpacity={0.85}
      >
        <Image source={{ uri: video.thumbnail }} style={styles.gridThumb} />
        {!video.isUnlocked && (
          <View style={styles.gridLock}>
            <Ionicons name="lock-closed" size={14} color={Colors.white} />
          </View>
        )}
        <View style={styles.gridStats}>
          <Ionicons name="flash" size={10} color={Colors.lime} />
          <Text style={styles.gridStatText}>{(video.flics / 1000).toFixed(1)}K</Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

export default function CreatorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getCreator = useStore((s) => s.getCreator);
  const getVideosByCreator = useStore((s) => s.getVideosByCreator);
  const allCreators = useStore((s) => s.creators);

  const creator = getCreator(id) ?? allCreators[0];
  const videos = getVideosByCreator(id);

  const [isFollowed, setIsFollowed] = useState(creator.isFollowed);
  const [isSubscribed, setIsSubscribed] = useState(creator.isSubscribed);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: creator.coverImage }} style={styles.cover} />
          <LinearGradient
            colors={['transparent', Colors.black]}
            style={styles.coverGradient}
          />
          {/* Blur edges */}
          <LinearGradient
            colors={[Colors.black + 'CC', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.coverEdge, { left: 0 }]}
          />
          <LinearGradient
            colors={['transparent', Colors.black + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.coverEdge, { right: 0 }]}
          />

          {/* Back */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </TouchableOpacity>

          {/* Menu */}
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.white} />
          </TouchableOpacity>

          {/* Avatar */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 200 }}
            style={styles.avatarContainer}
          >
            <View style={styles.avatarRing}>
              <Image source={{ uri: creator.avatar }} style={styles.avatar} />
            </View>
            <View style={styles.tierBadgeContainer}>
              <TierBadge tier={creator.tier} />
            </View>
          </MotiView>
        </View>

        {/* Creator info */}
        <View style={styles.creatorInfo}>
          <Text style={styles.creatorName}>{creator.name}</Text>
          <Text style={styles.creatorUsername}>{creator.username}</Text>

          {/* Vertical tags */}
          <View style={styles.verticalsRow}>
            {creator.verticals.map((v) => (
              <View key={v} style={styles.verticalTag}>
                <Text style={styles.verticalText}>{v}</Text>
              </View>
            ))}
          </View>

          {/* Bio */}
          <Text style={styles.bio}>{creator.bio}</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{(creator.followers / 1000).toFixed(0)}K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{(creator.totalFLICs / 1000).toFixed(1)}K</Text>
              <Text style={styles.statLabel}>FLICs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: Colors.lime }]}>
                {(creator.unlockRate * 100).toFixed(0)}%
              </Text>
              <Text style={styles.statLabel}>Unlock rate</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{videos.length}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]}
              onPress={() => setIsSubscribed(!isSubscribed)}
              activeOpacity={0.85}
            >
              {isSubscribed ? (
                <>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.lime} />
                  <Text style={[styles.subscribeBtnText, { color: Colors.lime }]}>Subscribed</Text>
                </>
              ) : (
                <LinearGradient colors={[Colors.lime, '#00A060']} style={styles.subscribeBtnGrad}>
                  <Ionicons name="flash" size={16} color={Colors.black} />
                  <Text style={styles.subscribeBtnText}>Subscribe</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.followBtn, isFollowed && styles.followedBtn]}
              onPress={() => setIsFollowed(!isFollowed)}
            >
              <Text style={[styles.followBtnText, isFollowed && { color: Colors.white }]}>
                {isFollowed ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn}>
              <Ionicons name="ellipsis-vertical" size={18} color={Colors.gray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription tiers */}
        <View style={styles.tiersSection}>
          <Text style={styles.sectionTitle}>Subscription tiers</Text>
          {SUB_TIERS.map((tier, i) => (
            <MotiView
              key={tier.name}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 400, delay: i * 100 }}
            >
              <TouchableOpacity
                style={[
                  styles.tierCard,
                  tier.featured && styles.tierCardFeatured,
                  selectedTier === tier.name && styles.tierCardSelected,
                ]}
                onPress={() => setSelectedTier(selectedTier === tier.name ? null : tier.name)}
                activeOpacity={0.85}
              >
                {tier.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>Most popular</Text>
                  </View>
                )}
                <View style={styles.tierHeader}>
                  <Text style={styles.tierEmoji}>{tier.emoji}</Text>
                  <View>
                    <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
                    <Text style={styles.tierPrice}>€{tier.priceMonth}/month</Text>
                  </View>
                  <Ionicons
                    name={selectedTier === tier.name ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.gray}
                    style={{ marginLeft: 'auto' }}
                  />
                </View>
                {selectedTier === tier.name && (
                  <View style={styles.tierPerks}>
                    {tier.perks.map((perk) => (
                      <View key={perk} style={styles.perkRow}>
                        <Ionicons name="checkmark-circle" size={14} color={tier.color} />
                        <Text style={styles.perkText}>{perk}</Text>
                      </View>
                    ))}
                    <TouchableOpacity style={[styles.joinTierBtn, { backgroundColor: tier.color }]}>
                      <Text style={styles.joinTierText}>Join {tier.name}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Content grid */}
        <View style={styles.contentSection}>
          <View style={styles.contentHeader}>
            <Text style={styles.sectionTitle}>Content ({videos.length})</Text>
            <View style={styles.contentFilter}>
              <TouchableOpacity style={[styles.contentFilterBtn, styles.contentFilterActive]}>
                <Text style={[styles.contentFilterText, { color: Colors.lime }]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contentFilterBtn}>
                <Text style={styles.contentFilterText}>🔒 Locked</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contentFilterBtn}>
                <Text style={styles.contentFilterText}>🔓 Unlocked</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.grid}>
            {videos.map((v, i) => (
              <GridVideo key={v.id} video={v} index={i} />
            ))}
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  coverContainer: {
    height: COVER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  coverEdge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -AVATAR_SIZE / 2,
    alignSelf: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    padding: 3,
    borderRadius: (AVATAR_SIZE + 6) / 2,
    borderWidth: 3,
    borderColor: Colors.lime,
    backgroundColor: Colors.black,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  tierBadgeContainer: {
    marginTop: 4,
  },
  creatorInfo: {
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: AVATAR_SIZE / 2 + 12,
    gap: 8,
  },
  creatorName: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.xl,
    color: Colors.white,
    textAlign: 'center',
  },
  creatorUsername: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  verticalsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  verticalTag: {
    backgroundColor: Colors.lime + '15',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.lime + '30',
  },
  verticalText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.xs,
    color: Colors.lime,
  },
  bio: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    width: '100%',
  },
  subscribeBtn: {
    flex: 1,
    height: 46,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  subscribedBtn: {
    backgroundColor: Colors.lime + '10',
    borderColor: Colors.lime + '40',
  },
  subscribeBtnGrad: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    height: '100%',
  },
  subscribeBtnText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.black,
  },
  followBtn: {
    width: 100,
    height: 46,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followedBtn: {
    borderColor: Colors.border,
    backgroundColor: Colors.dark2,
  },
  followBtnText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  menuBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dark2,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Tiers
  tiersSection: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
    marginBottom: 4,
  },
  tierCard: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  tierCardFeatured: {
    borderColor: Colors.gold + '60',
  },
  tierCardSelected: {
    borderColor: Colors.lime + '60',
  },
  featuredBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.gold,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 10,
    color: Colors.black,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierEmoji: {
    fontSize: 28,
  },
  tierName: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.base,
  },
  tierPrice: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  tierPerks: {
    marginTop: 12,
    gap: 8,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    flex: 1,
  },
  joinTierBtn: {
    marginTop: 8,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  joinTierText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.black,
  },
  // Content grid
  contentSection: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing.xl,
  },
  contentHeader: {
    gap: 10,
    marginBottom: 12,
  },
  contentFilter: {
    flexDirection: 'row',
    gap: 8,
  },
  contentFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.dark2,
  },
  contentFilterActive: {
    borderColor: Colors.lime + '60',
    backgroundColor: Colors.lime + '10',
  },
  contentFilterText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  gridVideo: {
    position: 'relative',
    overflow: 'hidden',
  },
  gridThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gridLock: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridStats: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  gridStatText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: 9,
    color: Colors.lime,
  },
});
