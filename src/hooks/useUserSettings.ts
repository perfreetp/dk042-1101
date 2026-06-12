import { useState, useEffect, useCallback } from 'react';
import type { UserSettings, HelpLine } from '@/types';
import {
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
} from '@/services/userService';

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [blockWords, setBlockWords] = useState<string[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [helpLines, setHelpLines] = useState<HelpLine[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsData, blockWordsData, blacklistData, helpLinesData] = await Promise.all([
        getUserSettings(),
        getBlockWords(),
        getBlacklist(),
        getHelpLines(),
      ]);
      setSettings(settingsData);
      setBlockWords(blockWordsData);
      setBlacklist(blacklistData);
      setHelpLines(helpLinesData);
    } catch (error) {
      console.error('[useUserSettings] 获取设置失败', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      const updated = await updateUserSettings(updates);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error('[useUserSettings] 更新设置失败', error);
      throw error;
    }
  }, []);

  const handleAddBlockWord = useCallback(async (word: string) => {
    if (!word.trim()) return;
    try {
      await addBlockWord(word.trim());
      setBlockWords(prev => [...new Set([...prev, word.trim()])]);
    } catch (error) {
      console.error('[useUserSettings] 添加屏蔽词失败', error);
      throw error;
    }
  }, []);

  const handleRemoveBlockWord = useCallback(async (word: string) => {
    try {
      await removeBlockWord(word);
      setBlockWords(prev => prev.filter(w => w !== word));
    } catch (error) {
      console.error('[useUserSettings] 删除屏蔽词失败', error);
      throw error;
    }
  }, []);

  const handleAddToBlacklist = useCallback(async (userId: string) => {
    try {
      await addToBlacklist(userId);
      setBlacklist(prev => [...new Set([...prev, userId])]);
    } catch (error) {
      console.error('[useUserSettings] 添加黑名单失败', error);
      throw error;
    }
  }, []);

  const handleRemoveFromBlacklist = useCallback(async (userId: string) => {
    try {
      await removeFromBlacklist(userId);
      setBlacklist(prev => prev.filter(id => id !== userId));
    } catch (error) {
      console.error('[useUserSettings] 移除黑名单失败', error);
      throw error;
    }
  }, []);

  const handleUpdatePrivacy = useCallback(async (privacy: Partial<UserSettings['privacy']>) => {
    try {
      const updated = await updatePrivacySettings(privacy);
      setSettings(updated);
      return updated;
    } catch (error) {
      console.error('[useUserSettings] 更新隐私设置失败', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    blockWords,
    blacklist,
    helpLines,
    loading,
    fetchSettings,
    updateSettings,
    handleAddBlockWord,
    handleRemoveBlockWord,
    handleAddToBlacklist,
    handleRemoveFromBlacklist,
    handleUpdatePrivacy,
  };
}

export default useUserSettings;
