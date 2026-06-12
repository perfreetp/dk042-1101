import type { Message, MessageType } from '@/types';
import { mockMessages } from '@/data/mockMessages';

export async function getMessageList(type?: MessageType): Promise<Message[]> {
  console.log('[MessageService] 获取消息列表', type);

  let messages = [...mockMessages];

  if (type) {
    messages = messages.filter(m => m.type === type);
  }

  return messages.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getUnreadCount(): Promise<Record<MessageType, number>> {
  console.log('[MessageService] 获取未读消息数');
  const counts: Record<MessageType, number> = {
    reply: 0,
    follow: 0,
    system: 0,
  };

  mockMessages.forEach(msg => {
    if (!msg.isRead) {
      counts[msg.type]++;
    }
  });

  return counts;
}

export async function markAsRead(id: string): Promise<void> {
  console.log('[MessageService] 标记消息已读', id);
  const msg = mockMessages.find(m => m.id === id);
  if (msg) {
    msg.isRead = true;
  }
}

export async function markAllAsRead(type?: MessageType): Promise<void> {
  console.log('[MessageService] 标记全部已读', type);
  mockMessages.forEach(msg => {
    if (!type || msg.type === type) {
      msg.isRead = true;
    }
  });
}

export async function deleteMessage(id: string): Promise<void> {
  console.log('[MessageService] 删除消息', id);
  const index = mockMessages.findIndex(m => m.id === id);
  if (index > -1) {
    mockMessages.splice(index, 1);
  }
}

export default {
  getMessageList,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteMessage,
};
