import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { UserSettings } from '@/types';
import { getUserSettings, updatePrivacySettings } from '@/services/userService';

const PrivacyPage: React.FC = () => {
  const [privacy, setPrivacy] = useState<UserSettings['privacy']>({
    allowPrivateMessage: true,
    showLocation: false,
    receiveNotification: true,
  });
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const settings = await getUserSettings();
      setPrivacy(settings.privacy);
    } catch (error) {
      console.error('[PrivacyPage] 获取隐私设置失败', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = useCallback(async (key: keyof UserSettings['privacy']) => {
    const newValue = !privacy[key];
    try {
      await updatePrivacySettings({ [key]: newValue });
      setPrivacy(prev => ({ ...prev, [key]: newValue }));
      Taro.showToast({
        title: newValue ? '已开启' : '已关闭',
        icon: 'success',
      });
    } catch (error) {
      console.error('[PrivacyPage] 更新设置失败', error);
      Taro.showToast({ title: '设置失败', icon: 'none' });
    }
  }, [privacy]);

  const settings = [
    {
      key: 'allowPrivateMessage' as const,
      icon: '💬',
      title: '允许私信',
      desc: '关闭后，其他用户将无法向您发送私信',
    },
    {
      key: 'showLocation' as const,
      icon: '📍',
      title: '显示位置',
      desc: '开启后，您发布的树洞会显示大致位置信息',
    },
    {
      key: 'receiveNotification' as const,
      icon: '🔔',
      title: '接收通知',
      desc: '接收点赞、评论、关注等互动消息提醒',
    },
  ];

  return (
    <View className={styles.privacyPage}>
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>隐私设置</Text>
        {settings.map(item => (
          <View key={item.key} className={styles.settingItem}>
            <View className={styles.info}>
              <Text className={styles.title}>{item.icon} {item.title}</Text>
              <Text className={styles.desc}>{item.desc}</Text>
            </View>
            <View
              className={classnames(styles.switch, privacy[item.key] && styles.on)}
              onClick={() => handleToggle(item.key)}
            />
          </View>
        ))}
      </View>

      <View className={styles.tip}>
        <Text>
          <Text className={styles.highlight}>温馨提示：</Text>
          我们非常重视您的隐私保护。所有树洞内容均为匿名发布，不会关联您的真实身份信息。
        </Text>
      </View>
    </View>
  );
};

export default PrivacyPage;
