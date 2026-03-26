import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize } from '../constants/theme';

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

interface StatItem {
  icon: string;
  value: number;
  label: string;
}

interface StatRowProps {
  views: number;
  flics: number;
  unlocks: number;
  replicas?: number;
  style?: object;
}

export default function StatRow({ views, flics, unlocks, replicas, style }: StatRowProps) {
  const items: StatItem[] = [
    { icon: '👁', value: views, label: 'views' },
    { icon: '💬', value: flics, label: 'FLICs' },
    ...(replicas !== undefined ? [{ icon: '🔁', value: replicas, label: 'reposts' }] : []),
    { icon: '🔓', value: unlocks, label: 'unlocks' },
  ];

  return (
    <View style={[styles.row, style]}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <View style={styles.separator} />}
          <View style={styles.statItem}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.value}>{formatNum(item.value)}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 12,
  },
  value: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  label: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
});
