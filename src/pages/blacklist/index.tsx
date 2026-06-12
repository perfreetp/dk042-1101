import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { getBlacklist, removeFromBlacklist } from '@/services/userService';
import { ANONYMOUS_AVATARS, getAnonymousName } from '@/utils/emotion';

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  blockedAt: string;
}

const BlacklistPage: React.FC = () => {
  const [users, setUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const generateBlockedUser = (id: string): BlockedUser => {
    const avatar = ANONYMOUS_AVATARS[Math.floor(Math.random() * ANONYMOUS_AVATARS.length)];
    return {
      id,
      name: getAnonymousName(),
      avatar: avatar.emoji,
      avatarBg: avatar.bgColor,
      blockedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const ids = await getBlacklist();
      const blockedUsers = ids.map(id => generateBlockedUser(id));
      setUsers(blockedUsers);
    } catch (error) {
      console.error('[BlacklistPage] 获取黑名单失败', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemove = useCallback((user: BlockedUser) => {
    Taro.showModal({
      title: '移除黑名单',
      content: `确定要将「${user.name}」移出黑名单吗？移除后将恢复查看TA的内容。`,
      confirmColor: '#7C5CFF',
      success: async (res) => {
        if (res.confirm) {
          try {
            await removeFromBlacklist(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            Taro.showToast({ title: '已移除', icon: 'success' });
          } catch (error) {
            console.error('[BlacklistPage] 移除失败', error);
            Taro.showToast({ title: '移除失败', icon: 'none' });
          }
        }
      },
    });
  }, []);

  const formatBlockedTime = (isoString: string) => {
    const now = Date.now();
    const time = new Date(isoString).getTime();
    const diff = now - time;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (days > 0) return `已屏蔽 ${days} 天`;
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours > 0) return `已屏蔽 ${hours} 小时`;
    const minutes = Math.floor(diff / (60 * 1000));
    return `已屏蔽 ${Math.max(1, minutes)} 分钟`;
  };

  return (
    <View className={styles.blacklistPage}>
      <Text className={styles.tip}>
        黑名单中的用户发布的内容将不会在广场中显示。您可以随时将用户移出黑名单。
      </Text>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>已屏蔽用户 ({users.length})</Text>

        {users.length === 0 ? (
          <View className={styles.emptyWrap}>
            <Text className={styles.emptyIcon}>🤝</Text>
            <Text className={styles.emptyTitle}>黑名单为空</Text>
            <Text className={styles.emptyDesc}>您还没有屏蔽任何人</Text>
          </View>
        ) : (
          <View className={styles.userList}>
            {users.map(user => (
              <View key={user.id} className={styles.userItem}>
                <View className={styles.avatar} style={{ backgroundColor: user.avatarBg }}>
                  <Text>{user.avatar}</Text>
                </View>
                <View className={styles.userInfo}>
                  <Text className={styles.name}>{user.name}</Text>
                  <Text className={styles.meta}>{formatBlockedTime(user.blockedAt)}</Text>
                </View>
                <View className={styles.removeBtn} onClick={() => handleRemove(user)}>
                  <Text>移除</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default BlacklistPage;
