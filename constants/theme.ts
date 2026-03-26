export const Colors = {
  // Primary
  lime: '#00C878',
  limeLight: '#E8FBF3',
  // Accent
  pink: '#E8345A',
  violet: '#6B21C8',
  gold: '#C47F00',
  // Background
  black: '#0A0A0A',
  dark1: '#111827',
  dark2: '#1F2937',
  // Text
  white: '#FFFFFF',
  gray: '#9CA3AF',
  // UI
  border: '#2D3748',
};

export const FontFamily = {
  syneBold: 'Syne_700Bold',
  syneRegular: 'Syne_400Regular',
  dmSansRegular: 'DMSans_400Regular',
  dmSansMedium: 'DMSans_500Medium',
  dmSansBold: 'DMSans_700Bold',
  jetbrainsMono: 'JetBrainsMono_400Regular',
  jetbrainsMonoBold: 'JetBrainsMono_700Bold',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 44,
  display: 64,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 56,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  lime: {
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  violet: {
    shadowColor: Colors.violet,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const Animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};
