import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from 'expo-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { useStore, VIDEOS } from '../../store';
import { Colors, FontFamily, FontSize, Spacing, Radius } from '../../constants/theme';
import BotBubble from '../../components/BotBubble';
import UserBubble from '../../components/UserBubble';
import SuggestionChip from '../../components/SuggestionChip';
import StatRow from '../../components/StatRow';
import CreatorAvatar from '../../components/CreatorAvatar';
import VideoCard from '../../components/VideoCard';

const { width, height } = Dimensions.get('window');
const VIDEO_HEIGHT = height * 0.45;

type TabType = 'chat' | 'details' | 'more';

const QUICK_SUGGESTIONS: Array<{ emoji: string; label: string }> = [
  { emoji: '❓', label: 'What's the main takeaway?' },
  { emoji: '📍', label: 'Give me exact locations' },
  { emoji: '💰', label: 'What's the cost breakdown?' },
  { emoji: '🗓️', label: 'Best time to try this?' },
  { emoji: '🔗', label: 'Any links or resources?' },
];

const PINNED_COMMENTS = [
  { id: 'pc1', user: 'travelbug99', avatar: 'https://i.pravatar.cc/50?img=14', text: '🔥 This changed how I travel. Sofia answered my question about the ferry within minutes!', likes: 234, isPinned: true },
  { id: 'pc2', user: 'foodlover_eu', avatar: 'https://i.pravatar.cc/50?img=22', text: 'The hidden cove at Fiordo di Furore is absolutely real and incredible. 10/10 recommend!', likes: 189, isPinned: false },
  { id: 'pc3', user: 'budget_nomad', avatar: 'https://i.pravatar.cc/50?img=38', text: 'Used this guide for my Amalfi trip — saved at least €200 with Sofia\'s tips 🙏', likes: 97, isPinned: false },
];

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const video = VIDEOS.find((v) => v.id === id) ?? VIDEOS[0];
  const conversations = useStore((s) => s.conversations);
  const sendMessage = useStore((s) => s.sendMessage);
  const videos = useStore((s) => s.videos);

  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [inputText, setInputText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const conversation = conversations[video.id] ?? { videoId: video.id, messages: [] };

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    sendMessage(video.id, inputText.trim());
    setInputText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  }, [inputText, video.id]);

  const handleSuggestion = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const relatedVideos = videos.filter((v) => v.id !== video.id && v.vertical === video.vertical).slice(0, 4);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Video area */}
        <View style={styles.videoContainer}>
          <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={22} color={Colors.white} />
          </TouchableOpacity>

          {/* Play button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setIsVideoPlaying(!isVideoPlaying)}
          >
            <Ionicons
              name={isVideoPlaying ? 'pause-circle' : 'play-circle'}
              size={56}
              color="rgba(255,255,255,0.9)"
            />
          </TouchableOpacity>

          {/* Creator overlay */}
          <View style={styles.creatorOverlay}>
            <TouchableOpacity
              style={styles.creatorInfo}
              onPress={() => router.push(`/creator/${video.creatorId}`)}
            >
              <CreatorAvatar uri={video.creator.avatar} size={36} hasStory />
              <View>
                <Text style={styles.creatorName}>{video.creator.name}</Text>
                <Text style={styles.creatorTag}>{video.vertical}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </TouchableOpacity>
          </View>

          {/* Right actions */}
          <View style={styles.rightActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setIsLiked(!isLiked);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? Colors.pink : Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setIsBookmarked(!isBookmarked);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={20} color={isBookmarked ? Colors.lime : Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="share-outline" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '32%' }]} />
            </View>
            <Text style={styles.durationText}>
              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <Text style={styles.videoTitle} numberOfLines={1}>{video.title}</Text>
          <StatRow views={video.views} flics={video.flics} unlocks={video.unlocks} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['chat', 'details', 'more'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'chat' ? '💬 Chat' : tab === 'details' ? '📋 Details' : '⚡ More like this'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat tab */}
        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <ScrollView
              ref={scrollRef}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
              {conversation.messages.length === 0 ? (
                <View style={styles.emptyChat}>
                  <View style={styles.emptyChatAvatar}>
                    <Text style={styles.emptyChatAvatarText}>F</Text>
                  </View>
                  <Text style={styles.emptyChatTitle}>Ask me anything about this video</Text>
                  <Text style={styles.emptyChatSub}>
                    I'm {video.creator.name.split(' ')[0]}'s AI. I know everything in this video — and more.
                  </Text>
                </View>
              ) : (
                conversation.messages.map((msg) =>
                  msg.role === 'bot' ? (
                    <BotBubble
                      key={msg.id}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      offerCard={msg.offerCard}
                      animate={false}
                    />
                  ) : (
                    <UserBubble
                      key={msg.id}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      animate={false}
                    />
                  )
                )
              )}
            </ScrollView>

            {/* Suggestion chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
              style={styles.suggestions}
            >
              {QUICK_SUGGESTIONS.map((s) => (
                <SuggestionChip key={s.label} emoji={s.emoji} label={s.label} onPress={handleSuggestion} />
              ))}
            </ScrollView>

            {/* Input bar */}
            <View style={styles.inputBar}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={`Ask ${video.creator.name.split(' ')[0]} anything...`}
                  placeholderTextColor={Colors.gray}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={500}
                />
              </View>
              <TouchableOpacity
                style={[styles.sendButton, inputText.trim() ? styles.sendButtonActive : {}]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons
                  name="send"
                  size={18}
                  color={inputText.trim() ? Colors.black : Colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Details tab */}
        {activeTab === 'details' && (
          <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsPadding}>
              {/* Caption */}
              <Text style={styles.detailsCaption}>{video.caption}</Text>

              {/* AI data cards */}
              {video.aiData && (
                <View style={styles.aiDataSection}>
                  <Text style={styles.aiDataTitle}>✨ AI-extracted data</Text>
                  <View style={styles.aiDataCard}>
                    {Object.entries(video.aiData.data).map(([key, value]) => (
                      <View key={key} style={styles.aiDataRow}>
                        <Text style={styles.aiDataKey}>{key}</Text>
                        <Text style={styles.aiDataValue}>{value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Tags */}
              <View style={styles.tagsRow}>
                {video.tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Comments */}
              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>
                  Comments · {(video.flics).toLocaleString()}
                </Text>
                {PINNED_COMMENTS.map((comment) => (
                  <View key={comment.id} style={styles.comment}>
                    <Image source={{ uri: comment.avatar }} style={styles.commentAvatar} />
                    <View style={styles.commentContent}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentUser}>{comment.user}</Text>
                        {comment.isPinned && (
                          <View style={styles.pinnedBadge}>
                            <Ionicons name="pin" size={10} color={Colors.lime} />
                            <Text style={styles.pinnedText}>Pinned</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                      <View style={styles.commentActions}>
                        <TouchableOpacity style={styles.commentLike}>
                          <Ionicons name="heart-outline" size={14} color={Colors.gray} />
                          <Text style={styles.commentLikeText}>{comment.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Text style={styles.commentReply}>Reply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        )}

        {/* More like this tab */}
        {activeTab === 'more' && (
          <ScrollView style={styles.moreContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.morePadding}>
              {/* Cross-creator special card */}
              <MotiView
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 100 }}
                style={styles.crossCreatorCard}
              >
                <LinearGradient
                  colors={[Colors.violet + '30', Colors.lime + '10']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.crossCreatorContent}>
                  <View style={styles.crossCreatorAvatars}>
                    <Image source={{ uri: video.creator.avatar }} style={styles.crossAvatar} />
                    <View style={styles.crossPlusCircle}>
                      <Text style={styles.crossPlus}>×</Text>
                    </View>
                    <Image source={{ uri: 'https://i.pravatar.cc/150?img=33' }} style={styles.crossAvatar} />
                  </View>
                  <View style={styles.crossCreatorText}>
                    <Text style={styles.crossCreatorTitle}>{video.creator.name} × Jake Williams</Text>
                    <Text style={styles.crossCreatorSub}>
                      "Travel money: how to invest while moving" — exclusive collab
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.crossCreatorCta}>
                    <Text style={styles.crossCreatorCtaText}>Watch →</Text>
                  </TouchableOpacity>
                </View>
              </MotiView>

              {/* Related grid */}
              <Text style={styles.moreTitle}>More in {video.vertical}</Text>
              <View style={styles.relatedGrid}>
                {relatedVideos.map((v, i) => (
                  <MotiView
                    key={v.id}
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 400, delay: i * 80 }}
                    style={styles.relatedCard}
                  >
                    <TouchableOpacity onPress={() => router.replace(`/video/${v.id}`)} activeOpacity={0.85}>
                      <Image source={{ uri: v.thumbnail }} style={styles.relatedThumb} />
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.relatedGrad}
                      />
                      <Text style={styles.relatedTitle} numberOfLines={2}>{v.title}</Text>
                    </TouchableOpacity>
                  </MotiView>
                ))}
              </View>
              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  videoContainer: {
    width,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
  },
  creatorOverlay: {
    position: 'absolute',
    bottom: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorName: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  creatorTag: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.lime,
  },
  followBtn: {
    borderWidth: 1.5,
    borderColor: Colors.white,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  followText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    top: 60,
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.lime,
    borderRadius: 2,
  },
  durationText: {
    fontFamily: FontFamily.jetbrainsMono,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  statsBar: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 4,
  },
  videoTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.lime,
  },
  tabText: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  tabTextActive: {
    color: Colors.lime,
  },
  // Chat
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.base,
    paddingBottom: 4,
  },
  emptyChat: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyChatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyChatAvatarText: {
    fontFamily: FontFamily.syneBold,
    fontSize: 24,
    color: Colors.black,
  },
  emptyChatTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
    textAlign: 'center',
  },
  emptyChatSub: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  suggestions: {
    maxHeight: 44,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  suggestionsRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    gap: 8,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: 8,
    paddingBottom: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.black,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.dark2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  input: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButtonActive: {
    backgroundColor: Colors.lime,
    borderColor: Colors.lime,
  },
  // Details
  detailsContainer: {
    flex: 1,
  },
  detailsPadding: {
    padding: Spacing.base,
    gap: 16,
  },
  detailsCaption: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.base,
    color: Colors.gray,
    lineHeight: 24,
  },
  aiDataSection: {
    gap: 8,
  },
  aiDataTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  aiDataCard: {
    backgroundColor: Colors.dark1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  aiDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  aiDataKey: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  aiDataValue: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
    maxWidth: '60%',
    textAlign: 'right',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.dark2,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  commentsSection: {
    gap: 12,
  },
  commentsTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  comment: {
    flexDirection: 'row',
    gap: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark2,
  },
  commentContent: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentUser: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: Colors.lime + '20',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pinnedText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: 10,
    color: Colors.lime,
  },
  commentText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentLike: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  commentLikeText: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  commentReply: {
    fontFamily: FontFamily.dmSansMedium,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  // More
  moreContainer: {
    flex: 1,
  },
  morePadding: {
    padding: Spacing.base,
    gap: 16,
  },
  crossCreatorCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.violet + '60',
    padding: 14,
    overflow: 'hidden',
  },
  crossCreatorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  crossCreatorAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -8,
  },
  crossAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.black,
  },
  crossPlusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginHorizontal: -4,
  },
  crossPlus: {
    fontFamily: FontFamily.syneBold,
    fontSize: 14,
    color: Colors.white,
  },
  crossCreatorText: {
    flex: 1,
    gap: 2,
  },
  crossCreatorTitle: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.sm,
    color: Colors.white,
  },
  crossCreatorSub: {
    fontFamily: FontFamily.dmSansRegular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    lineHeight: 16,
  },
  crossCreatorCta: {
    backgroundColor: Colors.violet,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  crossCreatorCtaText: {
    fontFamily: FontFamily.dmSansBold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  moreTitle: {
    fontFamily: FontFamily.syneBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  relatedCard: {
    width: (width - Spacing.base * 2 - 10) / 2,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.dark1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relatedThumb: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  relatedGrad: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  relatedTitle: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    fontFamily: FontFamily.dmSansBold,
    fontSize: 11,
    color: Colors.white,
    lineHeight: 15,
  },
});
