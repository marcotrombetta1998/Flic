import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useStore } from '../store';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'slide1',
    gradient: [Colors.lime, Colors.violet] as [string, string],
    headline: 'Every video\nknows everything.',
    subhead: 'Ask it anything.',
    body: 'FLIC connects you directly to the creator\'s knowledge. One tap, instant answers.',
    emoji: '🧠',
  },
  {
    id: 'slide2',
    gradient: [Colors.dark1, Colors.dark2] as [string, string],
    headline: "Don't just watch.",
    subhead: 'FLIC it.',
    body: 'Ask questions, get unlocks, discover what the creator actually knows. Every video is a conversation.',
    emoji: '💬',
  },
  {
    id: 'slide3',
    gradient: [Colors.violet, '#3B0764'] as [string, string],
    headline: 'Paying feels\nlike winning.',
    subhead: 'Spin. Win. Unlock.',
    body: 'Earn credits, spin the wheel, collect fan cards. The more you engage, the more you win.',
    emoji: '🎰',
  },
];

function Slide1() {
  const rotate = useSharedValue(0);
  React.useEffect(() => {
    rotate.value = withRepeat(withTiming(360, { duration: 8000 }), -1, false);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <View style={styles.slideInner}>
      <LinearGradient
        colors={['#00C878', '#6B21C8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <MotiView
        from={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 200 }}
        style={styles.emojiContainer}
      >
        <Animated.View style={[styles.orb, animStyle]}>
          <LinearGradient
            colors={[Colors.lime, Colors.violet]}
            style={styles.orbGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
        <Text style={styles.slideEmoji}>🧠</Text>
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 400 }}
        style={styles.slideTextContainer}
      >
        <Text style={styles.slideHeadline}>{'Every video\nknows everything.'}</Text>
        <Text style={styles.slideSubhead}>Ask it anything.</Text>
        <Text style={styles.slideBody}>
          FLIC connects you directly to the creator's knowledge. One tap, instant answers.
        </Text>
      </MotiView>
    </View>
  );
}

function Slide2() {
  const chatAnim = useSharedValue(0);
  React.useEffect(() => {
    chatAnim.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0, { duration: 800 })),
      -1,
      false
    );
  }, []);

  return (
    <View style={styles.slideInner}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.dark1 }]} />
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 200 }}
        style={styles.chatPreview}
      >
        <View style={styles.chatBotBubble}>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>F</Text>
          </View>
          <View style={styles.chatBubbleContent}>
            <Text style={styles.chatBubbleText}>What's the best hidden beach in Amalfi? 🌊</Text>
          </View>
        </View>
        <MotiView
          from={{ opacity: 0, translateX: 40 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'spring', delay: 600 }}
          style={styles.chatUserBubble}
        >
          <Text style={styles.chatUserText}>Fiordo di Furore — only 20 minutes from Positano by boat!</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 1000 }}
          style={styles.chatBotBubble}
        >
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarText}>F</Text>
          </View>
          <View style={styles.chatBubbleContent}>
            <Text style={styles.chatBubbleText}>Want the GPS coordinates? Unlock for 3 credits 🗺️</Text>
          </View>
        </MotiView>
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 300 }}
        style={styles.slideTextContainer}
      >
        <Text style={styles.slideHeadline}>{"Don't just watch."}</Text>
        <Text style={[styles.slideSubhead, { color: Colors.lime }]}>FLIC it.</Text>
        <Text style={styles.slideBody}>
          Ask questions, get unlocks, discover what the creator actually knows. Every video is a conversation.
        </Text>
      </MotiView>
    </View>
  );
}

function Slide3() {
  const rotation = useSharedValue(0);
  React.useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 4000 }), -1, false);
  }, []);

  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const segments = [
    { color: Colors.lime, emoji: '⚡', label: '+10' },
    { color: Colors.pink, emoji: '🎁', label: '+5' },
    { color: Colors.violet, emoji: '🎴', label: 'Card' },
    { color: Colors.gold, emoji: '💰', label: '+25' },
    { color: Colors.lime, emoji: '⚡', label: '+3' },
    { color: Colors.pink, emoji: '🎁', label: '+8' },
    { color: Colors.violet, emoji: '✨', label: 'Bonus' },
    { color: '#374151', emoji: '🔄', label: 'Free' },
  ];

  return (
    <View style={styles.slideInner}>
      <LinearGradient
        colors={[Colors.violet, '#1A0533']}
        style={StyleSheet.absoluteFillObject}
      />
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 200 }}
        style={styles.wheelContainer}
      >
        <Animated.View style={[styles.wheel, wheelStyle]}>
          {segments.map((seg, i) => (
            <View
              key={i}
              style={[
                styles.wheelSegment,
                {
                  backgroundColor: seg.color,
                  transform: [{ rotate: `${(360 / segments.length) * i}deg` }],
                },
              ]}
            />
          ))}
          <View style={styles.wheelCenter}>
            <Text style={styles.wheelCenterText}>SPIN</Text>
          </View>
        </Animated.View>
      </MotiView>
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600, delay: 400 }}
        style={styles.slideTextContainer}
      >
        <Text style={styles.slideHeadline}>{'Paying feels\nlike winning.'}</Text>
        <Text style={[styles.slideSubhead, { color: Colors.violet }]}>Spin. Win. Unlock.</Text>
        <Text style={styles.slideBody}>
          Earn credits, spin the wheel, collect fan cards. The more you engage, the more you win.
        </Text>
      </MotiView>
    </View>
  );
}

const PRIVACY_URL = 'https://flic.app/privacy';
const TERMS_URL = 'https://flic.app/terms';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

function SignupSlide() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const setHasOnboarded = useStore((s) => s.setHasOnboarded);

  const [_googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      // Exchange googleResponse.authentication?.accessToken with backend
      setHasOnboarded(true);
      router.replace('/(tabs)');
    }
  }, [googleResponse]);

  const handleCreate = () => {
    if (!consentGiven) return;
    setHasOnboarded(true);
    router.replace('/(tabs)');
  };

  const handleAppleSignIn = async () => {
    if (!consentGiven) {
      Alert.alert('Consent required', 'Please accept the Terms and Privacy Policy to continue.');
      return;
    }
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // credential.identityToken → send to backend for verification
      setHasOnboarded(true);
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple Sign In failed', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!consentGiven) {
      Alert.alert('Consent required', 'Please accept the Terms and Privacy Policy to continue.');
      return;
    }
    await promptGoogleAsync();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        style={styles.slideInner}
        contentContainerStyle={styles.signupContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: Colors.black }]} />
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.logoContainer}
        >
          <LinearGradient
            colors={[Colors.lime, '#00A060']}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>F</Text>
          </LinearGradient>
          <Text style={styles.logoLabel}>FLIC</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
        >
          <Text style={styles.signupHeadline}>Create your account</Text>
          <Text style={styles.signupSub}>Start FLICing. It's free.</Text>
        </MotiView>
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 300 }}
          style={styles.formContainer}
        >
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor={Colors.gray}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.gray}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.gray} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.gray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={styles.consentRow}
            onPress={() => setConsentGiven(!consentGiven)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, consentGiven && styles.checkboxChecked]}>
              {consentGiven && <Ionicons name="checkmark" size={14} color={Colors.black} />}
            </View>
            <Text style={styles.consentText}>
              I agree to the{' '}
              <Text style={styles.consentLink} onPress={() => Linking.openURL(TERMS_URL)}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.consentLink} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy Policy</Text>
              {'. '}FLIC processes your data to provide the service (Art. 6(1)(b) GDPR).
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaButton, !consentGiven && styles.ctaDisabled]}
            onPress={handleCreate}
            activeOpacity={0.85}
            disabled={!consentGiven}
          >
            <LinearGradient
              colors={consentGiven ? [Colors.lime, '#00A060'] : [Colors.dark2, Colors.dark2]}
              style={styles.ctaGradient}
            >
              <Text style={[styles.ctaText, !consentGiven && { color: Colors.gray }]}>Create account</Text>
              <Ionicons name="arrow-forward" size={18} color={consentGiven ? Colors.black : Colors.gray} />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>
          <View style={styles.socialRow}>
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={Radius.lg}
                style={[styles.socialButton, styles.appleButton]}
                onPress={handleAppleSignIn}
              />
            )}
            <TouchableOpacity
              style={[styles.socialButton, Platform.OS === 'ios' && { marginLeft: 12 }]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={20} color={Colors.white} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.signInRow} onPress={handleCreate}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <Text style={[styles.signInText, { color: Colors.lime, fontFamily: FontFamily.dmSansBold }]}>Sign in</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function Onboarding() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const progress = useSharedValue(0);

  const allSlides = ['slide1', 'slide2', 'slide3', 'signup'];

  const goNext = () => {
    const next = currentIndex + 1;
    if (next < allSlides.length) {
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    }
  };

  const isLastOnboarding = currentIndex === 2;
  const isSignup = currentIndex === 3;

  const renderSlide = ({ item, index }: { item: string; index: number }) => {
    if (item === 'slide1') return <Slide1 />;
    if (item === 'slide2') return <Slide2 />;
    if (item === 'slide3') return <Slide3 />;
    return <SignupSlide />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={allSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
      />
      {!isSignup && (
        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentIndex ? Colors.lime : Colors.border,
                    width: i === currentIndex ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={goNext} activeOpacity={0.85}>
            <LinearGradient colors={[Colors.lime, '#00A060']} style={styles.nextGradient}>
              <Text style={styles.nextText}>{isLastOnboarding ? "Let's go" : 'Continue'}</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.black} />
            </LinearGradient>
          </TouchableOpacity>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={() => {
              flatListRef.current?.scrollToIndex({ index: 3, animated: true });
              setCurrentIndex(3);
            }} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  slideInner: {
    width,
    flex: 1,
    minHeight: height,
    backgroundColor: Colors.black,
  },
  slideTextContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
  },
  slideHeadline: {
    fontFamily: FontFamily.syneBold,
    fontSize: 38,
    color: Colors.white,
    lineHeight: 46,
    marginBottom: 8,
  },
  slideSubhead: {
    fontFamily: FontFamily.syneBold,
    fontSize: 24,
    color: Colors.lime,
    marginBottom: 16,
  },
  slideBody: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.gray,
    lineHeight: 24,
  },
  emojiContainer: {
    position: 'absolute',
    top: height * 0.12,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
    position: 'absolute',
  },
  orbGradient: {
    flex: 1,
    borderRadius: 100,
  },
  slideEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  chatPreview: {
    position: 'absolute',
    top: height * 0.1,
    left: 20,
    right: 20,
    gap: 12,
  },
  chatBotBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 14,
    color: Colors.black,
  },
  chatBubbleContent: {
    flex: 1,
    backgroundColor: Colors.dark2,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
  },
  chatBubbleText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  chatUserBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.lime,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '75%',
  },
  chatUserText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.black,
  },
  wheelContainer: {
    position: 'absolute',
    top: height * 0.1,
    alignSelf: 'center',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelSegment: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 0,
    left: 100,
  },
  wheelCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    top: 70,
    left: 70,
  },
  wheelCenterText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 10,
    color: Colors.lime,
  },
  // Signup
  signupContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 32,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 40,
    color: Colors.black,
  },
  logoLabel: {
    fontFamily: FontFamily.syneBold,
    fontSize: 24,
    color: Colors.white,
    letterSpacing: 4,
  },
  signupHeadline: {
    fontFamily: FontFamily.syneBold,
    fontSize: 28,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  signupSub: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  consentText: {
    flex: 1,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    lineHeight: 18,
  },
  consentLink: {
    color: Colors.lime,
    textDecorationLine: 'underline',
  },
  ctaButton: {
    marginTop: 8,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8,
  },
  ctaText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.md,
    color: Colors.black,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginHorizontal: 12,
  },
  socialRow: {
    flexDirection: 'row',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 52,
    gap: 8,
  },
  appleButton: {
    height: 52,
  },
  socialButtonText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signInText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8,
  },
  nextText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.md,
    color: Colors.black,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: 12,
  },
  skipText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
});
