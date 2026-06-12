import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  emoji?: string;
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '🌙',
  title = '暂无内容',
  description = '这里还什么都没有呢',
}) => {
  return (
    <View className={styles.emptyState}>
      <Text className={styles.emoji}>{emoji}</Text>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.description}>{description}</Text>
    </View>
  );
};

export default EmptyState;
