import type { Hole, EmotionType, PublishMode, VisibleDuration } from '@/types';
import { getAnonymousName, getRandomAvatar } from '@/utils/emotion';

const emotions: EmotionType[] = ['happy', 'sad', 'anxious', 'angry', 'confused', 'calm'];
const modes: PublishMode[] = ['listen', 'advice', 'no-private'];
const durations: VisibleDuration[] = ['1h', '6h', '12h', '24h', '72h', 'forever'];
const locations = ['北京市朝阳区', '上海市浦东新区', '广州市天河区', '深圳市南山区', '杭州市西湖区'];

const contents = [
  '今天工作压力好大，感觉喘不过气来。项目 deadline 就在明天，可是我还有很多功能没做完...',
  '刚刚和朋友大吵了一架，明明是很小的事情，但就是控制不住自己的情绪。',
  '最近总是失眠，一闭上眼睛就开始想很多事情，越想越睡不着。',
  '今天收到了心仪公司的 offer！努力了这么久终于有回报了，太开心了！',
  '不知道为什么，最近总是感到很迷茫，不知道自己想要什么，也不知道未来该怎么走。',
  '和喜欢的人表白被拒绝了，心里很难受，但我知道这也是成长的一部分。',
  '今天一个人去看了电影，其实一个人也挺好的，享受独处的时光。',
  '工作三年了，还是在原地踏步，看着同龄人都升职加薪，我是不是很失败？',
  '刚刚在路上帮助了一位老奶奶过马路，她对我说谢谢的时候，心里暖暖的。',
  '最近总是很焦虑，担心自己不够好，担心会被别人超过...',
  '今天终于把困扰我很久的 bug 修好了！那种成就感真的太棒了！',
  '有时候觉得自己像个演员，在不同的人面前戴着不同的面具，好累。',
  '和家人通了电话，听到妈妈的声音，突然就不想再逞强了。',
  '今天天气很好，在公园散步的时候看到了一只很可爱的小猫，心情也变好了。',
  '我真的很努力了，可是为什么还是做不好？是不是我真的很笨？',
];

export function generateMockHoles(count: number = 15): Hole[] {
  const holes: Hole[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const avatar = getRandomAvatar();
    const emotion = emotions[Math.floor(Math.random() * emotions.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const createdAt = new Date(now - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const expireHours = duration === 'forever' ? 999999 : parseInt(duration);
    const expiresAt = new Date(createdAt.getTime() + expireHours * 60 * 60 * 1000);

    holes.push({
      id: `hole_${i}_${Date.now()}`,
      content: contents[i % contents.length],
      emotion,
      mode,
      visibleDuration: duration,
      anonymousAvatar: avatar.id,
      anonymousName: getAnonymousName(),
      isVoice: Math.random() > 0.7,
      voiceDuration: Math.random() > 0.7 ? Math.floor(Math.random() * 60) + 10 : undefined,
      location: Math.random() > 0.5 ? locations[Math.floor(Math.random() * locations.length)] : undefined,
      createdAt: createdAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      likes: Math.floor(Math.random() * 100),
      hugs: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 30),
      favorites: Math.floor(Math.random() * 20),
      isLiked: false,
      isHugged: false,
      isFavorited: false,
      isFolded: false,
      isBlocked: false,
    });
  }

  return holes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export const mockHoles: Hole[] = generateMockHoles(15);

export default mockHoles;
