import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { Message } from '@/types';
import { ANONYMOUS_AVATARS } from '@/utils/emotion';
import { formatTime } from '@/utils/time';

interface MessageItemProps {
  message: Message;
  onClick?: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onClick }) => {
  const avatar = message.fromAvatar
    ? ANONYMOUS_AVATARS.find(a => a.id === message.fromAvatar) || ANONYMOUS_AVATARS[0]
    : null;

  const getAvatarContent = () => {
    if (message.type === 'system') return '🔔';
    if (message.type === 'follow') return '👤';
    return avatar?.emoji || '💬';
  };

  const getAvatarBg = () => {
    if (message.type === 'system') return '';
    if (message.type === 'follow') return '#F0EBFF';
    return avatar?.bgColor || '#F0EBFF';
  };

  return (
    <View
      className={classnames(styles.messageItem, !message.isRead && styles.unread)}
      onClick={() => onClick?.(message)}
    >
      <View
        className={classnames(styles.avatar, message.type === 'system' && styles.system)}
        style={{ backgroundColor: getAvatarBg() }}
      >
        <Text>{getAvatarContent()}</Text>
        {!message.isRead && <View className={styles.unreadDot} />}
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{message.title}</Text>
          <Text className={styles.time}>{formatTime(message.createdAt)}</Text>
        </View>
        <Text className={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
};

export default MessageItem;
