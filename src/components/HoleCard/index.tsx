import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Hole } from '@/types';
import EmotionTag from '@/components/EmotionTag';
import { ANONYMOUS_AVATARS, getPublishModeConfig } from '@/utils/emotion';
import { formatTime, getRemainingTime, formatDuration } from '@/utils/time';

interface HoleCardProps {
  hole: Hole;
  onLike?: (id: string) => void;
  onHug?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onFold?: (id: string) => void;
  onBlock?: (id: string) => void;
  onReport?: (id: string) => void;
  onClick?: (id: string) => void;
}

const HoleCard: React.FC<HoleCardProps> = ({
  hole,
  onLike,
  onHug,
  onFavorite,
  onFold,
  onBlock,
  onReport,
  onClick,
}) => {
  const [playing, setPlaying] = useState(false);

  const avatar = ANONYMOUS_AVATARS.find(a => a.id === hole.anonymousAvatar) || ANONYMOUS_AVATARS[0];
  const modeConfig = getPublishModeConfig(hole.mode);

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    Taro.showActionSheet({
      itemList: ['举报', '折叠', '屏蔽'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            onReport?.(hole.id);
            break;
          case 1:
            onFold?.(hole.id);
            break;
          case 2:
            Taro.showModal({
              title: '确认屏蔽',
              content: '屏蔽后将不再显示该用户的内容',
              confirmColor: '#EF4444',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  onBlock?.(hole.id);
                }
              },
            });
            break;
        }
      },
    });
  };

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(!playing);
    Taro.showToast({
      title: playing ? '已暂停' : '开始播放',
      icon: 'none',
    });
  };

  return (
    <View
      className={classnames(styles.holeCard, hole.isFolded && styles.folded)}
      onClick={() => onClick?.(hole.id)}
    >
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
        <View className={styles.headerRight}>
          {hole.location && (
            <Text className={styles.location}>
              <Text>📍</Text>
              {hole.location}
            </Text>
          )}
          <View className={styles.moreBtn} onClick={handleMore}>
            <Text>⋮</Text>
          </View>
        </View>
      </View>

      {hole.isVoice && hole.voiceDuration ? (
        <View className={styles.voiceContent} onClick={handlePlayVoice}>
          <View className={classnames(styles.playBtn, playing && styles.playing)}>
            <Text>{playing ? '⏸' : '▶'}</Text>
          </View>
          <Text className={styles.duration}>
            语音 · {formatDuration(hole.voiceDuration)}
          </Text>
        </View>
      ) : (
        <Text className={styles.content}>{hole.content}</Text>
      )}

      <View className={styles.tags}>
        <EmotionTag emotion={hole.emotion} />
        <View className={styles.modeTag}>
          <Text>{modeConfig.icon} {modeConfig.label}</Text>
        </View>
      </View>

      <View className={styles.expireInfo}>
        <Text>⏰</Text>
        <Text>{getRemainingTime(hole.expiresAt)}</Text>
      </View>

      <View className={styles.actions}>
        <View
          className={classnames(styles.actionItem, hole.isLiked && styles.liked)}
          onClick={(e) => {
            e.stopPropagation();
            onLike?.(hole.id);
          }}
        >
          <Text className={styles.icon}>{hole.isLiked ? '❤️' : '🤍'}</Text>
          <Text>{hole.likes}</Text>
        </View>
        <View
          className={classnames(styles.actionItem, hole.isHugged && styles.hugged)}
          onClick={(e) => {
            e.stopPropagation();
            onHug?.(hole.id);
          }}
        >
          <Text className={styles.icon}>{hole.isHugged ? '🤗' : '🫂'}</Text>
          <Text>{hole.hugs}</Text>
        </View>
        <View
          className={classnames(styles.actionItem, styles.comment)}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(hole.id);
          }}
        >
          <Text className={styles.icon}>💬</Text>
          <Text>{hole.comments}</Text>
        </View>
        <View
          className={classnames(styles.actionItem, hole.isFavorited && styles.favorited)}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite?.(hole.id);
          }}
        >
          <Text className={styles.icon}>{hole.isFavorited ? '⭐' : '☆'}</Text>
          <Text>{hole.favorites}</Text>
        </View>
      </View>

      {hole.isFolded && (
        <View className={styles.foldOverlay}>
          <Text>👁</Text>
          <Text>内容已折叠，点击展开</Text>
        </View>
      )}
    </View>
  );
};

export default HoleCard;
