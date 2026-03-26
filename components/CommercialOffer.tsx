import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from 'expo-vector-icons';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';
import type { CommercialOffer as CommercialOfferType } from '../store';

interface CommercialOfferProps {
  offer: CommercialOfferType;
  onPress?: () => void;
}

export default function CommercialOffer({ offer, onPress }: CommercialOfferProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(0,200,120,0.08)', 'rgba(0,200,120,0.02)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>{offer.logoEmoji}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.brand}>{offer.brand}</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{offer.discount}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.title}>{offer.title}</Text>
      <Text style={styles.description}>{offer.description}</Text>
      <TouchableOpacity style={styles.cta} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.ctaText}>View deal</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.lime} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.lime + '40',
    padding: 14,
    overflow: 'hidden',
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.dark2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  discountBadge: {
    backgroundColor: Colors.lime + '20',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.lime + '40',
  },
  discountText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.lime,
  },
  title: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  description: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    lineHeight: 18,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.lime,
  },
});
