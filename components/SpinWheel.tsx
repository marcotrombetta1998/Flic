import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';

const SEGMENTS = [
  { label: '+10', sublabel: 'credits', color: Colors.lime, emoji: '⚡' },
  { label: '+5', sublabel: 'credits', color: Colors.pink, emoji: '🎁' },
  { label: 'Fan Card', sublabel: 'rare', color: Colors.violet, emoji: '🎴' },
  { label: '+25', sublabel: 'credits', color: Colors.gold, emoji: '💰' },
  { label: '+3', sublabel: 'credits', color: Colors.lime, emoji: '⚡' },
  { label: '+8', sublabel: 'credits', color: Colors.pink, emoji: '🎁' },
  { label: 'Mystery', sublabel: 'bonus', color: '#4C1D95', emoji: '✨' },
  { label: 'Free', sublabel: 'spin', color: '#374151', emoji: '🔄' },
];

const WHEEL_SIZE = Math.min(Dimensions.get('window').width - 80, 280);
const SEGMENT_ANGLE = 360 / SEGMENTS.length;

interface SpinWheelProps {
  onWin?: (prize: string) => void;
}

export default function SpinWheel({ onWin }: SpinWheelProps) {
  const rotation = useSharedValue(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<(typeof SEGMENTS)[number] | null>(null);
  const [showResult, setShowResult] = useState(false);

  const spin = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    setShowResult(false);
    setResult(null);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
    // Extra rotations for drama + land on segment
    const extraSpins = 5 + Math.random() * 3;
    const targetAngle = rotation.value + 360 * extraSpins + (randomSegment * SEGMENT_ANGLE);

    rotation.value = withTiming(
      targetAngle,
      { duration: 3000, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(handleSpinEnd)(randomSegment);
        }
      }
    );
  }, [isSpinning]);

  const handleSpinEnd = (segmentIndex: number) => {
    const prize = SEGMENTS[segmentIndex];
    setResult(prize);
    setShowResult(true);
    setIsSpinning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onWin?.(`${prize.emoji} ${prize.label} ${prize.sublabel}`);
  };

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const centerSize = WHEEL_SIZE * 0.22;

  return (
    <View style={styles.container}>
      {/* Pointer */}
      <View style={styles.pointer}>
        <View style={styles.pointerTriangle} />
      </View>

      {/* Wheel */}
      <Animated.View style={[styles.wheel, { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2 }, wheelStyle]}>
        {SEGMENTS.map((seg, i) => {
          const angle = (SEGMENT_ANGLE * i * Math.PI) / 180;
          const midAngle = ((SEGMENT_ANGLE * i + SEGMENT_ANGLE / 2) * Math.PI) / 180;
          const r = WHEEL_SIZE * 0.35;
          const tx = Math.cos(midAngle - Math.PI / 2) * r;
          const ty = Math.sin(midAngle - Math.PI / 2) * r;

          return (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  backgroundColor: seg.color,
                  transform: [
                    { rotate: `${SEGMENT_ANGLE * i}deg` },
                  ],
                  width: WHEEL_SIZE / 2,
                  height: WHEEL_SIZE / 2,
                  borderTopRightRadius: WHEEL_SIZE / 2,
                },
              ]}
            />
          );
        })}
        {/* Labels */}
        {SEGMENTS.map((seg, i) => {
          const midAngle = ((SEGMENT_ANGLE * i + SEGMENT_ANGLE / 2) * Math.PI) / 180;
          const r = WHEEL_SIZE * 0.32;
          const tx = Math.cos(midAngle - Math.PI / 2) * r;
          const ty = Math.sin(midAngle - Math.PI / 2) * r;

          return (
            <View
              key={`label-${i}`}
              style={[
                styles.labelContainer,
                {
                  left: WHEEL_SIZE / 2 + tx - 24,
                  top: WHEEL_SIZE / 2 + ty - 16,
                  transform: [{ rotate: `${SEGMENT_ANGLE * i + SEGMENT_ANGLE / 2}deg` }],
                },
              ]}
            >
              <Text style={styles.labelEmoji}>{seg.emoji}</Text>
              <Text style={styles.labelText}>{seg.label}</Text>
            </View>
          );
        })}
        {/* Center */}
        <View
          style={[
            styles.center,
            {
              width: centerSize,
              height: centerSize,
              borderRadius: centerSize / 2,
              left: (WHEEL_SIZE - centerSize) / 2,
              top: (WHEEL_SIZE - centerSize) / 2,
            },
          ]}
        >
          <LinearGradient colors={[Colors.lime, '#00A060']} style={{ flex: 1, borderRadius: centerSize / 2, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.centerText}>FLIC</Text>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Spin button */}
      <TouchableOpacity style={styles.spinButton} onPress={spin} disabled={isSpinning} activeOpacity={0.85}>
        <LinearGradient colors={isSpinning ? [Colors.border, Colors.dark2] : [Colors.lime, '#00A060']} style={styles.spinGradient}>
          <Text style={[styles.spinText, { color: isSpinning ? Colors.gray : Colors.black }]}>
            {isSpinning ? 'Spinning...' : '🎰 SPIN'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Result */}
      {showResult && result && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring' }}
          style={styles.resultCard}
        >
          <Text style={styles.resultEmoji}>{result.emoji}</Text>
          <Text style={styles.resultLabel}>{result.label} {result.sublabel}!</Text>
          <Text style={styles.resultSub}>Added to your wallet 🎉</Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 20,
  },
  pointer: {
    alignItems: 'center',
    zIndex: 10,
    marginBottom: -10,
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.lime,
  },
  wheel: {
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: Colors.border,
  },
  segment: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: 48,
  },
  labelEmoji: {
    fontSize: 12,
  },
  labelText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: 9,
    color: Colors.white,
    fontWeight: 'bold',
  },
  center: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 10,
  },
  centerText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 11,
    color: Colors.black,
    letterSpacing: 1,
  },
  spinButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    width: WHEEL_SIZE,
  },
  spinGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  spinText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.md,
  },
  resultCard: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.lime + '40',
    padding: 16,
    alignItems: 'center',
    width: WHEEL_SIZE,
    gap: 4,
  },
  resultEmoji: {
    fontSize: 36,
  },
  resultLabel: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.lime,
  },
  resultSub: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
});
