import { useState, useEffect, useCallback } from 'react';
import type { Hole, FilterType, PaginatedResult } from '@/types';
import { getHoleList, likeHole, hugHole, favoriteHole, foldHole, blockHole } from '@/services/holeService';

export function useHoleList(filter: FilterType) {
  const [holes, setHoles] = useState<Hole[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchHoles = useCallback(async (isRefresh: boolean = false) => {
    const currentPage = isRefresh ? 1 : page;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result: PaginatedResult<Hole> = await getHoleList(filter, {
        page: currentPage,
        pageSize,
      });

      if (isRefresh) {
        setHoles(result.list);
        setPage(2);
      } else {
        setHoles(prev => [...prev, ...result.list]);
        setPage(prev => prev + 1);
      }
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('[useHoleList] 获取树洞列表失败', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, page]);

  const onRefresh = useCallback(() => {
    fetchHoles(true);
  }, [fetchHoles]);

  const onLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchHoles(false);
    }
  }, [loading, hasMore, fetchHoles]);

  const handleLike = useCallback(async (id: string) => {
    try {
      const isLiked = await likeHole(id);
      setHoles(prev =>
        prev.map(h =>
          h.id === id
            ? { ...h, isLiked, likes: isLiked ? h.likes + 1 : Math.max(0, h.likes - 1) }
            : h
        )
      );
    } catch (error) {
      console.error('[useHoleList] 点赞失败', error);
    }
  }, []);

  const handleHug = useCallback(async (id: string) => {
    try {
      const isHugged = await hugHole(id);
      setHoles(prev =>
        prev.map(h =>
          h.id === id
            ? { ...h, isHugged, hugs: isHugged ? h.hugs + 1 : Math.max(0, h.hugs - 1) }
            : h
        )
      );
    } catch (error) {
      console.error('[useHoleList] 拥抱失败', error);
    }
  }, []);

  const handleFavorite = useCallback(async (id: string) => {
    try {
      const isFavorited = await favoriteHole(id);
      setHoles(prev =>
        prev.map(h =>
          h.id === id
            ? { ...h, isFavorited, favorites: isFavorited ? h.favorites + 1 : Math.max(0, h.favorites - 1) }
            : h
        )
      );
    } catch (error) {
      console.error('[useHoleList] 收藏失败', error);
    }
  }, []);

  const handleFold = useCallback(async (id: string) => {
    try {
      await foldHole(id);
      setHoles(prev => prev.map(h => (h.id === id ? { ...h, isFolded: true } : h)));
    } catch (error) {
      console.error('[useHoleList] 折叠失败', error);
    }
  }, []);

  const handleBlock = useCallback(async (id: string) => {
    try {
      await blockHole(id);
      setHoles(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error('[useHoleList] 屏蔽失败', error);
    }
  }, []);

  useEffect(() => {
    fetchHoles(true);
  }, [filter]);

  return {
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
  };
}

export default useHoleList;
