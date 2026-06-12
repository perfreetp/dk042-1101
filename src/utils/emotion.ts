import type { EmotionConfig, EmotionType, PublishModeConfig, PublishMode, VisibleDurationConfig, VisibleDuration, AnonymousAvatar } from '@/types';

export const EMOTION_CONFIG: EmotionConfig[] = [
  { type: 'happy', label: '开心', emoji: '😊', color: '#FFD93D' },
  { type: 'sad', label: '难过', emoji: '😢', color: '#74B9FF' },
  { type: 'anxious', label: '焦虑', emoji: '😰', color: '#FD79A8' },
  { type: 'angry', label: '愤怒', emoji: '😠', color: '#FF6B6B' },
  { type: 'confused', label: '迷茫', emoji: '😕', color: '#A29BFE' },
  { type: 'calm', label: '平静', emoji: '😌', color: '#81ECEC' },
];

export const PUBLISH_MODE_CONFIG: PublishModeConfig[] = [
  { type: 'listen', label: '只求倾听', description: '只想有人听我说说话', icon: '👂' },
  { type: 'advice', label: '想要建议', description: '希望大家给我一些建议', icon: '💡' },
  { type: 'no-private', label: '禁止私信', description: '不想收到任何私信', icon: '🚫' },
];

export const VISIBLE_DURATION_CONFIG: VisibleDurationConfig[] = [
  { type: '1h', label: '1小时', hours: 1 },
  { type: '6h', label: '6小时', hours: 6 },
  { type: '12h', label: '12小时', hours: 12 },
  { type: '24h', label: '1天', hours: 24 },
  { type: '72h', label: '3天', hours: 72 },
  { type: 'forever', label: '永久', hours: 999999 },
];

export const ANONYMOUS_AVATARS: AnonymousAvatar[] = [
  { id: '1', emoji: '🐱', bgColor: '#FFE4E1', name: '小猫咪' },
  { id: '2', emoji: '🐶', bgColor: '#FFF3CD', name: '小狗狗' },
  { id: '3', emoji: '🐰', bgColor: '#E8DAEF', name: '小兔子' },
  { id: '4', emoji: '🐻', bgColor: '#D4EFDF', name: '小熊熊' },
  { id: '5', emoji: '🦊', bgColor: '#FADBD8', name: '小狐狸' },
  { id: '6', emoji: '🐼', bgColor: '#E5E8E8', name: '小熊猫' },
  { id: '7', emoji: '🐨', bgColor: '#D5F5E3', name: '小考拉' },
  { id: '8', emoji: '🦁', bgColor: '#FCF3CF', name: '小狮子' },
  { id: '9', emoji: '🐯', bgColor: '#FDEDEC', name: '小老虎' },
  { id: '10', emoji: '🐸', bgColor: '#D5F5E3', name: '小青蛙' },
  { id: '11', emoji: '🐙', bgColor: '#E8DAEF', name: '小章鱼' },
  { id: '12', emoji: '🦋', bgColor: '#FADBD8', name: '小蝴蝶' },
];

export function getEmotionConfig(type: EmotionType): EmotionConfig {
  return EMOTION_CONFIG.find(e => e.type === type) || EMOTION_CONFIG[0];
}

export function getPublishModeConfig(type: PublishMode): PublishModeConfig {
  return PUBLISH_MODE_CONFIG.find(m => m.type === type) || PUBLISH_MODE_CONFIG[0];
}

export function getVisibleDurationConfig(type: VisibleDuration): VisibleDurationConfig {
  return VISIBLE_DURATION_CONFIG.find(d => d.type === type) || VISIBLE_DURATION_CONFIG[0];
}

export function getRandomAvatar(): AnonymousAvatar {
  const index = Math.floor(Math.random() * ANONYMOUS_AVATARS.length);
  return ANONYMOUS_AVATARS[index];
}

export function getAnonymousName(): string {
  const adjectives = ['温柔的', '勇敢的', '可爱的', '安静的', '快乐的', '神秘的', '善良的', '坚强的'];
  const nouns = ['树洞精灵', '星空漫步者', '云朵收藏家', '微风使者', '月光旅人', '森林守护者', '海边拾贝人', '梦境骑士'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}
