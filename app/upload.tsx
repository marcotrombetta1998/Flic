import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from 'expo-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../constants/theme';

const { width } = Dimensions.get('window');

const VERTICALS = ['Food', 'Travel', 'Fitness', 'Finance', 'Music', 'Sport', 'Tech', 'Lifestyle', 'Business', 'Education'];

const PRICING_OPTIONS = [
  { label: 'Free', value: 0, description: 'Anyone can FLIC' },
  { label: '3 credits', value: 3, description: 'Entry level' },
  { label: '5 credits', value: 5, description: 'Standard', recommended: true },
  { label: '8 credits', value: 8, description: 'Premium' },
  { label: '10 credits', value: 10, description: 'High value' },
  { label: 'Custom', value: -1, description: 'Set your price' },
];

export default function UploadScreen() {
  const [step, setStep] = useState<'pick' | 'details' | 'pricing' | 'review'>('pick');
  const [videoSelected, setVideoSelected] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<string | null>(null);
  const [selectedPricing, setSelectedPricing] = useState(5);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePickVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVideoSelected(true);
    setStep('details');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please add a title for your video');
      return;
    }
    if (!selectedVertical) {
      Alert.alert('Missing vertical', 'Please select a content vertical');
      return;
    }
    setIsPublishing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      setIsPublishing(false);
      Alert.alert(
        '🎉 Video published!',
        'Your video is live. FLIC will start indexing the AI knowledge base.',
        [{ text: 'View feed', onPress: () => router.replace('/(tabs)') }]
      );
    }, 2000);
  };

  const steps = ['pick', 'details', 'pricing', 'review'];
  const currentStepIdx = steps.indexOf(step);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload video</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          {steps.map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressSegment,
                { backgroundColor: i <= currentStepIdx ? Colors.lime : Colors.border },
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>
          Step {currentStepIdx + 1} of {steps.length} — {step.charAt(0).toUpperCase() + step.slice(1)}
        </Text>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Step: Pick video */}
          {step === 'pick' && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
              style={styles.stepContainer}
            >
              <View style={styles.pickerArea}>
                <LinearGradient
                  colors={[Colors.dark1, Colors.dark2]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.pickerContent}>
                  <Ionicons name="videocam-outline" size={48} color={Colors.gray} />
                  <Text style={styles.pickerTitle}>Select or record a video</Text>
                  <Text style={styles.pickerSub}>MP4, MOV · Up to 10 minutes · Max 500MB</Text>
                  <View style={styles.pickerButtons}>
                    <TouchableOpacity style={styles.pickerBtn} onPress={handlePickVideo}>
                      <LinearGradient colors={[Colors.lime, '#00A060']} style={styles.pickerBtnGrad}>
                        <Ionicons name="folder-open-outline" size={18} color={Colors.black} />
                        <Text style={styles.pickerBtnText}>Choose from library</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.pickerBtnOutline} onPress={handlePickVideo}>
                      <Ionicons name="camera-outline" size={18} color={Colors.white} />
                      <Text style={styles.pickerBtnOutlineText}>Record now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Tips */}
              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>✨ Tips for more FLICs</Text>
                {[
                  { emoji: '🎯', tip: 'Make it knowledge-dense — the more you know, the more people ask' },
                  { emoji: '📍', tip: 'Add specific data (locations, numbers, dates) for richer AI responses' },
                  { emoji: '⏱️', tip: '3–8 minute videos get 2.4x more FLICs than shorter content' },
                ].map((item) => (
                  <View key={item.tip} style={styles.tipRow}>
                    <Text style={styles.tipEmoji}>{item.emoji}</Text>
                    <Text style={styles.tipText}>{item.tip}</Text>
                  </View>
                ))}
              </View>
            </MotiView>
          )}

          {/* Step: Details */}
          {step === 'details' && (
            <MotiView
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.stepContainer}
            >
              {/* Video preview placeholder */}
              <View style={styles.videoPreview}>
                <LinearGradient colors={[Colors.dark2, Colors.dark1]} style={StyleSheet.absoluteFillObject} />
                <Ionicons name="play-circle-outline" size={48} color={Colors.gray} />
                <Text style={styles.previewText}>video_selected.mp4</Text>
              </View>

              {/* Title */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Write a compelling title..."
                  placeholderTextColor={Colors.gray}
                  value={title}
                  onChangeText={setTitle}
                  maxLength={80}
                />
                <Text style={styles.charCount}>{title.length}/80</Text>
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Tell viewers what they'll learn and what they can ask the AI..."
                  placeholderTextColor={Colors.gray}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{description.length}/500</Text>
              </View>

              {/* Vertical */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Content vertical *</Text>
                <View style={styles.verticalsGrid}>
                  {VERTICALS.map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.verticalChip, selectedVertical === v && styles.verticalChipActive]}
                      onPress={() => setSelectedVertical(v)}
                    >
                      <Text style={[styles.verticalChipText, selectedVertical === v && { color: Colors.lime }]}>
                        {v}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => setStep('pricing')}
                disabled={!title.trim() || !selectedVertical}
              >
                <LinearGradient
                  colors={title.trim() && selectedVertical ? [Colors.lime, '#00A060'] : [Colors.border, Colors.dark2]}
                  style={styles.nextButtonGrad}
                >
                  <Text style={[styles.nextButtonText, { color: title.trim() && selectedVertical ? Colors.black : Colors.gray }]}>
                    Continue to pricing
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color={title.trim() && selectedVertical ? Colors.black : Colors.gray} />
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          )}

          {/* Step: Pricing */}
          {step === 'pricing' && (
            <MotiView
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.stepContainer}
            >
              <Text style={styles.pricingTitle}>Set your FLIC price</Text>
              <Text style={styles.pricingSubtext}>
                This is what viewers pay to ask your AI a question. You earn 70% of every FLIC.
              </Text>

              <View style={styles.pricingOptions}>
                {PRICING_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.pricingOption,
                      selectedPricing === opt.value && styles.pricingOptionActive,
                      opt.recommended && styles.pricingOptionRecommended,
                    ]}
                    onPress={() => setSelectedPricing(opt.value)}
                  >
                    {opt.recommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                    <Text style={[styles.pricingLabel, selectedPricing === opt.value && { color: Colors.lime }]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.pricingDesc}>{opt.description}</Text>
                    {selectedPricing === opt.value && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.lime} style={styles.pricingCheck} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Earnings estimate */}
              <View style={styles.earningsEstimate}>
                <LinearGradient colors={[Colors.lime + '10', 'transparent']} style={StyleSheet.absoluteFillObject} />
                <Text style={styles.estimateTitle}>💰 Potential earnings</Text>
                <Text style={styles.estimateText}>
                  With {selectedPricing} credits/FLIC and 100 FLICs:
                </Text>
                <Text style={styles.estimateValue}>
                  ≈ €{((selectedPricing * 100 * 0.1 * 0.7)).toFixed(2)} / week
                </Text>
                <Text style={styles.estimateNote}>Based on similar {selectedVertical ?? 'content'} creators</Text>
              </View>

              <TouchableOpacity style={styles.nextButton} onPress={() => setStep('review')}>
                <LinearGradient colors={[Colors.lime, '#00A060']} style={styles.nextButtonGrad}>
                  <Text style={styles.nextButtonText}>Review & publish</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.black} />
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          )}

          {/* Step: Review */}
          {step === 'review' && (
            <MotiView
              from={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring' }}
              style={styles.stepContainer}
            >
              <Text style={styles.reviewTitle}>Ready to publish?</Text>
              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Title</Text>
                  <Text style={styles.reviewValue}>{title}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Vertical</Text>
                  <Text style={styles.reviewValue}>{selectedVertical}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>FLIC price</Text>
                  <Text style={[styles.reviewValue, { color: Colors.lime }]}>
                    {selectedPricing === 0 ? 'Free' : `${selectedPricing} credits`}
                  </Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewKey}>Your earnings</Text>
                  <Text style={[styles.reviewValue, { color: Colors.gold }]}>70% per FLIC</Text>
                </View>
                <View style={[styles.reviewRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.reviewKey}>AI indexing</Text>
                  <Text style={styles.reviewValue}>Auto · 2–5 min</Text>
                </View>
              </View>

              <View style={styles.aiFeatureCard}>
                <Text style={styles.aiFeatureTitle}>✨ What FLIC AI will do with your video</Text>
                <View style={styles.aiFeatureList}>
                  {[
                    'Extract all factual data, locations, and recommendations',
                    'Build a knowledge graph of everything you mention',
                    'Enable smart follow-up questions and cross-video context',
                    'Detect monetization opportunities for commercial deals',
                  ].map((feat, i) => (
                    <View key={i} style={styles.aiFeatureItem}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.lime} />
                      <Text style={styles.aiFeatureText}>{feat}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.publishButton}
                onPress={handlePublish}
                disabled={isPublishing}
                activeOpacity={0.85}
              >
                <LinearGradient colors={[Colors.lime, '#00A060']} style={styles.publishButtonGrad}>
                  {isPublishing ? (
                    <Text style={styles.publishText}>Publishing...</Text>
                  ) : (
                    <>
                      <Ionicons name="rocket" size={18} color={Colors.black} />
                      <Text style={styles.publishText}>Publish video</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </MotiView>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepLabel: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    paddingHorizontal: Spacing.base,
    paddingTop: 6,
    paddingBottom: 2,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: Spacing.base,
    gap: 16,
  },
  pickerArea: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContent: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
  },
  pickerTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
    textAlign: 'center',
  },
  pickerSub: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'center',
  },
  pickerButtons: {
    gap: 10,
    width: '100%',
    marginTop: 8,
  },
  pickerBtn: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  pickerBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  pickerBtnText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.black,
  },
  pickerBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pickerBtnOutlineText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  tipsSection: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  tipsTitle: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipEmoji: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  tipText: {
    flex: 1,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    lineHeight: 20,
  },
  // Details step
  videoPreview: {
    height: 120,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  textInput: {
    backgroundColor: Colors.dark2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'right',
  },
  verticalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verticalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verticalChipActive: {
    backgroundColor: Colors.lime + '15',
    borderColor: Colors.lime,
  },
  verticalChipText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  nextButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginTop: 8,
  },
  nextButtonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  nextButtonText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.black,
  },
  // Pricing step
  pricingTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.xl,
    color: Colors.white,
  },
  pricingSubtext: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    lineHeight: 22,
  },
  pricingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pricingOption: {
    width: (width - Spacing.base * 2 - 10) / 2,
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 4,
    position: 'relative',
  },
  pricingOptionActive: {
    borderColor: Colors.lime,
    backgroundColor: Colors.lime + '08',
  },
  pricingOptionRecommended: {
    borderColor: Colors.gold + '60',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.gold,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recommendedText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 9,
    color: Colors.black,
  },
  pricingLabel: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.base,
    color: Colors.white,
    marginTop: 4,
  },
  pricingDesc: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  pricingCheck: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  earningsEstimate: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.lime + '30',
    padding: 14,
    overflow: 'hidden',
    gap: 4,
  },
  estimateTitle: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  estimateText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  estimateValue: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.xl,
    color: Colors.lime,
  },
  estimateNote: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  // Review step
  reviewTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.xl,
    color: Colors.white,
  },
  reviewCard: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewKey: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  reviewValue: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
    maxWidth: '60%',
    textAlign: 'right',
  },
  aiFeatureCard: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.violet + '40',
    padding: 14,
    gap: 10,
  },
  aiFeatureTitle: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  aiFeatureList: {
    gap: 8,
  },
  aiFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiFeatureText: {
    flex: 1,
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    lineHeight: 20,
  },
  publishButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  publishButtonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  publishText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.lg,
    color: Colors.black,
  },
});
