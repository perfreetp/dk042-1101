import type { Comment } from '@/types';
import { getAnonymousName, getRandomAvatar } from '@/utils/emotion';

const commentContents = [
  '抱抱你，一切都会好起来的 ❤️',
  '我也有过类似的经历，你不是一个人',
  '加油！相信你一定可以的！',
  '累了就休息一下，不要给自己太大压力',
  '有时候发泄出来会好很多，谢谢你愿意分享',
  '你的感受是被允许的，不要责怪自己',
  '每个人都有自己的节奏，不用和别人比',
  '你已经很棒了，只是还没被看到而已',
  '有什么想说的尽管说，我在听',
  '时间会治愈一切的，相信我',
  '你的努力终会有回报的，只是时机未到',
  '想哭就哭出来吧，眼泪也是一种释放',
  '你值得被爱，值得被好好对待',
  '我理解你的感受，这确实很难',
  '你不是一个人在战斗，我们都在这里',
];

export function generateMockComments(holeId: string, count: number = 8): Comment[] {
  const comments: Comment[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const avatar = getRandomAvatar();
    const createdAt = new Date(now - Math.random() * 24 * 60 * 60 * 1000);

    comments.push({
      id: `comment_${holeId}_${i}`,
      holeId,
      content: commentContents[Math.floor(Math.random() * commentContents.length)],
      anonymousAvatar: avatar.id,
      anonymousName: getAnonymousName(),
      createdAt: createdAt.toISOString(),
      likes: Math.floor(Math.random() * 20),
      isLiked: false,
      isAuthor: Math.random() > 0.8,
    });
  }

  return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export const mockComments: Record<string, Comment[]> = {};

export default mockComments;
