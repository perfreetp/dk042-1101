import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { EmotionType } from '@/types';
import { getEmotionConfig } from '@/utils/emotion';

interface EmotionTagProps {
  emotion: EmotionType;
  active?: boolean;
  onClick?: () => void;
}

const EmotionTag: React.FC<EmotionTagProps> = ({ emotion, active = false, onClick }) => {
  const config = getEmotionConfig(emotion);

  return (
    <View
      className={classnames(styles.emotionTag, active && styles.active)}
      style={{ backgroundColor: `${config.color}20`, color: config.color }}
      onClick={onClick}
    >
      <Text className={styles.emoji}>{config.emoji}</Text>
      <Text className={styles.label}>{config.label}</Text>
    </View>
  );
};

export default EmotionTag;
