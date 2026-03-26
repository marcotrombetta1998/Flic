import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from 'expo-vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';

interface UnlockButtonProps {
  credits: number;
  onPress: () => void;
  label?: string;
  fullWidth?: boolean;
}

export default function UnlockButton({
  credits,
  onPress,
  label = 'FLIC it',
  fullWidth = true,
}: UnlockButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[styles.wrapper, fullWidth && { alignSelf: 'stretch' }]}
    >
      <LinearGradient
        colors={[Colors.lime, '#00A060']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={styles.creditPill}>
          <Ionicons name="flash" size={12} color={Colors.black} />
          <Text style={styles.creditText}>{credits}</Text>
        </View>
        <Ionicons name="arrow-forward" size={16} color={Colors.black} />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  label: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.black,
  },
  creditPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 2,
  },
  creditText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: 11,
    color: Colors.black,
    fontWeight: 'bold',
  },
});
