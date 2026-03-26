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
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from 'expo-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '../../constants/theme';
import { useStore } from '../../store';
import TierBadge from '../../components/TierBadge';
import FanCard from '../../components/FanCard';

const { width } = Dimensions.get('window');

// Simple SVG-style line chart using views
function LineChart({ data, color = Colors.lime }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const chartW = width - Spacing.base * 2 - 28;
  const chartH = 80;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * chartW,
    y: chartH - ((v - min) / range) * chartH,
  }));

  return (
    <View style={{ height: chartH + 20, overflow: 'hidden' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <View
          key={ratio}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: ratio * chartH,
            height: 1,
            backgroundColor: Colors.border,
          }}
        />
      ))}
      {/* Area fill */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 20,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={[color + '30', 'transparent']}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      </View>
      {/* Data points */}
      {points.map((pt, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: pt.x - 3,
            top: pt.y - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
          }}
        />
      ))}
      {/* Labels */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: FontFamily.jetbrainsMono, fontSize: 9, color: Colors.gray }}>14d ago</Text>
        <Text style={{ fontFamily: FontFamily.jetbrainsMono, fontSize: 9, color: Colors.gray }}>Today</Text>
      </View>
    </View>
  );
}

function CreatorDashboard() {
  const store = useStore();
  const videos = store.getVideosByCreator('c1');

  return (
    <View style={styles.dashboardContainer}>
      {/* Earnings cards */}
      <View style={styles.earningsRow}>
        {[
          { label: 'Today', value: `€${store.todayEarnings.toFixed(2)}`, sub: '+12 FLICs' },
          { label: 'This week', value: `€${store.weekEarnings.toFixed(2)}`, sub: '+89 FLICs' },
          { label: 'This month', value: `€${store.monthEarnings.toFixed(2)}`, sub: '+340 FLICs' },
        ].map((item, i) => (
          <MotiView
            key={item.label}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: i * 100 }}
            style={styles.earningsCard}
          >
            <Text style={styles.earningsLabel}>{item.label}</Text>
            <Text style={styles.earningsValue}>{item.value}</Text>
            <Text style={styles.earningsSub}>{item.sub}</Text>
          </MotiView>
        ))}
      </View>

      {/* Key stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flash" size={20} color={Colors.lime} />
          <Text style={styles.statValue}>{(store.totalFLICs / 1000).toFixed(1)}K</Text>
          <Text style={styles.statLabel}>Total FLICs</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="lock-open" size={20} color={Colors.gold} />
          <Text style={styles.statValue}>{(store.unlockRate * 100).toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Unlock rate</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={20} color={Colors.violet} />
          <Text style={styles.statValue}>248K</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="eye" size={20} color={Colors.pink} />
          <Text style={styles.statValue}>1.2M</Text>
          <Text style={styles.statLabel}>Total views</Text>
        </View>
      </View>

      {/* Analytics chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>FLICs trend</Text>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: Colors.lime }]} />
            <Text style={styles.legendText}>Daily FLICs</Text>
          </View>
        </View>
        <LineChart data={store.chartData} color={Colors.lime} />
      </View>

      {/* AI Insights */}
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>✨ AI Insights</Text>
        {[
          { emoji: '📈', text: 'Your Finance videos get 2.3x more FLICs on Tuesdays. Post your next one on Tuesday morning.', color: Colors.lime },
          { emoji: '💡', text: 'Users who FLIC within the first 30 seconds convert at 82%. Hook them faster.', color: Colors.gold },
          { emoji: '🎯', text: 'Adding GPS coordinates to your travel content increases unlock rate by 34%.', color: Colors.violet },
        ].map((insight, i) => (
          <MotiView
            key={i}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 400, delay: i * 100 }}
            style={[styles.insightCard, { borderLeftColor: insight.color }]}
          >
            <Text style={styles.insightEmoji}>{insight.emoji}</Text>
            <Text style={styles.insightText}>{insight.text}</Text>
          </MotiView>
        ))}
      </View>

      {/* Content manager */}
      <View style={styles.contentSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.contentTitle}>Your content</Text>
          <TouchableOpacity>
            <Text style={styles.manageText}>Manage all →</Text>
          </TouchableOpacity>
        </View>
        {videos.slice(0, 3).map((video, i) => (
          <View key={video.id} style={styles.contentItem}>
            <Image source={{ uri: video.thumbnail }} style={styles.contentThumb} />
            <View style={styles.contentInfo}>
              <Text style={styles.contentItemTitle} numberOfLines={2}>{video.title}</Text>
              <View style={styles.contentStats}>
                <Text style={styles.contentStat}>👁 {(video.views / 1000).toFixed(0)}K</Text>
                <Text style={styles.contentStat}>💬 {video.flics}</Text>
                <Text style={styles.contentStat}>🔓 {video.unlocks}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.contentMenu}>
              <Ionicons name="ellipsis-vertical" size={16} color={Colors.gray} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

function UserProfile() {
  const store = useStore();

  return (
    <View style={styles.userContainer}>
      {/* Subscriptions */}
      <View style={styles.subsSection}>
        <Text style={styles.subsSectionTitle}>Subscriptions</Text>
        {store.creators.filter((c) => c.isSubscribed).map((creator) => (
          <View key={creator.id} style={styles.subItem}>
            <Image source={{ uri: creator.avatar }} style={styles.subAvatar} />
            <View style={styles.subInfo}>
              <Text style={styles.subName}>{creator.name}</Text>
              <Text style={styles.subVertical}>{creator.verticals.join(' · ')}</Text>
            </View>
            <TierBadge tier={creator.tier} size="sm" />
          </View>
        ))}
      </View>

      {/* Fan cards */}
      <View style={styles.fanCardsSection}>
        <Text style={styles.subsSectionTitle}>Your fan cards ({store.fanCards.length})</Text>
        <View style={styles.fanCardsGrid}>
          {store.fanCards.map((card) => (
            <FanCard key={card.id} card={card} onSell={() => {}} />
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        {[
          { icon: 'notifications-outline', label: 'Notifications' },
          { icon: 'card-outline', label: 'Payment methods' },
          { icon: 'shield-outline', label: 'Privacy & Security' },
          { icon: 'help-circle-outline', label: 'Help & Support' },
          { icon: 'log-out-outline', label: 'Sign out', danger: true },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.settingItem}>
            <Ionicons name={item.icon as any} size={20} color={item.danger ? Colors.pink : Colors.gray} />
            <Text style={[styles.settingLabel, item.danger && { color: Colors.pink }]}>{item.label}</Text>
            {!item.danger && <Ionicons name="chevron-forward" size={16} color={Colors.border} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const store = useStore();
  const [isCreatorView, setIsCreatorView] = useState(store.isCreator);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[Colors.lime + '20', Colors.dark1]}
            style={styles.profileBg}
          />
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: store.avatar }} style={styles.avatar} />
              <View style={styles.avatarBadge}>
                <TierBadge tier="VERIFIED" size="sm" />
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.switchButton} onPress={() => setIsCreatorView(!isCreatorView)}>
                <Text style={styles.switchText}>
                  {isCreatorView ? '👤 User view' : '🎬 Creator view'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="settings-outline" size={18} color={Colors.gray} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.profileName}>{store.name}</Text>
          <Text style={styles.profileUsername}>{store.username}</Text>
          <View style={styles.profileStatsRow}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>248K</Text>
              <Text style={styles.profileStatLabel}>Followers</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>134</Text>
              <Text style={styles.profileStatLabel}>Following</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={[styles.profileStatValue, { color: Colors.lime }]}>19.2K</Text>
              <Text style={styles.profileStatLabel}>FLICs</Text>
            </View>
          </View>
        </View>

        {/* View toggle */}
        {store.isCreator && (
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewTab, isCreatorView && styles.viewTabActive]}
              onPress={() => setIsCreatorView(true)}
            >
              <Ionicons name="analytics-outline" size={16} color={isCreatorView ? Colors.lime : Colors.gray} />
              <Text style={[styles.viewTabText, isCreatorView && { color: Colors.lime }]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewTab, !isCreatorView && styles.viewTabActive]}
              onPress={() => setIsCreatorView(false)}
            >
              <Ionicons name="person-outline" size={16} color={!isCreatorView ? Colors.lime : Colors.gray} />
              <Text style={[styles.viewTabText, !isCreatorView && { color: Colors.lime }]}>Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {isCreatorView && store.isCreator ? <CreatorDashboard /> : <UserProfile />}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  profileHeader: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.lg,
    overflow: 'hidden',
  },
  profileBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Spacing.base,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.lime,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -28 }],
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  switchButton: {
    backgroundColor: Colors.dark2,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileName: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.xl,
    color: Colors.white,
    marginTop: 16,
  },
  profileUsername: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 2,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  profileStatValue: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  profileStatLabel: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  profileStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  // View toggle
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    padding: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  viewTabActive: {
    backgroundColor: Colors.dark2,
  },
  viewTabText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  // Dashboard
  dashboardContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.lg,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 3,
  },
  earningsLabel: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  earningsValue: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.gold,
  },
  earningsSub: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 10,
    color: Colors.lime,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.base,
    color: Colors.white,
    fontWeight: 'bold',
  },
  statLabel: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 9,
    color: Colors.gray,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartTitle: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  // Insights
  insightsSection: {
    gap: 10,
  },
  insightsTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    padding: 12,
  },
  insightEmoji: {
    fontSize: 18,
  },
  insightText: {
    flex: 1,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    lineHeight: 20,
  },
  // Content
  contentSection: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  manageText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
  },
  contentThumb: {
    width: 64,
    height: 40,
    borderRadius: 6,
    backgroundColor: Colors.dark2,
  },
  contentInfo: {
    flex: 1,
    gap: 4,
  },
  contentItemTitle: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.xs,
    color: Colors.white,
    lineHeight: 16,
  },
  contentStats: {
    flexDirection: 'row',
    gap: 8,
  },
  contentStat: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: 10,
    color: Colors.gray,
  },
  contentMenu: {
    padding: 4,
  },
  // User profile
  userContainer: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.lg,
  },
  subsSection: {
    gap: 10,
  },
  subsSectionTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  subAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark2,
  },
  subInfo: {
    flex: 1,
    gap: 2,
  },
  subName: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  subVertical: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  fanCardsSection: {
    gap: 12,
  },
  fanCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  settingsSection: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    flex: 1,
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
});
