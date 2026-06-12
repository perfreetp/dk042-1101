import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';
import type { EmotionType, PublishMode, VisibleDuration, Draft } from '@/types';
import { publishHole, saveDraft } from '@/services/holeService';
import { generateTimeId } from '@/utils/time';
import { getRandomAvatar } from '@/utils/emotion';

export function usePublish() {
  const [content, setContent] = useState('');
  const [emotion, setEmotion] = useState<EmotionType>('calm');
  const [mode, setMode] = useState<PublishMode>('listen');
  const [visibleDuration, setVisibleDuration] = useState<VisibleDuration>('24h');
  const [anonymousAvatar, setAnonymousAvatar] = useState(getRandomAvatar().id);
  const [isVoice, setIsVoice] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | undefined>();
  const [voiceDuration, setVoiceDuration] = useState<number | undefined>();
  const [recording, setRecording] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const canPublish = content.trim().length > 0 || isVoice;

  const handlePublish = useCallback(async () => {
    if (!canPublish) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    setPublishing(true);
    try {
      await publishHole({
        content: content.trim(),
        emotion,
        mode,
        visibleDuration,
        anonymousAvatar,
        isVoice,
        voiceUrl,
        voiceDuration,
      });

      Taro.showToast({ title: '发布成功', icon: 'success' });

      setContent('');
      setEmotion('calm');
      setMode('listen');
      setVisibleDuration('24h');
      setAnonymousAvatar(getRandomAvatar().id);
      setIsVoice(false);
      setVoiceUrl(undefined);
      setVoiceDuration(undefined);

      Taro.switchTab({ url: '/pages/plaza/index' });
    } catch (error) {
      console.error('[usePublish] 发布失败', error);
      Taro.showToast({ title: '发布失败，请重试', icon: 'none' });
    } finally {
      setPublishing(false);
    }
  }, [
    canPublish,
    content,
    emotion,
    mode,
    visibleDuration,
    anonymousAvatar,
    isVoice,
    voiceUrl,
    voiceDuration,
  ]);

  const handleSaveDraft = useCallback(async () => {
    if (!canPublish) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    try {
      const draft: Draft = {
        id: `draft_${generateTimeId()}`,
        content: content.trim(),
        emotion,
        mode,
        visibleDuration,
        anonymousAvatar,
        isVoice,
        voiceUrl,
        voiceDuration,
        updatedAt: new Date().toISOString(),
      };

      await saveDraft(draft);
      Taro.showToast({ title: '已保存到草稿箱', icon: 'success' });
    } catch (error) {
      console.error('[usePublish] 保存草稿失败', error);
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  }, [
    canPublish,
    content,
    emotion,
    mode,
    visibleDuration,
    anonymousAvatar,
    isVoice,
    voiceUrl,
    voiceDuration,
  ]);

  const handleLoadDraft = useCallback((draft: Draft) => {
    setContent(draft.content);
    setEmotion(draft.emotion);
    setMode(draft.mode);
    setVisibleDuration(draft.visibleDuration);
    setAnonymousAvatar(draft.anonymousAvatar);
    setIsVoice(draft.isVoice);
    setVoiceUrl(draft.voiceUrl);
    setVoiceDuration(draft.voiceDuration);
  }, []);

  const handleStartRecording = useCallback(() => {
    setRecording(true);
    Taro.showToast({ title: '开始录音', icon: 'none' });
  }, []);

  const handleStopRecording = useCallback(() => {
    setRecording(false);
    setIsVoice(true);
    setVoiceDuration(30);
    Taro.showToast({ title: '录音结束', icon: 'success' });
  }, []);

  const resetForm = useCallback(() => {
    setContent('');
    setEmotion('calm');
    setMode('listen');
    setVisibleDuration('24h');
    setAnonymousAvatar(getRandomAvatar().id);
    setIsVoice(false);
    setVoiceUrl(undefined);
    setVoiceDuration(undefined);
  }, []);

  return {
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
    voiceUrl,
    voiceDuration,
    recording,
    publishing,
    canPublish,
    handlePublish,
    handleSaveDraft,
    handleLoadDraft,
    handleStartRecording,
    handleStopRecording,
    resetForm,
  };
}

export default usePublish;
