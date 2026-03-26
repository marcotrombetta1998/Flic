import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from 'expo-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { useStore, CREATORS } from '../../store';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../../constants/theme';
import SurgeCountdown from '../../components/SurgeCountdown';
import CreatorAvatar from '../../components/CreatorAvatar';
import TierBadge from '../../components/TierBadge';

const FILTERS = ['All', 'Food', 'Travel', 'Fitness', 'Finance', 'Music', 'Sport'];

const TRENDING = [
  { id: 'v4', title: 'Why your savings account is stealing from you', flics: 14200, thumbnail: 'https://picsum.photos/seed/v4/300/200', vertical: 'Finance' },
  { id: 'v2', title: "Making authentic Cacio e Pepe", flics: 8700, thumbnail: 'https://picsum.photos/seed/v2/300/200', vertical: 'Food' },
  { id: 'v6', title: 'Tokyo for under €400 — 7 days complete guide', flics: 5600, thumbnail: 'https://picsum.photos/seed/v6/300/200', vertical: 'Travel' },
  { id: 'v1', title: 'Hidden Amalfi Coast spots locals keep secret', flics: 3240, thumbnail: 'https://picsum.photos/seed/v1/300/200', vertical: 'Travel' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Jake Williams', username: '@jakewilliams.finance', avatar: 'https://i.pravatar.cc/150?img=33', votes: 4800, progress: 0.92, id: 'c4' },
  { rank: 2, name: 'Sofia Marchetti', username: '@sofiamarchetti', avatar: 'https://i.pravatar.cc/150?img=47', votes: 3920, progress: 0.76, id: 'c1' },
  { rank: 3, name: 'Luca Ferretti', username: '@lucaferretti.chef', avatar: 'https://i.pravatar.cc/150?img=12', votes: 3100, progress: 0.61, id: 'c2' },
  { rank: 4, name: 'Zara Kim', username: '@zarakim.travel', avatar: 'https://i.pravatar.cc/150?img=25', votes: 2240, progress: 0.44, id: 'c7' },
  { rank: 5, name: 'Mia Chen', username: '@mia.moves', avatar: 'https://i.pravatar.cc/150?img=5', votes: 1780, progress: 0.35, id: 'c3' },
];

const { width } = Dimensions.get('window');
const CARD_W = 180;

function TrendingCard({ item, index }: { item: typeof TRENDING[0]; index: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: 20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 60 }}
    >
      <TouchableOpacity
        style={styles.trendingCard}
        onPress={() => router.push(`/video/${item.id}`)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.trendingThumb} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.trendingGrad}
        />
        <View style={styles.trendingContent}>
          <View style={styles.trendingVertical}>
            <Text style={styles.trendingVerticalText}>{item.vertical}</Text>
          </View>
          <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.trendingStats}>
            <Ionicons name="flash" size={12} color={Colors.lime} />
            <Text style={styles.trendingFlics}>{(item.flics / 1000).toFixed(1)}K FLICs</Text>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
}

export default function DiscoverScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const handleVote = (id: string) => {
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
        </View>

        {/* Search bar */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.searchWrapper}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search creators, videos, topics..."
              placeholderTextColor={Colors.gray}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.gray} />
              </TouchableOpacity>
            )}
          </View>
        </MotiView>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Surge banner */}
        <View style={styles.section}>
          <SurgeCountdown spotsLeft={23} totalSpots={50} hoursLeft={4} vertical="Finance" />
        </View>

        {/* Trending FLICs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending FLICs</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
            {TRENDING.map((item, i) => (
              <TrendingCard key={item.id} item={item} index={i} />
            ))}
          </ScrollView>
        </View>

        {/* Rising this week */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌱 Rising this week</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.creatorsRow}>
            {CREATORS.filter((c) => c.tier === 'RISING').map((creator, i) => (
              <MotiView
                key={creator.id}
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: i * 80 }}
              >
                <TouchableOpacity
                  style={styles.creatorCard}
                  onPress={() => router.push(`/creator/${creator.id}`)}
                  activeOpacity={0.85}
                >
                  <CreatorAvatar uri={creator.avatar} size={52} hasStory tier={creator.tier} />
                  <Text style={styles.creatorCardName} numberOfLines={1}>{creator.name}</Text>
                  <TierBadge tier={creator.tier} size="sm" />
                  <Text style={styles.creatorCardFollowers}>
                    {(creator.followers / 1000).toFixed(0)}K followers
                  </Text>
                </TouchableOpacity>
              </MotiView>
            ))}
          </ScrollView>
        </View>

        {/* ASPIRING Leaderboard */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💰 ASPIRING Leaderboard</Text>
            <View style={styles.voteBadge}>
              <Text style={styles.voteBadgeText}>VOTE</Text>
            </View>
          </View>
          <Text style={styles.leaderboardSubtext}>Top 3 get promoted to RISING this week</Text>
          {LEADERBOARD.map((item, i) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 400, delay: i * 80 }}
              style={styles.leaderboardItem}
            >
              <Text style={[styles.rank, i < 3 && { color: Colors.gold }]}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${item.rank}`}
              </Text>
              <Image source={{ uri: item.avatar }} style={styles.leaderAvatar} />
              <View style={styles.leaderInfo}>
                <Text style={styles.leaderName}>{item.name}</Text>
                <Text style={styles.leaderUsername}>{item.username}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
                </View>
                <Text style={styles.votesText}>{item.votes.toLocaleString()} votes</Text>
              </View>
              <TouchableOpacity
                style={[styles.voteButton, votedIds.has(item.id) && styles.voteButtonActive]}
                onPress={() => handleVote(item.id)}
              >
                <Ionicons
                  name={votedIds.has(item.id) ? 'heart' : 'heart-outline'}
                  size={16}
                  color={votedIds.has(item.id) ? Colors.black : Colors.lime}
                />
                <Text style={[styles.voteText, votedIds.has(item.id) && { color: Colors.black }]}>
                  {votedIds.has(item.id) ? 'Voted' : 'Vote'}
                </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: 4,
  },
  title: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize['2xl'],
    color: Colors.white,
  },
  searchWrapper: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark2,
    borderRadius: Radius.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.lime,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  filters: {
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.lime + '20',
    borderColor: Colors.lime,
  },
  filterText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  filterTextActive: {
    color: Colors.lime,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  seeAll: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
  trendingRow: {
    gap: 12,
    paddingRight: Spacing.base,
  },
  trendingCard: {
    width: CARD_W,
    height: 200,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendingThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  trendingContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    gap: 4,
  },
  trendingVertical: {
    backgroundColor: Colors.lime + '30',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  trendingVerticalText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 9,
    color: Colors.lime,
  },
  trendingTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: 13,
    color: Colors.white,
    lineHeight: 18,
  },
  trendingStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendingFlics: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.lime,
  },
  creatorsRow: {
    gap: 12,
    paddingRight: Spacing.base,
  },
  creatorCard: {
    width: 110,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  creatorCardName: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.xs,
    color: Colors.white,
    textAlign: 'center',
  },
  creatorCardFollowers: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 10,
    color: Colors.gray,
    textAlign: 'center',
  },
  // Leaderboard
  leaderboardSubtext: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginBottom: 16,
    marginTop: -8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  rank: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.md,
    color: Colors.gray,
    width: 28,
    textAlign: 'center',
  },
  leaderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark2,
  },
  leaderInfo: {
    flex: 1,
    gap: 3,
  },
  leaderName: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  leaderUsername: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  votesText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.gold,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.lime,
  },
  voteButtonActive: {
    backgroundColor: Colors.lime,
  },
  voteText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.xs,
    color: Colors.lime,
  },
  voteBadge: {
    backgroundColor: Colors.gold + '20',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.gold + '40',
  },
  voteBadgeText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 10,
    color: Colors.gold,
    letterSpacing: 1,
  },
});
