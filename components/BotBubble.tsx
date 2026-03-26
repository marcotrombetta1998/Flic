import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';
import CommercialOffer from './CommercialOffer';
import type { CommercialOffer as CommercialOfferType } from '../store';

interface BotBubbleProps {
  content: string;
  timestamp?: string;
  offerCard?: CommercialOfferType;
  animate?: boolean;
}

export default function BotBubble({ content, timestamp, offerCard, animate = true }: BotBubbleProps) {
  const Wrapper = animate ? MotiView : View;

  return (
    <Wrapper
      from={animate ? { opacity: 0, translateX: -20 } : undefined}
      animate={animate ? { opacity: 1, translateX: 0 } : undefined}
      transition={animate ? { type: 'timing', duration: 300 } : undefined}
      style={styles.row}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>F</Text>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.bubble}>
          <Text style={styles.text}>{content}</Text>
        </View>
        {offerCard && (
          <View style={{ marginTop: 8 }}>
            <CommercialOffer offer={offerCard} />
          </View>
        )}
        {timestamp && (
          <Text style={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
    maxWidth: '85%',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 14,
    color: Colors.black,
  },
  contentWrapper: {
    flex: 1,
  },
  bubble: {
    backgroundColor: Colors.dark2,
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  text: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.white,
    lineHeight: 20,
  },
  timestamp: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 10,
    color: Colors.gray,
    marginTop: 4,
    marginLeft: 4,
  },
});
