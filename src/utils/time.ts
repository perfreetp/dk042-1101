import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import type { VisibleDuration } from '@/types';
import { getVisibleDurationConfig } from './emotion';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function formatTime(date: string | Date): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;

  const diffHours = now.diff(target, 'hour');
  if (diffHours < 24) return `${diffHours}小时前`;

  const diffDays = now.diff(target, 'day');
  if (diffDays < 7) return `${diffDays}天前`;

  return target.format('YYYY-MM-DD');
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getExpireTime(visibleDuration: VisibleDuration): string {
  const config = getVisibleDurationConfig(visibleDuration);
  if (config.type === 'forever') {
    return dayjs().add(100, 'year').toISOString();
  }
  return dayjs().add(config.hours, 'hour').toISOString();
}

export function getRemainingTime(expiresAt: string): string {
  const now = dayjs();
  const expire = dayjs(expiresAt);

  if (expire.isBefore(now)) return '已过期';

  const diffHours = expire.diff(now, 'hour');
  if (diffHours < 1) {
    const diffMinutes = expire.diff(now, 'minute');
    return `还剩${diffMinutes}分钟`;
  }
  if (diffHours < 24) {
    return `还剩${diffHours}小时`;
  }
  const diffDays = expire.diff(now, 'day');
  return `还剩${diffDays}天`;
}

export function formatFullTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function generateTimeId(): string {
  return dayjs().valueOf().toString();
}
