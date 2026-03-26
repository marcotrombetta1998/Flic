import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize } from '../constants/theme';
import type { CreatorTier } from '../store';

interface TierBadgeProps {
  tier: CreatorTier;
  size?: 'sm' | 'md';
}

const TIER_CONFIG: Record<CreatorTier, { label: string; emoji: string; color: string; bg: string }> = {
  VERIFIED: { label: 'VERIFIED', emoji: '⭐', color: Colors.lime, bg: 'rgba(0,200,120,0.12)' },
  RISING: { label: 'RISING', emoji: '🌱', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  ASPIRING: { label: 'ASPIRING', emoji: '💰', color: Colors.gold, bg: 'rgba(196,127,0,0.12)' },
};

export default function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const config = TIER_CONFIG[tier];
  const fontSize = size === 'sm' ? FontSize.xs : FontSize.sm;

  return (
    <View style={[styles.container, { backgroundColor: config.bg, borderColor: config.color + '40' }]}>
      <Text style={{ fontSize: size === 'sm' ? 10 : 12 }}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.color, fontSize }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontFamily: FontFamily.dmSansBold,
    letterSpacing: 0.5,
  },
});
