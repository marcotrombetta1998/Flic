import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Colors, FontFamily, FontSize, Radius } from '../constants/theme';

interface UserBubbleProps {
  content: string;
  timestamp?: string;
  animate?: boolean;
}

export default function UserBubble({ content, timestamp, animate = true }: UserBubbleProps) {
  const Wrapper = animate ? MotiView : View;

  return (
    <Wrapper
      from={animate ? { opacity: 0, translateX: 20 } : undefined}
      animate={animate ? { opacity: 1, translateX: 0 } : undefined}
      transition={animate ? { type: 'timing', duration: 300 } : undefined}
      style={styles.row}
    >
      <View style={styles.bubble}>
        <Text style={styles.text}>{content}</Text>
      </View>
      {timestamp && (
        <Text style={styles.timestamp}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '75%',
    marginBottom: 12,
  },
  bubble: {
    backgroundColor: Colors.lime,
    borderRadius: Radius.lg,
    borderBottomRightRadius: 4,
    padding: 12,
  },
  text: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.black,
    lineHeight: 20,
  },
  timestamp: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: 10,
    color: Colors.gray,
    marginTop: 4,
    marginRight: 4,
  },
});
