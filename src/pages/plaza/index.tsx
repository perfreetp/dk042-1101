import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { FilterType, Hole } from '@/types';
import HoleCard from '@/components/HoleCard';
import EmptyState from '@/components/EmptyState';
import { useHoleList } from '@/hooks/useHoleList';

const FILTERS: { type: FilterType; label: string; icon: string }[] = [
  { type: 'latest', label: '最新', icon: '✨' },
  { type: 'nearby', label: '同城', icon: '📍' },
  { type: 'similar', label: '相似心情', icon: '💫' },
];

const PlazaPage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('latest');
  const {
    holes,
    loading,
    refreshing,
    hasMore,
    onRefresh,
    onLoadMore,
    handleLike,
    handleHug,
    handleFavorite,
    handleFold,
    handleBlock,
  } = useHoleList(filter);

  const didFirstMount = useRef(false);

  useDidShow(() => {
    console.log('[PlazaPage] 页面显示');
    if (didFirstMount.current) {
      onRefresh();
    } else {
      didFirstMount.current = true;
    }
  });

  usePullDownRefresh(() => {
    onRefresh();
  });

  useReachBottom(() => {
    onLoadMore();
  });

  const handleFilterChange = useCallback((type: FilterType) => {
    setFilter(type);
  }, []);

  const handleCardClick = useCallback((id: string) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`,
    });
  }, []);

  const handleReport = useCallback((id: string) => {
    Taro.navigateTo({
      url: `/pages/report/index?targetId=${id}&targetType=hole`,
    });
  }, []);

  const handleHelpClick = useCallback(() => {
    Taro.navigateTo({
      url: '/pages/helpline/index',
    });
  }, []);

  const visibleHoles = holes.filter(h => !h.isBlocked);

  return (
    <View className={styles.plazaPage}>
      <View className={styles.header}>
        <Text className={styles.title}>🌙 树洞广场</Text>
        <View className={styles.helpBtn} onClick={handleHelpClick}>
          <Text>📞</Text>
        </View>
      </View>

      <View className={styles.filterBar}>
        <ScrollView className={styles.filterScroll} scrollX enableFlex>
          {FILTERS.map(f => (
            <View
              key={f.type}
              className={classnames(styles.filterItem, filter === f.type && styles.active)}
              onClick={() => handleFilterChange(f.type)}
            >
              <Text>{f.icon} {f.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.content}>
        {visibleHoles.length === 0 && !loading ? (
          <View className={styles.emptyWrap}>
            <EmptyState
              emoji="🌙"
              title="这里还很安静"
              description="成为第一个分享心情的人吧"
            />
          </View>
        ) : (
          visibleHoles.map((hole: Hole) => (
            <HoleCard
              key={hole.id}
              hole={hole}
              onLike={handleLike}
              onHug={handleHug}
              onFavorite={handleFavorite}
              onFold={handleFold}
              onBlock={handleBlock}
              onReport={handleReport}
              onClick={handleCardClick}
            />
          ))
        )}

        {loading && (
          <View className={styles.loadingMore}>加载中...</View>
        )}

        {!loading && !hasMore && visibleHoles.length > 0 && (
          <View className={styles.noMore}>— 没有更多了 —</View>
        )}
      </View>
    </View>
  );
};

export default PlazaPage;
