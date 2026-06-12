import React, { useCallback, useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { ANONYMOUS_AVATARS } from '@/utils/emotion';
import { useUserSettings } from '@/hooks/useUserSettings';

interface MenuItem {
  icon: string;
  iconBg: string;
  label: string;
  desc?: string;
  path: string;
}

const CONTENT_MENUS: MenuItem[] = [
  { icon: '📝', iconBg: '#FEF3C7', label: '草稿箱', desc: '2 篇草稿', path: '/pages/drafts/index' },
  { icon: '📜', iconBg: '#E8DAEF', label: '历史树洞', desc: '查看我的发布', path: '/pages/history/index' },
  { icon: '⭐', iconBg: '#D4EFDF', label: '我的收藏', desc: '已收藏的内容', path: '/pages/plaza/index' },
];

const SETTING_MENUS: MenuItem[] = [
  { icon: '🔇', iconBg: '#FADBD8', label: '屏蔽词管理', desc: '管理不想看到的词', path: '/pages/blockwords/index' },
  { icon: '🚫', iconBg: '#F5B7B1', label: '黑名单', desc: '已屏蔽的用户', path: '/pages/blacklist/index' },
  { icon: '🔒', iconBg: '#AED6F1', label: '隐私设置', desc: '管理你的隐私', path: '/pages/privacy/index' },
  { icon: '📞', iconBg: '#ABEBC6', label: '求助热线', desc: '专业心理援助', path: '/pages/helpline/index' },
];

const MinePage: React.FC = () => {
  const { settings, blockWords, blacklist, fetchSettings } = useUserSettings();
  const [stats] = useState({
    published: 12,
    received: 86,
    favorites: 23,
  });

  useDidShow(() => {
    fetchSettings();
  });

  const avatar = settings?.anonymousAvatar
    ? ANONYMOUS_AVATARS.find(a => a.id === settings.anonymousAvatar) || ANONYMOUS_AVATARS[0]
    : ANONYMOUS_AVATARS[0];

  const handleMenuClick = useCallback((path: string) => {
    Taro.navigateTo({ url: path });
  }, []);

  const handleCallHelp = useCallback(() => {
    Taro.navigateTo({ url: '/pages/helpline/index' });
  }, []);

  const handleLogout = useCallback(() => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  }, []);

  return (
    <View className={styles.minePage}>
      <View className={styles.header}>
        <View className={styles.avatar} style={{ backgroundColor: avatar.bgColor }}>
          <Text>{avatar.emoji}</Text>
        </View>
        <View className={styles.userInfo}>
          <Text className={styles.name}>{settings?.anonymousName || '匿名用户'}</Text>
          <Text className={styles.id}>ID: {settings?.id || 'user_001'}</Text>
        </View>
        <View className={styles.editBtn}>
          <Text>编辑</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <View className={styles.statItem}>
            <Text className={styles.num}>{stats.published}</Text>
            <Text className={styles.label}>发布</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{stats.received}</Text>
            <Text className={styles.label}>互动</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.num}>{stats.favorites}</Text>
            <Text className={styles.label}>收藏</Text>
          </View>
        </View>

        <View className={styles.helpCard} onClick={handleCallHelp}>
          <View className={styles.icon}>
            <Text>🆘</Text>
          </View>
          <View className={styles.info}>
            <Text className={styles.title}>需要帮助？</Text>
            <Text className={styles.desc}>24小时心理援助热线为你守候</Text>
          </View>
          <View className={styles.callBtn}>
            <Text>立即拨打</Text>
          </View>
        </View>

        <View className={styles.menuGroup}>
          <View className={styles.groupTitle}>内容管理</View>
          {CONTENT_MENUS.map((menu, index) => (
            <View
              key={index}
              className={styles.menuItem}
              onClick={() => handleMenuClick(menu.path)}
            >
              <View className={styles.icon} style={{ backgroundColor: menu.iconBg }}>
                <Text>{menu.icon}</Text>
              </View>
              <View className={styles.info}>
                <Text className={styles.label}>{menu.label}</Text>
                {menu.desc && <Text className={styles.desc}>{menu.desc}</Text>}
              </View>
              <Text className={styles.arrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.menuGroup}>
          <View className={styles.groupTitle}>设置</View>
          {SETTING_MENUS.map((menu, index) => (
            <View
              key={index}
              className={styles.menuItem}
              onClick={() => handleMenuClick(menu.path)}
            >
              <View className={styles.icon} style={{ backgroundColor: menu.iconBg }}>
                <Text>{menu.icon}</Text>
              </View>
              <View className={styles.info}>
                <Text className={styles.label}>{menu.label}</Text>
                {menu.desc && <Text className={styles.desc}>{menu.desc}</Text>}
              </View>
              <Text className={styles.arrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.logoutBtn} onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
