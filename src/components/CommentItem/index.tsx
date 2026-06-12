import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Comment } from '@/types';
import { ANONYMOUS_AVATARS } from '@/utils/emotion';
import { formatTime } from '@/utils/time';

interface CommentItemProps {
  comment: Comment;
  onLike?: (id: string) => void;
  onReport?: (id: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onReport }) => {
  const avatar = ANONYMOUS_AVATARS.find(a => a.id === comment.anonymousAvatar) || ANONYMOUS_AVATARS[0];

  const handleMore = () => {
    Taro.showActionSheet({
      itemList: ['举报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          onReport?.(comment.id);
        }
      },
    });
  };

  return (
    <View className={styles.commentItem}>
      <View className={styles.avatar} style={{ backgroundColor: avatar.bgColor }}>
        <Text>{avatar.emoji}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>
            {comment.anonymousName}
            {comment.isAuthor && (
              <Text className={styles.authorBadge}>楼主</Text>
            )}
          </Text>
          <Text className={styles.time}>{formatTime(comment.createdAt)}</Text>
        </View>
        <Text className={styles.text}>{comment.content}</Text>
        <View className={styles.actions}>
          <View
            className={classnames(styles.action, comment.isLiked && styles.liked)}
            onClick={() => onLike?.(comment.id)}
          >
            <Text className={styles.icon}>{comment.isLiked ? '❤️' : '🤍'}</Text>
            <Text>{comment.likes}</Text>
          </View>
          <View className={styles.action} onClick={handleMore}>
            <Text className={styles.icon}>⋮</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CommentItem;
