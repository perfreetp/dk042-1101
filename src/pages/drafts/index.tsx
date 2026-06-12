import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import type { Draft } from '@/types';
import { getDrafts, deleteDraft, publishHole } from '@/services/holeService';
import { ANONYMOUS_AVATARS, getEmotionConfig, getPublishModeConfig, getVisibleDurationConfig } from '@/utils/emotion';
import { formatTime } from '@/utils/time';
import storage from '@/utils/storage';

const DraftsPage: React.FC = () => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDrafts();
      setDrafts(data);
    } catch (error) {
      console.error('[DraftsPage] 获取草稿失败', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useDidShow(() => {
    fetchData();
  });

  const handleEdit = useCallback((draft: Draft) => {
    storage.set(storage.keys.DRAFTS_EDITING, draft.id);
    Taro.switchTab({
      url: '/pages/publish/index',
    });
  }, []);

  const handlePublish = useCallback((draft: Draft) => {
    Taro.showModal({
      title: '发布草稿',
      content: '确定要发布这条草稿吗？',
      confirmColor: '#7C5CFF',
      success: async (res) => {
        if (res.confirm) {
          try {
            await publishHole({
              content: draft.content,
              emotion: draft.emotion,
              mode: draft.mode,
              visibleDuration: draft.visibleDuration,
              anonymousAvatar: draft.anonymousAvatar,
              isVoice: draft.isVoice,
              voiceUrl: draft.voiceUrl,
              voiceDuration: draft.voiceDuration,
            });
            await deleteDraft(draft.id);
            setDrafts(prev => prev.filter(d => d.id !== draft.id));
            Taro.showToast({ title: '发布成功', icon: 'success' });
            setTimeout(() => {
              Taro.switchTab({ url: '/pages/plaza/index' });
            }, 1000);
          } catch (error) {
            console.error('[DraftsPage] 发布失败', error);
            Taro.showToast({ title: '发布失败，请重试', icon: 'none' });
          }
        }
      },
    });
  }, []);

  const handleDelete = useCallback((draft: Draft) => {
    Taro.showActionSheet({
      itemList: ['删除草稿'],
      success: async () => {
        Taro.showModal({
          title: '删除草稿',
          content: '确定要删除这条草稿吗？删除后无法恢复。',
          confirmColor: '#EF4444',
          success: async (res) => {
            if (res.confirm) {
              try {
                await deleteDraft(draft.id);
                setDrafts(prev => prev.filter(d => d.id !== draft.id));
                Taro.showToast({ title: '已删除', icon: 'success' });
              } catch (error) {
                console.error('[DraftsPage] 删除失败', error);
                Taro.showToast({ title: '删除失败', icon: 'none' });
              }
            }
          },
        });
      },
    });
  }, []);

  const handleClearAll = useCallback(() => {
    if (drafts.length === 0) return;
    Taro.showModal({
      title: '清空草稿箱',
      content: `确定要清空全部 ${drafts.length} 条草稿吗？此操作不可恢复。`,
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            for (const draft of drafts) {
              await deleteDraft(draft.id);
            }
            setDrafts([]);
            Taro.showToast({ title: '已清空', icon: 'success' });
          } catch (error) {
            console.error('[DraftsPage] 清空失败', error);
            Taro.showToast({ title: '清空失败', icon: 'none' });
          }
        }
      },
    });
  }, [drafts]);

  const handleCreate = useCallback(() => {
    Taro.switchTab({ url: '/pages/publish/index' });
  }, []);

  const getAvatar = (avatarId: string) => {
    return ANONYMOUS_AVATARS.find(a => a.id === avatarId) || ANONYMOUS_AVATARS[0];
  };

  return (
    <View className={styles.draftsPage}>
      <Text className={styles.tip}>
        草稿仅保存在本地，卸载应用会丢失草稿内容，请及时发布或备份。
      </Text>

      <View className={styles.header}>
        <Text className={styles.title}>草稿箱</Text>
        <Text className={styles.count}>共 {drafts.length} 条</Text>
        {drafts.length > 0 && (
          <Text className={styles.clearBtn} onClick={handleClearAll}>清空</Text>
        )}
      </View>

      {drafts.length === 0 ? (
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyIcon}>📝</Text>
          <Text className={styles.emptyTitle}>暂无草稿</Text>
          <Text className={styles.emptyDesc}>你还没有保存任何草稿</Text>
          <View className={styles.createBtn} onClick={handleCreate}>
            <Text>去发布树洞</Text>
          </View>
        </View>
      ) : (
        <View className={styles.draftList}>
          {drafts.map(draft => {
            const avatar = getAvatar(draft.anonymousAvatar);
            const emotionConfig = getEmotionConfig(draft.emotion);
            const modeConfig = getPublishModeConfig(draft.mode);
            const durationConfig = getVisibleDurationConfig(draft.visibleDuration);

            return (
              <View key={draft.id} className={styles.draftCard}>
                <View className={styles.draftHeader}>
                  <View className={styles.avatar} style={{ backgroundColor: avatar.bgColor }}>
                    <Text>{avatar.emoji}</Text>
                  </View>
                  <View className={styles.meta}>
                    <Text className={styles.time}>{formatTime(draft.updatedAt)}</Text>
                    <View className={styles.tags}>
                      <Text className={`${styles.tag} ${styles.emotion}`}>
                        {emotionConfig.emoji} {emotionConfig.label}
                      </Text>
                      <Text className={`${styles.tag} ${styles.mode}`}>
                        {modeConfig.icon} {modeConfig.label}
                      </Text>
                      <Text className={`${styles.tag} ${styles.duration}`}>
                        ⏰ {durationConfig.label}
                      </Text>
                      {draft.isVoice && (
                        <Text className={`${styles.tag} ${styles.voice}`}>
                          🎤 语音
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className={styles.moreBtn} onClick={() => handleDelete(draft)}>
                    <Text>⋮</Text>
                  </View>
                </View>

                {draft.isVoice ? (
                  <View className={`${styles.draftContent} ${styles.voice}`}>
                    <Text className={styles.playIcon}>▶</Text>
                    <Text className={styles.duration}>语音 {draft.voiceDuration ? `${draft.voiceDuration}秒` : ''}</Text>
                  </View>
                ) : (
                  <Text className={styles.draftContent}>{draft.content}</Text>
                )}

                <View className={styles.draftActions}>
                  <View className={`${styles.actionBtn} ${styles.edit}`} onClick={() => handleEdit(draft)}>
                    <Text>编辑</Text>
                  </View>
                  <View className={`${styles.actionBtn} ${styles.publish}`} onClick={() => handlePublish(draft)}>
                    <Text>发布</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default DraftsPage;
