import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/theme';
import TierBadge from './TierBadge';
import type { CreatorTier } from '../store';

interface CreatorAvatarProps {
  uri: string;
  size?: number;
  tier?: CreatorTier;
  hasStory?: boolean;
  showBadge?: boolean;
}

export default function CreatorAvatar({
  uri,
  size = 44,
  tier,
  hasStory = false,
  showBadge = false,
}: CreatorAvatarProps) {
  const borderSize = size + 6;

  return (
    <View style={{ width: borderSize + 4, height: borderSize + 4, alignItems: 'center', justifyContent: 'center' }}>
      {hasStory ? (
        <LinearGradient
          colors={[Colors.lime, Colors.violet]}
          style={[styles.ring, { width: borderSize + 4, height: borderSize + 4, borderRadius: (borderSize + 4) / 2 }]}
        >
          <View style={[styles.ringInner, { width: borderSize - 2, height: borderSize - 2, borderRadius: (borderSize - 2) / 2 }]}>
            <Image
              source={{ uri }}
              style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
            />
          </View>
        </LinearGradient>
      ) : (
        <View style={[styles.plainRing, { width: borderSize + 4, height: borderSize + 4, borderRadius: (borderSize + 4) / 2 }]}>
          <Image
            source={{ uri }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          />
        </View>
      )}
      {showBadge && tier && (
        <View style={styles.badgeContainer}>
          <TierBadge tier={tier} size="sm" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainRing: {
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: Colors.dark2,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    transform: [{ translateX: -24 }],
  },
});
