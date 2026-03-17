import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { SectionCard } from './SectionCard';

interface DescriptionSectionProps {
  description: string;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({ description }) => {
  const { t } = useTranslation();

  if (!description) return null;

  return (
    <SectionCard title={t('businessDetail.description')}>
      <AppText
        style={{
          fontSize: 14,
          lineHeight: 22,
          color: colors.textSlate400,
          fontWeight: '400',
        }}
      >
        {description}
      </AppText>
    </SectionCard>
  );
};
