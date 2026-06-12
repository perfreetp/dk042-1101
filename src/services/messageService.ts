import type { Message, MessageType } from '@/types';
import { mockMessages } from '@/data/mockMessages';
import storage from '@/utils/storage';

function getReadMessages(): string[] {
  return storage.get<string[]>(storage.keys.MESSAGES_READ, []);
}

function addReadMessage(id: string): void {
  storage.addToSet(storage.keys.MESSAGES_READ, id);
}

function clearReadMessagesByType(type?: MessageType): void {
  const readIds = getReadMessages();
  mockMessages.forEach(msg => {
    if (!type || msg.type === type) {
      if (!readIds.includes(msg.id)) {
        addReadMessage(msg.id);
      }
    }
  });
}

function mergeWithReadStatus(messages: Message[]): Message[] {
  const readIds = getReadMessages();
  return messages.map(msg => ({
    ...msg,
    isRead: msg.isRead || readIds.includes(msg.id),
  }));
}

export async function getMessageList(type?: MessageType): Promise<Message[]> {
  console.log('[MessageService] 获取消息列表', type);

  let messages = [...mockMessages];

  if (type) {
    messages = messages.filter(m => m.type === type);
  }

  messages = mergeWithReadStatus(messages);

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

  const messages = mergeWithReadStatus([...mockMessages]);
  messages.forEach(msg => {
    if (!msg.isRead) {
      counts[msg.type]++;
    }
  });

  return counts;
}

export async function markAsRead(id: string): Promise<void> {
  console.log('[MessageService] 标记消息已读', id);
  addReadMessage(id);
  const msg = mockMessages.find(m => m.id === id);
  if (msg) {
    msg.isRead = true;
  }
}

export async function markAllAsRead(type?: MessageType): Promise<void> {
  console.log('[MessageService] 标记全部已读', type);
  clearReadMessagesByType(type);
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
