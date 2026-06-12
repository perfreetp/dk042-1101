import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getBlockWords, addBlockWord, removeBlockWord } from '@/services/userService';

const BlockwordsPage: React.FC = () => {
  const [words, setWords] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBlockWords();
      setWords(data);
    } catch (error) {
      console.error('[BlockwordsPage] 获取屏蔽词失败', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = useCallback(async () => {
    const word = newWord.trim();
    if (!word) {
      Taro.showToast({ title: '请输入屏蔽词', icon: 'none' });
      return;
    }
    if (word.length < 2) {
      Taro.showToast({ title: '屏蔽词至少2个字', icon: 'none' });
      return;
    }
    if (words.includes(word)) {
      Taro.showToast({ title: '该词已在屏蔽列表中', icon: 'none' });
      return;
    }
    if (words.length >= 50) {
      Taro.showToast({ title: '最多添加50个屏蔽词', icon: 'none' });
      return;
    }

    try {
      await addBlockWord(word);
      setWords(prev => [...prev, word]);
      setNewWord('');
      Taro.showToast({ title: '添加成功', icon: 'success' });
    } catch (error) {
      console.error('[BlockwordsPage] 添加失败', error);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
  }, [newWord, words]);

  const handleRemove = useCallback(async (word: string) => {
    Taro.showModal({
      title: '移除屏蔽词',
      content: `确定要移除「${word}」吗？`,
      confirmColor: '#7C5CFF',
      success: async (res) => {
        if (res.confirm) {
          try {
            await removeBlockWord(word);
            setWords(prev => prev.filter(w => w !== word));
            Taro.showToast({ title: '已移除', icon: 'success' });
          } catch (error) {
            console.error('[BlockwordsPage] 移除失败', error);
            Taro.showToast({ title: '移除失败', icon: 'none' });
          }
        }
      },
    });
  }, []);

  const handleClearAll = useCallback(() => {
    if (words.length === 0) return;
    Taro.showModal({
      title: '清空屏蔽词',
      content: '确定要清空所有屏蔽词吗？',
      confirmColor: '#EF4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            for (const word of words) {
              await removeBlockWord(word);
            }
            setWords([]);
            Taro.showToast({ title: '已清空', icon: 'success' });
          } catch (error) {
            console.error('[BlockwordsPage] 清空失败', error);
            Taro.showToast({ title: '清空失败', icon: 'none' });
          }
        }
      },
    });
  }, [words]);

  return (
    <View className={styles.blockwordsPage}>
      <View className={styles.addSection}>
        <Text className={styles.sectionTitle}>添加屏蔽词</Text>
        <View className={styles.inputRow}>
          <View className={classnames(styles.inputWrapper, focused && styles.focused)}>
            <Input
              className={styles.input}
              value={newWord}
              onInput={(e) => setNewWord(e.detail.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="输入要屏蔽的关键词"
              maxlength={20}
              confirmType="done"
              onConfirm={handleAdd}
            />
          </View>
          <View
            className={classnames(styles.addBtn, !newWord.trim() && styles.disabled)}
            onClick={handleAdd}
          >
            <Text>添加</Text>
          </View>
        </View>
        <Text className={styles.tip}>包含屏蔽词的内容将自动隐藏，最多可添加50个屏蔽词</Text>
      </View>

      <View className={styles.wordsSection}>
        <View className={styles.header}>
          <Text className={styles.sectionTitle}>已屏蔽 ({words.length})</Text>
          {words.length > 0 && (
            <Text className={styles.clearBtn} onClick={handleClearAll}>清空</Text>
          )}
        </View>

        {words.length === 0 ? (
          <View className={styles.emptyWrap}>
            <Text className={styles.emptyIcon}>🔇</Text>
            <Text className={styles.emptyText}>暂无屏蔽词</Text>
          </View>
        ) : (
          <View className={styles.wordsList}>
            {words.map(word => (
              <View key={word} className={styles.wordTag}>
                <Text className={styles.word}>{word}</Text>
                <Text className={styles.remove} onClick={() => handleRemove(word)}>×</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default BlockwordsPage;
