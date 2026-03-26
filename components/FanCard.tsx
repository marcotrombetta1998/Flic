import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';
import type { FanCard as FanCardType } from '../store';

const RARITY_CONFIG = {
  Common: { color: Colors.gray, glow: Colors.gray, label: 'COMMON' },
  Rare: { color: '#60A5FA', glow: '#3B82F6', label: 'RARE' },
  Legendary: { color: Colors.gold, glow: '#F59E0B', label: 'LEGENDARY' },
};

interface FanCardProps {
  card: FanCardType;
  onSell?: () => void;
  width?: number;
}

const CARD_W = (Dimensions.get('window').width - 52) / 2;

export default function FanCard({ card, onSell, width = CARD_W }: FanCardProps) {
  const rarity = RARITY_CONFIG[card.rarity];

  return (
    <View style={[styles.card, { width, shadowColor: rarity.glow }]}>
      <LinearGradient
        colors={[rarity.glow + '20', Colors.dark1]}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Creator image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: card.creatorAvatar }} style={styles.avatar} />
        <LinearGradient
          colors={['transparent', Colors.dark1]}
          style={styles.imageGradient}
        />
      </View>

      {/* Rarity badge */}
      <View style={[styles.rarityBadge, { borderColor: rarity.color + '60', backgroundColor: rarity.color + '15' }]}>
        <Text style={[styles.rarityText, { color: rarity.color }]}>{rarity.label}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.creatorName} numberOfLines={1}>{card.creatorName}</Text>
        <Text style={styles.edition}>#{card.edition} / {card.total}</Text>
      </View>

      {onSell && (
        <TouchableOpacity style={styles.sellButton} onPress={onSell} activeOpacity={0.85}>
          <Text style={styles.sellText}>Sell</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    aspectRatio: 0.7,
  },
  imageContainer: {
    width: '100%',
    height: '60%',
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rarityText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 8,
    letterSpacing: 1,
  },
  content: {
    padding: 10,
    gap: 2,
  },
  creatorName: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  edition: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  sellButton: {
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: Colors.dark2,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sellText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});
