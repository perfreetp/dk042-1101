import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Hole, Comment } from '@/types';
import { getHoleDetail, getComments, addComment, likeHole, hugHole, favoriteHole, foldHole, blockHole } from '@/services/holeService';
import { ANONYMOUS_AVATARS, getPublishModeConfig } from '@/utils/emotion';
import { formatTime, getRemainingTime, formatDuration } from '@/utils/time';
import EmotionTag from '@/components/EmotionTag';
import CommentItem from '@/components/CommentItem';
import EmptyState from '@/components/EmptyState';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const holeId = router.params.id as string;

  const [hole, setHole] = useState<Hole | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [playingVoice, setPlayingVoice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!holeId) return;

    setLoading(true);
    try {
      const [holeData, commentsData] = await Promise.all([
        getHoleDetail(holeId),
        getComments(holeId),
      ]);
      setHole(holeData);
      setComments(commentsData);
    } catch (error) {
      console.error('[DetailPage] 获取详情失败', error);
    } finally {
      setLoading(false);
    }
  }, [holeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useDidShow(() => {
    fetchData();
  });

  const handleLike = useCallback(async () => {
    if (!hole) return;
    try {
      const isLiked = await likeHole(hole.id);
      setHole(prev =>
        prev ? {
          ...prev,
          isLiked,
          likes: isLiked ? prev.likes + 1 : Math.max(0, prev.likes - 1),
        } : null
      );
    } catch (error) {
      console.error('[DetailPage] 点赞失败', error);
    }
  }, [hole]);

  const handleHug = useCallback(async () => {
    if (!hole) return;
    try {
      const isHugged = await hugHole(hole.id);
      setHole(prev =>
        prev ? {
          ...prev,
          isHugged,
          hugs: isHugged ? prev.hugs + 1 : Math.max(0, prev.hugs - 1),
        } : null
      );
    } catch (error) {
      console.error('[DetailPage] 拥抱失败', error);
    }
  }, [hole]);

  const handleFavorite = useCallback(async () => {
    if (!hole) return;
    try {
      const isFavorited = await favoriteHole(hole.id);
      setHole(prev =>
        prev ? {
          ...prev,
          isFavorited,
          favorites: isFavorited ? prev.favorites + 1 : Math.max(0, prev.favorites - 1),
        } : null
      );
      Taro.showToast({
        title: isFavorited ? '已收藏' : '已取消收藏',
        icon: 'none',
      });
    } catch (error) {
      console.error('[DetailPage] 收藏失败', error);
    }
  }, [hole]);

  const handleMore = useCallback(() => {
    if (!hole) return;
    Taro.showActionSheet({
      itemList: ['举报', '折叠', '屏蔽'],
      success: async (res) => {
        try {
          switch (res.tapIndex) {
            case 0:
              Taro.navigateTo({
                url: `/pages/report/index?targetId=${hole.id}&targetType=hole`,
              });
              break;
            case 1:
              await foldHole(hole.id);
              setHole(prev => prev ? { ...prev, isFolded: true } : null);
              Taro.showToast({ title: '已折叠', icon: 'success' });
              break;
            case 2:
              Taro.showModal({
                title: '确认屏蔽',
                content: '屏蔽后将不再显示该用户的内容',
                confirmColor: '#EF4444',
                success: async (modalRes) => {
                  if (modalRes.confirm) {
                    await blockHole(hole.id);
                    Taro.showToast({ title: '已屏蔽', icon: 'success' });
                    setTimeout(() => Taro.navigateBack(), 500);
                  }
                },
              });
              break;
          }
        } catch (error) {
          console.error('[DetailPage] 操作失败', error);
        }
      },
    });
  }, [hole]);

  const handlePlayVoice = useCallback(() => {
    setPlayingVoice(!playingVoice);
    Taro.showToast({
      title: playingVoice ? '已暂停' : '开始播放',
      icon: 'none',
    });
  }, [playingVoice]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim() || !hole) return;

    setSubmitting(true);
    try {
      const newComment = await addComment({
        holeId: hole.id,
        content: commentText.trim(),
      });
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      setHole(prev => prev ? { ...prev, comments: updatedComments.length } : null);
      setCommentText('');
      Taro.showToast({ title: '回复成功', icon: 'success' });
    } catch (error) {
      console.error('[DetailPage] 评论失败', error);
      Taro.showToast({ title: '回复失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  }, [commentText, hole]);

  const handleCommentLike = useCallback(async (id: string) => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === id) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: isLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );
  }, []);

  const handleCommentReport = useCallback((id: string) => {
    Taro.navigateTo({
      url: `/pages/report/index?targetId=${id}&targetType=comment`,
    });
  }, []);

  const avatar = hole?.anonymousAvatar
    ? ANONYMOUS_AVATARS.find(a => a.id === hole.anonymousAvatar) || ANONYMOUS_AVATARS[0]
    : ANONYMOUS_AVATARS[0];
  const modeConfig = hole ? getPublishModeConfig(hole.mode) : null;

  const waveformBars = Array.from({ length: 24 }, (_, i) => ({
    height: 30 + Math.random() * 70,
    active: playingVoice && i < Math.floor((Date.now() % 24000) / 1000),
  }));

  return (
    <View className={styles.detailPage}>
      <View className={styles.content}>
        {hole && (
          <View className={styles.holeDetail}>
            <View className={styles.header}>
              <View className={styles.userInfo}>
                <View className={styles.avatar} style={{ backgroundColor: avatar.bgColor }}>
                  <Text>{avatar.emoji}</Text>
                </View>
                <View className={styles.userMeta}>
                  <Text className={styles.name}>{hole.anonymousName}</Text>
                  <Text className={styles.time}>{formatTime(hole.createdAt)}</Text>
                </View>
              </View>
              <View className={styles.moreBtn} onClick={handleMore}>
                <Text>⋮</Text>
              </View>
            </View>

            {hole.isVoice && hole.voiceDuration ? (
              <View className={styles.voiceContent} onClick={handlePlayVoice}>
                <View className={classnames(styles.playBtn, playingVoice && styles.playing)}>
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
                <Text className={styles.duration}>{formatDuration(hole.voiceDuration)}</Text>
              </View>
            ) : (
              <Text className={styles.contentText}>{hole.content}</Text>
            )}

            <View className={styles.tags}>
              <EmotionTag emotion={hole.emotion} />
              {modeConfig && (
                <View className={styles.modeTag}>
                  <Text>{modeConfig.icon} {modeConfig.label}</Text>
                </View>
              )}
            </View>

            <View className={styles.metaInfo}>
              {hole.location && (
                <View className={styles.item}>
                  <Text>📍</Text>
                  <Text>{hole.location}</Text>
                </View>
              )}
              <View className={styles.item}>
                <Text>⏰</Text>
                <Text>{getRemainingTime(hole.expiresAt)}</Text>
              </View>
            </View>

            <View className={styles.actions}>
              <View
                className={classnames(styles.actionItem, hole.isLiked && styles.liked)}
                onClick={handleLike}
              >
                <Text className={styles.icon}>{hole.isLiked ? '❤️' : '🤍'}</Text>
                <Text className={styles.count}>{hole.likes}</Text>
              </View>
              <View
                className={classnames(styles.actionItem, hole.isHugged && styles.hugged)}
                onClick={handleHug}
              >
                <Text className={styles.icon}>{hole.isHugged ? '🤗' : '🫂'}</Text>
                <Text className={styles.count}>{hole.hugs}</Text>
              </View>
              <View className={styles.actionItem}>
                <Text className={styles.icon}>💬</Text>
                <Text className={styles.count}>{hole.comments}</Text>
              </View>
              <View
                className={classnames(styles.actionItem, hole.isFavorited && styles.favorited)}
                onClick={handleFavorite}
              >
                <Text className={styles.icon}>{hole.isFavorited ? '⭐' : '☆'}</Text>
                <Text className={styles.count}>{hole.favorites}</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.commentsSection}>
          <Text className={styles.sectionTitle}>💬 全部评论 ({comments.length})</Text>
          {comments.length === 0 ? (
            <View className={styles.emptyWrap}>
              <EmptyState
                emoji="💭"
                title="暂无评论"
                description="来说说你的想法吧"
              />
            </View>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleCommentLike}
                onReport={handleCommentReport}
              />
            ))
          )}
        </View>
      </View>

      <View className={styles.inputBar}>
        <View className={styles.inputWrapper}>
          <Input
            className={styles.input}
            value={commentText}
            onInput={(e) => setCommentText(e.detail.value)}
            placeholder="说点什么安慰一下TA..."
            confirmType="send"
            onConfirm={handleSendComment}
          />
        </View>
        <View
          className={styles.sendBtn}
          onClick={handleSendComment}
          disabled={!commentText.trim() || submitting}
        >
          <Text>{submitting ? '发送中' : '发送'}</Text>
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
