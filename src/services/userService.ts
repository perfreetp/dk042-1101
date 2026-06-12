import type { UserSettings, HelpLine } from '@/types';
import { mockUserSettings, mockHelpLines } from '@/data/mockUser';
import storage from '@/utils/storage';

export async function getUserSettings(): Promise<UserSettings> {
  console.log('[UserService] 获取用户设置');
  return storage.get<UserSettings>(storage.keys.USER_SETTINGS, mockUserSettings);
}

export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  console.log('[UserService] 更新用户设置', settings);
  const current = await getUserSettings();
  const updated = { ...current, ...settings };
  storage.set(storage.keys.USER_SETTINGS, updated);
  return updated;
}

export async function getBlockWords(): Promise<string[]> {
  console.log('[UserService] 获取屏蔽词列表');
  const settings = await getUserSettings();
  return settings.blockWords;
}

export async function addBlockWord(word: string): Promise<void> {
  console.log('[UserService] 添加屏蔽词', word);
  const settings = await getUserSettings();
  if (!settings.blockWords.includes(word)) {
    settings.blockWords.push(word);
    await updateUserSettings(settings);
  }
}

export async function removeBlockWord(word: string): Promise<void> {
  console.log('[UserService] 删除屏蔽词', word);
  const settings = await getUserSettings();
  settings.blockWords = settings.blockWords.filter(w => w !== word);
  await updateUserSettings(settings);
}

export async function getBlacklist(): Promise<string[]> {
  console.log('[UserService] 获取黑名单');
  const settings = await getUserSettings();
  return settings.blacklist;
}

export async function addToBlacklist(userId: string): Promise<void> {
  console.log('[UserService] 添加到黑名单', userId);
  const settings = await getUserSettings();
  if (!settings.blacklist.includes(userId)) {
    settings.blacklist.push(userId);
    await updateUserSettings(settings);
  }
}

export async function removeFromBlacklist(userId: string): Promise<void> {
  console.log('[UserService] 从黑名单移除', userId);
  const settings = await getUserSettings();
  settings.blacklist = settings.blacklist.filter(id => id !== userId);
  await updateUserSettings(settings);
}

export async function updatePrivacySettings(privacy: Partial<UserSettings['privacy']>): Promise<UserSettings> {
  console.log('[UserService] 更新隐私设置', privacy);
  const settings = await getUserSettings();
  settings.privacy = { ...settings.privacy, ...privacy };
  return updateUserSettings(settings);
}

export async function getHelpLines(): Promise<HelpLine[]> {
  console.log('[UserService] 获取求助热线');
  return mockHelpLines;
}

export async function updateAnonymousInfo(params: {
  anonymousName?: string;
  anonymousAvatar?: string;
}): Promise<UserSettings> {
  console.log('[UserService] 更新匿名信息', params);
  return updateUserSettings(params);
}

export default {
  getUserSettings,
  updateUserSettings,
  getBlockWords,
  addBlockWord,
  removeBlockWord,
  getBlacklist,
  addToBlacklist,
  removeFromBlacklist,
  updatePrivacySettings,
  getHelpLines,
  updateAnonymousInfo,
};
