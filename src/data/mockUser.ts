import type { UserSettings, Draft, HelpLine } from '@/types';
import { getRandomAvatar, getAnonymousName } from '@/utils/emotion';

export const mockUserSettings: UserSettings = {
  id: 'user_001',
  anonymousName: getAnonymousName(),
  anonymousAvatar: getRandomAvatar().id,
  blockWords: ['广告', '推销', '加微信'],
  blacklist: ['user_1001', 'user_1002'],
  privacy: {
    allowPrivateMessage: true,
    showLocation: false,
    receiveNotification: true,
  },
};

export const mockDrafts: Draft[] = [
  {
    id: 'draft_1',
    content: '今天又加班到很晚，感觉自己像个陀螺一样转个不停...',
    emotion: 'anxious',
    mode: 'listen',
    visibleDuration: '24h',
    anonymousAvatar: getRandomAvatar().id,
    isVoice: false,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'draft_2',
    content: '突然很想念以前的朋友们，不知道大家现在都怎么样了...',
    emotion: 'sad',
    mode: 'advice',
    visibleDuration: '72h',
    anonymousAvatar: getRandomAvatar().id,
    isVoice: false,
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockHelpLines: HelpLine[] = [
  {
    id: '1',
    name: '全国心理援助热线',
    number: '400-161-9995',
    description: '24小时免费心理援助服务',
    serviceTime: '24小时',
  },
  {
    id: '2',
    name: '北京心理危机研究与干预中心',
    number: '010-82951332',
    description: '专业心理危机干预服务',
    serviceTime: '24小时',
  },
  {
    id: '3',
    name: '上海市心理援助热线',
    number: '021-12320-5',
    description: '上海市心理卫生服务热线',
    serviceTime: '24小时',
  },
  {
    id: '4',
    name: '广东省心理援助热线',
    number: '020-12320-5',
    description: '广东省心理卫生服务热线',
    serviceTime: '24小时',
  },
  {
    id: '5',
    name: '青少年服务热线',
    number: '12355',
    description: '青少年心理健康与法律援助',
    serviceTime: '8:30-20:30',
  },
];

export const mockHistoryHoles = [
  {
    id: 'history_1',
    content: '今天终于鼓起勇气和老板谈了加薪的事情，虽然没有成功，但至少我迈出了这一步。',
    emotion: 'calm',
    mode: 'listen',
    visibleDuration: 'forever',
    anonymousAvatar: getRandomAvatar().id,
    anonymousName: getAnonymousName(),
    isVoice: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 23,
    hugs: 15,
    comments: 8,
    favorites: 5,
    isLiked: false,
    isHugged: false,
    isFavorited: true,
    isFolded: false,
    isBlocked: false,
  },
  {
    id: 'history_2',
    content: '分手一个月了，还是会时不时想起他。朋友们都说时间会治愈一切，可是这个过程真的好难熬...',
    emotion: 'sad',
    mode: 'advice',
    visibleDuration: '72h',
    anonymousAvatar: getRandomAvatar().id,
    anonymousName: getAnonymousName(),
    isVoice: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 56,
    hugs: 42,
    comments: 23,
    favorites: 12,
    isLiked: false,
    isHugged: false,
    isFavorited: false,
    isFolded: false,
    isBlocked: false,
  },
];

export default mockUserSettings;
