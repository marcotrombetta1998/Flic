import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from 'expo-vector-icons';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { Colors, FontFamily, FontSize, Radius, Spacing } from '../constants/theme';
import type { Video } from '../store';
import StatRow from './StatRow';
import UnlockButton from './UnlockButton';
import CreatorAvatar from './CreatorAvatar';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const THUMB_HEIGHT = (CARD_WIDTH * 9) / 16;

interface VideoCardProps {
  video: Video;
  index?: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoCard({ video, index = 0 }: VideoCardProps) {
  const handlePress = () => {
    router.push(`/video/${video.id}`);
  };

  const handleCreatorPress = () => {
    router.push(`/creator/${video.creatorId}`);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400, delay: index * 80 }}
      style={styles.card}
    >
      {/* Thumbnail */}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: video.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={styles.thumbnailGradient}
          />
          {/* Duration badge */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
          </View>
          {/* Creator overlay */}
          <TouchableOpacity style={styles.creatorOverlay} onPress={handleCreatorPress}>
            <CreatorAvatar uri={video.creator.avatar} size={32} hasStory={false} />
            <View>
              <Text style={styles.creatorName}>{video.creator.name}</Text>
              <View style={styles.verticalTag}>
                <Text style={styles.verticalText}>{video.vertical}</Text>
              </View>
            </View>
          </TouchableOpacity>
          {/* Play icon */}
          <View style={styles.playIconContainer}>
            <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.85)" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>

        {/* Stats */}
        <StatRow
          views={video.views}
          flics={video.flics}
          unlocks={video.unlocks}
          replicas={video.replicas}
          style={styles.statRow}
        />

        {/* Caption preview + unlock */}
        <Text style={styles.caption} numberOfLines={2}>
          {video.caption}
        </Text>

        {video.isUnlocked ? (
          <View style={styles.unlockedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.lime} />
            <Text style={styles.unlockedText}>Unlocked — tap to continue chat</Text>
          </View>
        ) : (
          <View style={styles.unlockRow}>
            <View style={styles.costPill}>
              <Ionicons name="lock-closed" size={12} color={Colors.gray} />
              <Text style={styles.costText}>Unlock for </Text>
              <Ionicons name="flash" size={12} color={Colors.lime} />
              <Text style={[styles.costText, { color: Colors.lime, fontFamily: FontFamily.jetbrainsMono }]}>
                {video.unlockCost}
              </Text>
            </View>
          </View>
        )}

        <UnlockButton
          credits={video.unlockCost}
          onPress={handlePress}
          label="FLIC it"
          fullWidth
        />
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    alignSelf: 'center',
  },
  thumbnailContainer: {
    width: CARD_WIDTH,
    height: THUMB_HEIGHT,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: THUMB_HEIGHT * 0.5,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  durationText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  creatorOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorName: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  verticalTag: {
    backgroundColor: 'rgba(0,200,120,0.2)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    alignSelf: 'flex-start',
  },
  verticalText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: 10,
    color: Colors.lime,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  content: {
    padding: Spacing.base,
    gap: 10,
  },
  title: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.md,
    color: Colors.white,
    lineHeight: 24,
  },
  statRow: {
    flexWrap: 'wrap',
  },
  caption: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    lineHeight: 20,
  },
  unlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.dark2,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  costText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unlockedText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
});
