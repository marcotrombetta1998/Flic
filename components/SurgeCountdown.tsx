import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';

interface SurgeCountdownProps {
  spotsLeft: number;
  totalSpots?: number;
  hoursLeft?: number;
  vertical?: string;
}

export default function SurgeCountdown({
  spotsLeft,
  totalSpots = 50,
  hoursLeft = 4,
  vertical = 'Finance',
}: SurgeCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(hoursLeft * 3600);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const progress = spotsLeft / totalSpots;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(232,52,90,0.15)', 'rgba(232,52,90,0.05)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Ionicons name="flash" size={14} color={Colors.pink} />
          <Text style={styles.badgeText}>SURGE INVERSE</Text>
        </View>
        <View style={styles.timer}>
          <Text style={styles.timerText}>
            {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
          </Text>
        </View>
      </View>
      <Text style={styles.headline}>
        <Text style={styles.spots}>{spotsLeft} spots</Text> left at half price on {vertical}
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.subtext}>
        {Math.round((1 - progress) * 100)}% claimed · {totalSpots - spotsLeft} people already locked in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.pink + '40',
    padding: 14,
    overflow: 'hidden',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.xs,
    color: Colors.pink,
    letterSpacing: 1,
  },
  timer: {
    backgroundColor: 'rgba(232,52,90,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.sm,
    color: Colors.pink,
  },
  headline: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.white,
    lineHeight: 22,
  },
  spots: {
    fontFamily: FontFamily.dmSansBold,
    color: Colors.pink,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.pink,
    borderRadius: 3,
  },
  subtext: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
});
