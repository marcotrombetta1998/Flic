import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontFamily, FontSize } from '../constants/theme';

interface CreditBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export default function CreditBadge({ amount, size = 'md', onPress }: CreditBadgeProps) {
  const sizes = {
    sm: { padding: 6, iconSize: 12, fontSize: FontSize.xs },
    md: { padding: 8, iconSize: 14, fontSize: FontSize.sm },
    lg: { padding: 10, iconSize: 18, fontSize: FontSize.base },
  };

  const s = sizes[size];

  const content = (
    <View style={[styles.container, { paddingHorizontal: s.padding + 2, paddingVertical: s.padding - 2 }]}>
      <Ionicons name="flash" size={s.iconSize} color={Colors.lime} />
      <Text style={[styles.text, { fontSize: s.fontSize }]}>{amount}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 120, 0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 120, 0.3)',
    gap: 4,
  },
  text: {
    fontFamily: FontFamily.jetbrainsMono,
    color: Colors.lime,
    fontWeight: '700',
  },
});
