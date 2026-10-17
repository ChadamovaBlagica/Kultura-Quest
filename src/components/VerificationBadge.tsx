import React from 'react';
import { CheckCircle2, AlertCircle, FileCheck, HelpCircle } from 'lucide-react';
import { VerificationStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface VerificationBadgeProps {
  status: VerificationStatus;
  showIcon?: boolean;
  className?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  status,
  showIcon = true,
  className = '',
}) => {
  const { t } = useLanguage();

  switch (status) {
    case 'verified_official':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 ${className}`}
          title={t('Верификувано од официјална институција', 'Verified from official institution source')}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />}
          <span>{t('Официјално верификувано', 'Officially Verified')}</span>
        </span>
      );
    case 'organizer_submitted':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 ${className}`}
          title={t('Поднесено директно од независен организатор', 'Submitted directly by independent organizer')}
        >
          {showIcon && <FileCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />}
          <span>{t('Од организатор', 'Organizer Submitted')}</span>
        </span>
      );
    case 'demo_data':
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 ${className}`}
          title={t('Демонстрациски запис за хакатон презентација', 'Demonstration record for presentation')}
        >
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-stone-500 shrink-0" aria-hidden="true" />}
          <span>{t('Демо запис', 'Demo Data')}</span>
        </span>
      );
    case 'not_independently_verified':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 ${className}`}
          title={t('Податокот не е независно потврден од официјален претставник', 'Not independently verified')}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" aria-hidden="true" />}
          <span>{t('Неверификувано', 'Unverified')}</span>
        </span>
      );
  }
};
