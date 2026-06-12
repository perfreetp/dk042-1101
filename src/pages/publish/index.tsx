import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { EmotionType, PublishMode, VisibleDuration, AnonymousAvatar, Draft } from '@/types';
import { EMOTION_CONFIG, PUBLISH_MODE_CONFIG, VISIBLE_DURATION_CONFIG, getAnonymousName, ANONYMOUS_AVATARS } from '@/utils/emotion';
import AvatarSelector from '@/components/AvatarSelector';
import { usePublish } from '@/hooks/usePublish';
import { formatDuration } from '@/utils/time';
import { getDrafts, deleteDraft } from '@/services/holeService';

const PublishPage: React.FC = () => {
  const router = useRouter();
  const draftId = router.params.draftId as string | undefined;

  const {
    content,
    setContent,
    emotion,
    setEmotion,
    mode,
    setMode,
    visibleDuration,
    setVisibleDuration,
    anonymousAvatar,
    setAnonymousAvatar,
    isVoice,
    setIsVoice,
    voiceDuration,
    recording,
    publishing,
    canPublish,
    handlePublish,
    handleSaveDraft,
    handleStartRecording,
    handleStopRecording,
    handleLoadDraft,
    resetForm,
  } = usePublish();

  const [anonymousName] = useState(getAnonymousName());
  const [playingVoice, setPlayingVoice] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (draftId) {
      const loadDraft = async () => {
        try {
          const drafts = await getDrafts();
          const draft = drafts.find(d => d.id === draftId);
          if (draft) {
            setCurrentDraft(draft);
            handleLoadDraft(draft);
            Taro.showToast({ title: '已加载草稿', icon: 'success' });
          }
        } catch (error) {
          console.error('[PublishPage] 加载草稿失败', error);
          Taro.showToast({ title: '加载草稿失败', icon: 'none' });
        }
      };
      loadDraft();
    } else {
      resetForm();
      setCurrentDraft(null);
    }
  }, [draftId, handleLoadDraft, resetForm]);

  useDidShow(() => {
    console.log('[PublishPage] 页面显示');
  });

  const handlePublishWithDraft = useCallback(async () => {
    if (currentDraft) {
      const originalPublish = handlePublish;
      const deleteDraftAfterPublish = async () => {
        await originalPublish();
        try {
          await deleteDraft(currentDraft.id);
        } catch (error) {
          console.error('[PublishPage] 删除草稿失败', error);
        }
      };
      await deleteDraftAfterPublish();
    } else {
      await handlePublish();
    }
  }, [currentDraft, handlePublish]);

  const handleEmotionSelect = useCallback((type: EmotionType) => {
    setEmotion(type);
  }, [setEmotion]);

  const handleModeSelect = useCallback((type: PublishMode) => {
    setMode(type);
  }, [setMode]);

  const handleDurationSelect = useCallback((type: VisibleDuration) => {
    setVisibleDuration(type);
  }, [setVisibleDuration]);

  const handleAvatarSelect = useCallback((avatar: AnonymousAvatar) => {
    setAnonymousAvatar(avatar.id);
  }, [setAnonymousAvatar]);

  const handleDraftClick = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/drafts/index',
    });
  }, []);

  const handleTypeToggle = useCallback(() => {
    setIsVoice(!isVoice);
  }, [isVoice, setIsVoice]);

  const handlePlayVoice = useCallback(() => {
    setPlayingVoice(!playingVoice);
    Taro.showToast({
      title: playingVoice ? '已暂停' : '开始播放',
      icon: 'none',
    });
  }, [playingVoice]);

  const waveformBars = Array.from({ length: 20 }, (_, i) => ({
    height: 30 + Math.random() * 70,
    active: playingVoice && i < Math.floor((Date.now() % 20000) / 1000),
  }));

  return (
    <View className={styles.publishPage}>
      <View className={styles.header}>
        <Text className={styles.title}>✨ 发布树洞</Text>
        <View className={styles.draftBtn} onClick={handleDraftClick}>
          <Text>📝</Text>
          <Text>草稿</Text>
        </View>
      </View>

      <ScrollView className={styles.content} scrollY>
        <View className={classnames(styles.section, styles.inputSection)}>
          <Text className={styles.sectionTitle}>💬 说说你的心情</Text>

          {!isVoice ? (
            <View className={styles.inputWrapper}>
              <Textarea
                className={styles.textarea}
                value={content}
                onInput={(e) => setContent(e.detail.value)}
                placeholder="在这里倾诉你的心情...这里没有人认识你，可以放心说出来"
                maxlength={500}
                autoHeight
                showConfirmBar={false}
                adjustPosition
              />
              <Text className={styles.wordCount}>{content.length}/500</Text>
              <View
                className={classnames(styles.typeToggle)}
                onClick={handleTypeToggle}
              >
                <Text>🎤 语音</Text>
              </View>
            </View>
          ) : (
            <View className={styles.voiceSection}>
              {!isVoice || !voiceDuration ? (
                <>
                  <View
                    className={classnames(styles.recordBtn, recording && styles.recording)}
                    onTouchStart={handleStartRecording}
                    onTouchEnd={handleStopRecording}
                  >
                    <Text>{recording ? '⏹' : '🎤'}</Text>
                  </View>
                  <View className={styles.recordTip}>
                    {recording ? (
                      <>
                        <Text className={styles.time}>00:30</Text>
                        <Text>正在录音，松开结束</Text>
                      </>
                    ) : (
                      <Text>按住说话，最长60秒</Text>
                    )}
                  </View>
                  <View
                    className={classnames(styles.typeToggle, styles.active)}
                    onClick={handleTypeToggle}
                    style={{ position: 'relative', left: 0, bottom: 0, marginTop: 24 }}
                  >
                    <Text>⌨️ 文字</Text>
                  </View>
                </>
              ) : (
                <>
                  <View className={styles.voicePreview}>
                    <View className={styles.playBtn} onClick={handlePlayVoice}>
                      <Text>{playingVoice ? '⏸' : '▶'}</Text>
                    </View>
                    <View className={styles.waveform}>
                      {waveformBars.map((bar, i) => (
                        <View
                          key={i}
                          className={classnames(styles.bar, bar.active && styles.active)}
                          style={{ height: `${bar.height}%` }}
                        />
                      ))}
                    </View>
                    <Text className={styles.duration}>{formatDuration(voiceDuration)}</Text>
                    <View className={styles.reRecord} onClick={() => setIsVoice(false)}>
                      重录
                    </View>
                  </View>
                  <View
                    className={classnames(styles.typeToggle, styles.active)}
                    onClick={handleTypeToggle}
                    style={{ position: 'relative', left: 0, bottom: 0, marginTop: 24 }}
                  >
                    <Text>⌨️ 文字</Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        <View className={classnames(styles.section, styles.emotionSection)}>
          <Text className={styles.sectionTitle}>🎭 你现在的心情是？</Text>
          <ScrollView className={styles.emotionScroll} scrollX enableFlex>
            {EMOTION_CONFIG.map(e => (
              <View
                key={e.type}
                className={classnames(styles.emotionItem, emotion === e.type && styles.active)}
                onClick={() => handleEmotionSelect(e.type)}
              >
                <Text className={styles.emoji}>{e.emoji}</Text>
                <Text className={classnames(styles.label, emotion === e.type && styles.active)}>
                  {e.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={classnames(styles.section, styles.modeSection)}>
          <Text className={styles.sectionTitle}>🎯 我想要...</Text>
          <View className={styles.modeGrid}>
            {PUBLISH_MODE_CONFIG.map(m => (
              <View
                key={m.type}
                className={classnames(styles.modeItem, mode === m.type && styles.active)}
                onClick={() => handleModeSelect(m.type)}
              >
                <Text className={styles.icon}>{m.icon}</Text>
                <Text className={styles.label}>{m.label}</Text>
                <Text className={styles.desc}>{m.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={classnames(styles.section, styles.durationSection)}>
          <Text className={styles.sectionTitle}>⏰ 可见时长</Text>
          <View className={styles.durationGrid}>
            {VISIBLE_DURATION_CONFIG.map(d => (
              <View
                key={d.type}
                className={classnames(styles.durationItem, visibleDuration === d.type && styles.active)}
                onClick={() => handleDurationSelect(d.type)}
              >
                <Text>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <AvatarSelector
            selectedAvatarId={anonymousAvatar}
            anonymousName={anonymousName}
            onSelect={handleAvatarSelect}
          />
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={styles.draftBtn}
          onClick={handleSaveDraft}
        >
          <Text>💾 存草稿</Text>
        </View>
        <View
          className={styles.publishBtn}
          onClick={handlePublishWithDraft}
          disabled={!canPublish || publishing}
        >
          <Text>{publishing ? '发布中...' : '🚀 发布'}</Text>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
