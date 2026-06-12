import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Hole } from '@/types';
import { getHistoryHoles, deleteHole } from '@/services/holeService';
import { ANONYMOUS_AVATARS, getEmotionConfig, getPublishModeConfig, getVisibleDurationConfig } from '@/utils/emotion';
import { formatTime } from '@/utils/time';

type TabType = 'all' | 'active' | 'expired';

const HistoryPage: React.FC = () => {
  const [holes, setHoles] = useState<Hole[]>([]);
  const [tab, setTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistoryHoles();
      setHoles(data);
    } catch (error) {
      console.error('[HistoryPage] 获取历史树洞失败', error);
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

  const isExpired = (hole: Hole) => {
    return new Date(hole.expiresAt) < new Date();
  };

  const filteredHoles = holes.filter(hole => {
    if (tab === 'active') return !isExpired(hole);
    if (tab === 'expired') return isExpired(hole);
    return true;
  });

  const handleHoleClick = useCallback((hole: Hole) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${hole.id}`,
    });
  }, []);

  const handleMore = useCallback((hole: Hole) => {
    Taro.showActionSheet({
      itemList: ['删除树洞'],
      success: () => {
        Taro.showModal({
          title: '删除树洞',
          content: '确定要删除这条树洞吗？删除后无法恢复。',
          confirmColor: '#EF4444',
          success: async (res) => {
            if (res.confirm) {
              try {
                await deleteHole(hole.id);
                setHoles(prev => prev.filter(h => h.id !== hole.id));
                Taro.showToast({ title: '已删除', icon: 'success' });
              } catch (error) {
                console.error('[HistoryPage] 删除失败', error);
                Taro.showToast({ title: '删除失败', icon: 'none' });
              }
            }
          },
        });
      },
    });
  }, []);

  const handleCreate = useCallback(() => {
    Taro.switchTab({ url: '/pages/publish/index' });
  }, []);

  const getAvatar = (avatarId: string) => {
    return ANONYMOUS_AVATARS.find(a => a.id === avatarId) || ANONYMOUS_AVATARS[0];
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'expired', label: '已过期' },
  ];

  return (
    <View className={styles.historyPage}>
      <Text className={styles.tip}>
        这里是你发布过的所有树洞记录。已过期的树洞将不再在广场中显示，但你仍可以查看。
      </Text>

      <View className={styles.header}>
        <Text className={styles.title}>我的树洞</Text>
        <Text className={styles.count}>共 {holes.length} 条</Text>
      </View>

      <View className={styles.tabBar}>
        {tabs.map(tabItem => (
          <View
          key={tabItem.key}
          className={classnames(styles.tabItem, tab === tabItem.key && styles.active)}
          onClick={() => setTab(tabItem.key)}
        >
          <Text>{tabItem.label}</Text>
        </View>
      </View>

      {filteredHoles.length === 0 ? (
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyIcon}>🌳</Text>
          <Text className={styles.emptyTitle}>
            {tab === 'active' ? '暂无进行中的树洞' :
             tab === 'expired' ? '暂无已过期的树洞' : '还没有发布过树洞'}
          </Text>
          <Text className={styles.emptyDesc}>
            {tab === 'active' ? '你的树洞都已过期或被删除' :
             tab === 'expired' ? '发布的树洞还在有效期内' :
             '在这里记录你的心情，匿名倾诉给陌生人听'}
          </Text>
          <View className={styles.createBtn} onClick={handleCreate}>
            <Text>去发布树洞</Text>
          </View>
        </View>
      ) : (
        <View className={styles.holeList}>
          {filteredHoles.map(hole => {
            const avatar = getAvatar(hole.anonymousAvatar);
            const emotionConfig = getEmotionConfig(hole.emotion);
            const modeConfig = getPublishModeConfig(hole.mode);
            const durationConfig = getVisibleDurationConfig(hole.visibleDuration);
            const expired = isExpired(hole);

            return (
              <View
                key={hole.id}
                className={classnames(styles.holeCard, expired && styles.expired)}
              >
                <View className={styles.holeHeader}>
                  <View className={styles.avatar} style={{ backgroundColor: avatar.bgColor }}>
                    <Text>{avatar.emoji}</Text>
                  </View>
                  <View className={styles.meta}>
                    <Text className={styles.name}>{hole.anonymousName}</Text>
                    <Text className={styles.time}>{formatTime(hole.createdAt)}</Text>
                  </View>
                  <View className={styles.moreBtn} onClick={(e) => { e.stopPropagation(); handleMore(hole); }}>
                    <Text>⋮</Text>
                  </View>
                </View>

                {hole.isVoice ? (
                  <View className={classnames(styles.holeContent, styles.voice)} onClick={() => handleHoleClick(hole)}>
                    <Text className={styles.playIcon}>▶</Text>
                    <Text className={styles.duration}>语音 {hole.voiceDuration ? `${hole.voiceDuration}秒` : ''}</Text>
                  </View>
                ) : (
                  <View onClick={() => handleHoleClick(hole)}>
                    <Text className={styles.holeContent}>{hole.content}</Text>
                  </View>
                )}

                <View className={styles.holeTags} onClick={() => handleHoleClick(hole)}>
                  <Text className={`${styles.tag} ${styles.emotion}`}>
                    {emotionConfig.emoji} {emotionConfig.label}
                  </Text>
                  <Text className={`${styles.tag} ${styles.mode}`}>
                    {modeConfig.icon} {modeConfig.label}
                  </Text>
                  <Text className={`${styles.tag} ${styles.duration}`}>
                    ⏰ {durationConfig.label}
                  </Text>
                </View>

                <View className={styles.holeStats} onClick={() => handleHoleClick(hole)}>
                  <View className={styles.statItem}>
                    <Text className={styles.icon}>❤️</Text>
                    <Text className={styles.count}>{hole.likes}</Text>
                  </View>
                  <View className={styles.statItem}>
                    <Text className={styles.icon}>🤗</Text>
                    <Text className={styles.count}>{hole.hugs}</Text>
                  </View>
                  <View className={styles.statItem}>
                    <Text className={styles.icon}>💬</Text>
                    <Text className={styles.count}>{hole.comments}</Text>
                  </View>
                  <View className={styles.statItem}>
                    <Text className={styles.icon}>⭐</Text>
                    <Text className={styles.count}>{hole.favorites}</Text>
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

export default HistoryPage;
