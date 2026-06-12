// 情绪类型
export type EmotionType = 'happy' | 'sad' | 'anxious' | 'angry' | 'confused' | 'calm';

// 发布模式
export type PublishMode = 'listen' | 'advice' | 'no-private';

// 可见时长
export type VisibleDuration = '1h' | '6h' | '12h' | '24h' | '72h' | 'forever';

// 树洞类型
export interface Hole {
  id: string;
  content: string;
  emotion: EmotionType;
  mode: PublishMode;
  visibleDuration: VisibleDuration;
  anonymousAvatar: string;
  anonymousName: string;
  isVoice: boolean;
  voiceUrl?: string;
  voiceDuration?: number;
  location?: string;
  createdAt: string;
  expiresAt: string;
  likes: number;
  hugs: number;
  comments: number;
  favorites: number;
  isLiked: boolean;
  isHugged: boolean;
  isFavorited: boolean;
  isFolded: boolean;
  isBlocked: boolean;
}

// 评论类型
export interface Comment {
  id: string;
  holeId: string;
  content: string;
  anonymousAvatar: string;
  anonymousName: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isAuthor: boolean;
}

// 消息类型
export type MessageType = 'reply' | 'follow' | 'system';

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  holeId?: string;
  commentId?: string;
  fromAvatar?: string;
  fromName?: string;
  createdAt: string;
  isRead: boolean;
}

// 用户设置
export interface UserSettings {
  id: string;
  anonymousName: string;
  anonymousAvatar: string;
  blockWords: string[];
  blacklist: string[];
  privacy: {
    allowPrivateMessage: boolean;
    showLocation: boolean;
    receiveNotification: boolean;
  };
}

// 草稿类型
export interface Draft {
  id: string;
  content: string;
  emotion: EmotionType;
  mode: PublishMode;
  visibleDuration: VisibleDuration;
  anonymousAvatar: string;
  isVoice: boolean;
  voiceUrl?: string;
  voiceDuration?: number;
  updatedAt: string;
}

// 举报类型
export type ReportType = 'spam' | 'abuse' | 'violence' | 'porn' | 'other';

export interface Report {
  id: string;
  targetId: string;
  targetType: 'hole' | 'comment';
  reportType: ReportType;
  reason: string;
  createdAt: string;
}

// 求助热线
export interface HelpLine {
  id: string;
  name: string;
  number: string;
  description: string;
  serviceTime: string;
}

// 匿名头像
export interface AnonymousAvatar {
  id: string;
  emoji: string;
  bgColor: string;
  name: string;
}

// 情绪配置
export interface EmotionConfig {
  type: EmotionType;
  label: string;
  emoji: string;
  color: string;
}

// 发布模式配置
export interface PublishModeConfig {
  type: PublishMode;
  label: string;
  description: string;
  icon: string;
}

// 可见时长配置
export interface VisibleDurationConfig {
  type: VisibleDuration;
  label: string;
  hours: number;
}

// 筛选类型
export type FilterType = 'latest' | 'nearby' | 'similar';

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页结果
export interface PaginatedResult<T> {
  list: T[];
  total: number;
  hasMore: boolean;
}
