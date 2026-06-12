import React, { useState, useCallback } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { ReportType } from '@/types';
import { reportContent } from '@/services/holeService';

const reportTypes: { type: ReportType; icon: string; title: string; desc: string }[] = [
  { type: 'spam', icon: '📢', title: '垃圾广告', desc: '包含推广、营销、引流等内容' },
  { type: 'abuse', icon: '😡', title: '辱骂攻击', desc: '人身攻击、恶意辱骂、歧视等' },
  { type: 'violence', icon: '💢', title: '暴力内容', desc: '血腥、暴力、自残等内容' },
  { type: 'porn', icon: '🔞', title: '色情低俗', desc: '色情、低俗、暗示性内容' },
  { type: 'other', icon: '📝', title: '其他违规', desc: '其他违反社区规范的内容' },
];

const ReportPage: React.FC = () => {
  const router = useRouter();
  const targetId = router.params.targetId as string;
  const targetType = router.params.targetType as 'hole' | 'comment';

  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [reason, setReason] = useState('');
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!selectedType) {
      Taro.showToast({ title: '请选择举报类型', icon: 'none' });
      return;
    }
    if (!reason.trim()) {
      Taro.showToast({ title: '请填写举报原因', icon: 'none' });
      return;
    }
    if (reason.trim().length < 5) {
      Taro.showToast({ title: '举报原因至少5个字', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      const success = await reportContent({
        targetId,
        targetType,
        reportType: selectedType,
        reason: reason.trim(),
      });
      if (success) {
        Taro.showToast({ title: '举报已提交', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1000);
      }
    } catch (error) {
      console.error('[ReportPage] 举报失败', error);
      Taro.showToast({ title: '举报失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  }, [selectedType, reason, targetId, targetType]);

  return (
    <View className={styles.reportPage}>
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>选择举报类型</Text>
        <View className={styles.typeList}>
          {reportTypes.map(item => (
            <View
              key={item.type}
              className={classnames(styles.typeItem, selectedType === item.type && styles.selected)}
              onClick={() => setSelectedType(item.type)}
            >
              <Text className={styles.icon}>{item.icon}</Text>
              <View className={styles.info}>
                <Text className={styles.title}>{item.title}</Text>
                <Text className={styles.desc}>{item.desc}</Text>
              </View>
              <View className={classnames(styles.check, selectedType === item.type && styles.checked)}>
                {selectedType === item.type && <Text>✓</Text>}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.card}>
        <Text className={styles.sectionTitle}>详细描述</Text>
        <View className={classnames(styles.textareaWrapper, focused && styles.focused)}>
          <Textarea
            className={styles.textarea}
            value={reason}
            onInput={(e) => setReason(e.detail.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="请详细描述违规内容，有助于我们更准确地处理..."
            maxlength={500}
            autoHeight
          />
          <Text className={styles.count}>{reason.length}/500</Text>
        </View>
      </View>

      <View className={styles.tip}>
        <Text>
          <Text className={styles.highlight}>温馨提示：</Text>
          恶意举报、虚假举报会影响您的账号信用，请如实填写。我们会在24小时内处理您的举报。
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(styles.submitBtn, (!selectedType || !reason.trim() || submitting) && styles.disabled)}
          onClick={handleSubmit}
        >
          <Text>{submitting ? '提交中...' : '提交举报'}</Text>
        </View>
      </View>
    </View>
  );
};

export default ReportPage;
