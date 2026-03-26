import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from 'expo-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import { useStore } from '../../store';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../../constants/theme';
import VideoCard from '../../components/VideoCard';
import CreditBadge from '../../components/CreditBadge';
import CreatorAvatar from '../../components/CreatorAvatar';

const { width } = Dimensions.get('window');

const STORY_CREATORS = [
  { id: 'c1', name: 'Sofia', avatar: 'https://i.pravatar.cc/150?img=47', hasNew: true },
  { id: 'c2', name: 'Luca', avatar: 'https://i.pravatar.cc/150?img=12', hasNew: true },
  { id: 'c4', name: 'Jake', avatar: 'https://i.pravatar.cc/150?img=33', hasNew: false },
  { id: 'c7', name: 'Zara', avatar: 'https://i.pravatar.cc/150?img=25', hasNew: true },
  { id: 'c3', name: 'Mia', avatar: 'https://i.pravatar.cc/150?img=5', hasNew: false },
  { id: 'c5', name: 'Aria', avatar: 'https://i.pravatar.cc/150?img=9', hasNew: true },
  { id: 'c8', name: 'David', avatar: 'https://i.pravatar.cc/150?img=68', hasNew: false },
];

export default function HomeScreen() {
  const videos = useStore((s) => s.videos);
  const loading = useStore((s) => s.loading);
  const refreshFeed = useStore((s) => s.refreshFeed);
  const credits = useStore((s) => s.creditsBalance);
  const unreadCount = useStore((s) => s.unreadCount);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refreshFeed();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <SafeAreaView style={styles.container} >
      <StatusBar style="light" />

      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.header}
      >
        {/* Logo */}
        <View style={styles.logoBox}>
          <LinearGradient colors={[Colors.lime, '#00A060']} style={styles.logoGrad}>
            <Text style={styles.logoF}>F</Text>
          </LinearGradient>
          <Text style={styles.logoText}>FLIC</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search creators, topics..."
            placeholderTextColor={Colors.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Right icons */}
        <View style={styles.headerRight}>
          <CreditBadge amount={credits} onPress={() => router.push('/(tabs)/credits')} />
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </MotiView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.lime}
            colors={[Colors.lime]}
          />
        }
      >
        {/* Stories bar */}
        <View style={styles.storiesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
            {/* AI Picks */}
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', delay: 100 }}
              style={styles.storyItem}
            >
              <View style={styles.aiPicksAvatar}>
                <LinearGradient colors={[Colors.lime, Colors.violet]} style={styles.aiPicksGrad}>
                  <Text style={styles.aiPicksEmoji}>✨</Text>
                </LinearGradient>
              </View>
              <Text style={styles.storyName}>Your picks</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </MotiView>

            {STORY_CREATORS.map((creator, i) => (
              <MotiView
                key={creator.id}
                from={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 150 + i * 60 }}
                style={styles.storyItem}
              >
                <TouchableOpacity onPress={() => router.push(`/creator/${creator.id}`)}>
                  <CreatorAvatar uri={creator.avatar} size={52} hasStory={creator.hasNew} />
                </TouchableOpacity>
                <Text style={styles.storyName}>{creator.name}</Text>
              </MotiView>
            ))}
          </ScrollView>
        </View>

        {/* Section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>For you</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <View style={styles.feed}>
          {videos.map((video, i) => (
            <VideoCard key={video.id} video={video} index={i} />
          ))}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom banner */}
      <View style={styles.bottomBanner}>
        <LinearGradient
          colors={['rgba(0,200,120,0.15)', 'rgba(0,200,120,0.08)']}
          style={styles.bannerGradient}
        >
          <Text style={styles.bannerText}>✨ 3 free FLICs remaining today</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/credits')}>
            <Text style={styles.bannerCta}>Get more →</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoGrad: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoF: {
    fontFamily: FontFamily.syneBold,
    fontSize: 18,
    color: Colors.black,
  },
  logoText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 18,
    color: Colors.white,
    letterSpacing: 2,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark2,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.pink,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: 8,
    color: Colors.white,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  storiesSection: {
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  storiesRow: {
    paddingHorizontal: Spacing.base,
    gap: 16,
  },
  storyItem: {
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  aiPicksAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  aiPicksGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiPicksEmoji: {
    fontSize: 24,
  },
  storyName: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 11,
    color: Colors.gray,
    maxWidth: 60,
    textAlign: 'center',
  },
  aiBadge: {
    position: 'absolute',
    bottom: 18,
    right: -2,
    backgroundColor: Colors.violet,
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  aiBadgeText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: 8,
    color: Colors.white,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  sectionLink: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
  feed: {
    paddingHorizontal: Spacing.base,
  },
  bottomBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.lime + '30',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    paddingBottom: 24,
  },
  bannerText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
  bannerCta: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
});
