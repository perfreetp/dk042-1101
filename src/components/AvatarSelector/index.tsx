import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { ANONYMOUS_AVATARS } from '@/utils/emotion';
import type { AnonymousAvatar } from '@/types';

interface AvatarSelectorProps {
  selectedAvatarId: string;
  anonymousName: string;
  onSelect: (avatar: AnonymousAvatar) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  anonymousName,
  onSelect,
}) => {
  return (
    <View className={styles.avatarSelector}>
      <Text className={styles.title}>选择你的匿名身份</Text>
      <View className={styles.avatarGrid}>
        {ANONYMOUS_AVATARS.map(avatar => (
          <View
            key={avatar.id}
            className={classnames(styles.avatarItem, avatar.id === selectedAvatarId && styles.selected)}
            style={{ backgroundColor: avatar.bgColor }}
            onClick={() => onSelect(avatar)}
          >
            <Text>{avatar.emoji}</Text>
          </View>
        ))}
      </View>
      <View className={styles.avatarName}>
        <Text className={styles.label}>你的匿名昵称</Text>
        <Text className={styles.name}>{anonymousName}</Text>
      </View>
    </View>
  );
};

export default AvatarSelector;
