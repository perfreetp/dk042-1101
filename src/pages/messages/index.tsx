import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { MessageType, Message } from '@/types';
import MessageItem from '@/components/MessageItem';
import EmptyState from '@/components/EmptyState';
import { getMessageList, markAllAsRead, getUnreadCount, markAsRead } from '@/services/messageService';
import { getHoleDetail } from '@/services/holeService';

const TABS: { type: MessageType; label: string }[] = [
  { type: 'reply', label: '回复' },
  { type: 'follow', label: '关注' },
  { type: 'system', label: '系统' },
];

const MessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MessageType>('reply');
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState<Record<MessageType, number>>({
    reply: 0,
    follow: 0,
    system: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const [list, counts] = await Promise.all([
        getMessageList(activeTab),
        getUnreadCount(),
      ]);
      setMessages(list);
      setUnreadCount(counts);
    } catch (error) {
      console.error('[MessagesPage] 获取消息失败', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMessages();
  }, [activeTab, fetchMessages]);

  useDidShow(() => {
    fetchMessages();
  });

  const handleTabChange = useCallback((type: MessageType) => {
    setActiveTab(type);
  }, []);

  const handleMessageClick = useCallback(async (message: Message) => {
    if (!message.isRead) {
      markAsRead(message.id);
      setMessages(prev =>
        prev.map(m => (m.id === message.id ? { ...m, isRead: true } : m))
      );
      setUnreadCount(prev => ({
        ...prev,
        [message.type]: Math.max(0, prev[message.type] - 1),
      }));
    }
    if (message.holeId) {
      try {
        const hole = await getHoleDetail(message.holeId);
        if (!hole) {
          Taro.showToast({ title: '该内容已不存在', icon: 'none' });
          return;
        }
        Taro.navigateTo({
          url: `/pages/detail/index?id=${message.holeId}`,
        });
      } catch (error) {
        console.error('[MessagesPage] 检查树洞失败', error);
        Taro.showToast({ title: '该内容已不存在', icon: 'none' });
      }
    }
  }, []);

  const handleMarkAll = useCallback(async () => {
    try {
      await markAllAsRead(activeTab);
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      setUnreadCount(prev => ({ ...prev, [activeTab]: 0 }));
      Taro.showToast({ title: '已全部标记为已读', icon: 'success' });
    } catch (error) {
      console.error('[MessagesPage] 标记全部已读失败', error);
    }
  }, [activeTab]);

  return (
    <View className={styles.messagesPage}>
      <View className={styles.header}>
        <Text className={styles.title}>💬 消息中心</Text>
        <View className={styles.markAllBtn} onClick={handleMarkAll}>
          <Text>全部已读</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        {TABS.map(tab => (
          <View
            key={tab.type}
            className={classnames(styles.tabItem, activeTab === tab.type && styles.active)}
            onClick={() => handleTabChange(tab.type)}
          >
            <Text className={styles.label}>{tab.label}</Text>
            {unreadCount[tab.type] > 0 && (
              <Text className={styles.count}>
                {unreadCount[tab.type] > 99 ? '99+' : unreadCount[tab.type]}
              </Text>
            )}
          </View>
        ))}
      </View>

      <View className={styles.content}>
        {messages.length === 0 ? (
        <View className={styles.emptyWrap}>
          <EmptyState
            emoji="💌"
            title="暂无消息"
            description="还没有收到任何消息"
          />
        </View>
      ) : (
        <View className={styles.messageList}>
          {messages.map(message => (
            <MessageItem
              key={message.id}
              message={message}
              onClick={handleMessageClick}
            />
          ))}
        </View>
      )}
      </View>
    </View>
  );
};

export default MessagesPage;
