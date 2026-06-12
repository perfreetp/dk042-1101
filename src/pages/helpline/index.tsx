import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { HelpLine } from '@/types';
import { getHelpLines } from '@/services/userService';

const HelplinePage: React.FC = () => {
  const [lines, setLines] = useState<HelpLine[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHelpLines();
      setLines(data);
    } catch (error) {
      console.error('[HelplinePage] 获取热线失败', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCall = useCallback((number: string, name: string) => {
    Taro.showModal({
      title: '拨打热线',
      content: `确定要拨打「${name}」${number} 吗？`,
      confirmText: '拨打',
      confirmColor: '#7C5CFF',
      success: (res) => {
        if (res.confirm) {
          Taro.makePhoneCall({
            phoneNumber: number.replace(/-/g, ''),
            fail: () => {
              Taro.showToast({ title: '拨号失败', icon: 'none' });
            },
          });
        }
      },
    });
  }, []);

  const handleEmergencyCall = useCallback(() => {
    Taro.showModal({
      title: '紧急求助',
      content: '您确定要拨打110报警电话吗？这是紧急求助热线，请在真正需要时使用。',
      confirmText: '拨打',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          Taro.makePhoneCall({
            phoneNumber: '110',
            fail: () => {
              Taro.showToast({ title: '拨号失败', icon: 'none' });
            },
          });
        }
      },
    });
  }, []);

  const icons = ['💚', '💙', '💜', '🧡', '💛'];

  return (
    <View className={styles.helplinePage}>
      <View className={styles.banner}>
        <Text className={styles.icon}>💗</Text>
        <Text className={styles.title}>你不是一个人</Text>
        <Text className={styles.desc}>
          当你感到痛苦、无助或有伤害自己的想法时，{'\n'}
          请立即拨打以下心理援助热线。{'\n'}
          专业的心理咨询师会24小时为你提供帮助。
        </Text>
      </View>

      <View className={styles.tip}>
        <Text className={styles.text}>
          <Text className={styles.highlight}>温馨提示：</Text>
          所有热线均为免费服务，您的通话内容将严格保密，请放心倾诉。
        </Text>
      </View>

      <Text className={styles.sectionTitle}>心理援助热线</Text>

      <View className={styles.lineList}>
        {lines.map((line, index) => (
          <View key={line.id} className={styles.lineCard}>
            <View className={styles.lineHeader}>
              <View className={styles.icon}>
                <Text>{icons[index % icons.length]}</Text>
              </View>
              <View className={styles.info}>
                <Text className={styles.name}>{line.name}</Text>
                <Text className={styles.desc}>{line.description}</Text>
              </View>
            </View>

            <View className={styles.lineNumber}>
              <Text className={styles.number}>{line.number}</Text>
              <View
                className={styles.callBtn}
                onClick={() => handleCall(line.number, line.name)}
              >
                <Text>立即拨打</Text>
              </View>
            </View>

            <View className={styles.lineFooter}>
              <Text className={styles.serviceTime}>服务时间：{line.serviceTime}</Text>
              <Text className={styles.tag}>免费</Text>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.emergencyCard}>
        <Text className={styles.title}>
          <Text>🚨</Text> 紧急情况
        </Text>
        <Text className={styles.content}>
          如果您或您身边的人正处于危险中，或有即刻的自伤/自杀计划，
          请立即拨打110报警电话或前往最近医院的急诊室。
        </Text>
        <View className={styles.callNow} onClick={handleEmergencyCall}>
          <Text>📞 拨打110紧急求助</Text>
        </View>
      </View>
    </View>
  );
};

export default HelplinePage;
