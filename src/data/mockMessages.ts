import type { Message } from '@/types';
import { getRandomAvatar, getAnonymousName } from '@/utils/emotion';

const replyTitles = [
  '有人回复了你的树洞',
  '你的树洞收到了新回复',
  '有新的评论',
];

const replyContents = [
  '抱抱你，一切都会好起来的 ❤️',
  '我也有过类似的经历，你不是一个人',
  '加油！相信你一定可以的！',
  '累了就休息一下，不要给自己太大压力',
];

const systemTitles = [
  '系统提醒',
  '温馨提示',
  '安全提示',
];

const systemContents = [
  '你的树洞"今天工作压力好大..."即将在1小时后过期，点击查看详情。',
  '你有一封新的系统消息，请查收。',
  '感谢你使用匿名树洞，希望我们能陪你度过每一个难捱的时刻。',
  '你的举报已收到，我们会尽快处理。',
  '为了你的安全，请不要透露个人真实信息。',
];

export function generateMockMessages(count: number = 12): Message[] {
  const messages: Message[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const type = i < 6 ? 'reply' : (i < 9 ? 'follow' : 'system');
    const avatar = getRandomAvatar();
    const createdAt = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);

    let title = '';
    let content = '';

    if (type === 'reply') {
      title = replyTitles[Math.floor(Math.random() * replyTitles.length)];
      content = replyContents[Math.floor(Math.random() * replyContents.length)];
    } else if (type === 'follow') {
      title = '有人关注了你';
      content = `${getAnonymousName()} 关注了你`;
    } else {
      title = systemTitles[Math.floor(Math.random() * systemTitles.length)];
      content = systemContents[Math.floor(Math.random() * systemContents.length)];
    }

    messages.push({
      id: `msg_${i}`,
      type,
      title,
      content,
      holeId: type === 'reply' ? `hole_${i}` : undefined,
      fromAvatar: type !== 'system' ? avatar.id : undefined,
      fromName: type !== 'system' ? getAnonymousName() : undefined,
      createdAt: createdAt.toISOString(),
      isRead: Math.random() > 0.5,
    });
  }

  return messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const mockMessages: Message[] = generateMockMessages(12);

export default mockMessages;
