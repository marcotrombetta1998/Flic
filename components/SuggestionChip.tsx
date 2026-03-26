import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';

interface SuggestionChipProps {
  emoji: string;
  label: string;
  onPress: (text: string) => void;
}

export default function SuggestionChip({ emoji, label, onPress }: SuggestionChipProps) {
  const handlePress = () => {
    Haptics.selectionAsync();
    onPress(`${emoji} ${label}`);
  };

  return (
    <TouchableOpacity style={styles.chip} onPress={handlePress} activeOpacity={0.7}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: Colors.dark2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emoji: {
    fontSize: 13,
  },
  label: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
});
