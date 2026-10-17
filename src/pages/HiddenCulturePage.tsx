import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { resolveImageUrl } from '../utils/imageAssets';
import {
  Sparkles,
  MapPin,
  Clock,
  ExternalLink,
  Compass,
  Eye,
  ShieldCheck,
  Building2,
} from 'lucide-react';

interface HiddenCultureProps {
  navigate: (route: string) => void;
}

export const HiddenCulturePage: React.FC<HiddenCultureProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { venues } = useCulturalData();

  const [activeFilter, setActiveFilter] = useState<'all' | 'free' | 'debar_maalo' | 'carsija'>('all');

  const hiddenVenues = venues.filter((v) => v.isLesserKnown);

  const filteredVenues = hiddenVenues.filter((v) => {
    if (activeFilter === 'free') return v.admissionPriceMKD === 0;
    if (activeFilter === 'debar_maalo') return v.neighborhood === 'Дебар Маало';
    if (activeFilter === 'carsija') return v.neighborhood === 'Стара Чаршија';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-3 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>{t('НЕЗАВИСНА И СКРИЕНА КУЛТУРА', 'INDEPENDENT & HIDDEN CULTURE')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {t('Надвор од вообичаените институции', 'Beyond the Mainstream Institutions')}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t(
            'Скопје има богата независна сцена: микро-галерии на станбени скалишта, ателјеа за рачен ситопечат во Дебар Маало, семејни филигранџии во чаршијата и простори за современ танц.',
            'Skopje thrives on grassroots spaces: micro-galleries tucked into residential staircases, silkscreen studios in Debar Maalo, and generational silversmiths in the Old Bazaar.'
          )}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-stone-900 text-white font-semibold'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          {t('Сите скриени простори', 'All Hidden Spaces')} ({hiddenVenues.length})
        </button>

        <button
          onClick={() => setActiveFilter('free')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeFilter === 'free'
              ? 'bg-stone-900 text-white font-semibold'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          {t('Слободен влез (0 МКД)', 'Free Entry (0 MKD)')}
        </button>

        <button
          onClick={() => setActiveFilter('debar_maalo')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeFilter === 'debar_maalo'
              ? 'bg-stone-900 text-white font-semibold'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          {t('Дебар Маало бохемија', 'Debar Maalo Quarters')}
        </button>

        <button
          onClick={() => setActiveFilter('carsija')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeFilter === 'carsija'
              ? 'bg-stone-900 text-white font-semibold'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          {t('Стара Чаршија занаети', 'Old Bazaar Artisans')}
        </button>
      </div>

      {/* Hidden Venues Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-400 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="relative h-60 bg-stone-100 overflow-hidden">
                <img
                  src={resolveImageUrl(venue.image)}
                  alt={venue.name.mk}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-amber-900/90 text-white text-[11px] font-mono px-2.5 py-0.5 rounded">
                  {venue.admissionPriceMKD === 0 ? t('Бесплатен влез', 'Free Entry') : `${venue.admissionPriceMKD} МКД`}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-stone-500 uppercase">{venue.neighborhood}</span>
                  <VerificationBadge status={venue.verificationStatus} />
                </div>

                <h2 className="text-xl font-serif font-bold text-stone-900 leading-snug">
                  {t(venue.name.mk, venue.name.en)}
                </h2>

                <p className="text-xs text-stone-500 italic flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>{venue.address}</span>
                </p>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {t(venue.description.mk, venue.description.en)}
                </p>

                {/* Why Discover Box */}
                <div className="p-3.5 bg-[#FAF7F0] rounded-lg border border-stone-200 text-xs space-y-1">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t('Зошто е уникатно да се открие:', 'Why it is unique to discover:')}</span>
                  </div>
                  <p className="text-stone-700 text-[11px] leading-relaxed">
                    {t(venue.whyDiscover.mk, venue.whyDiscover.en)}
                  </p>
                </div>

                {/* Practical Notes */}
                <div className="text-[11px] font-mono text-stone-500 space-y-1 pt-1">
                  <div>
                    <span className="font-semibold text-stone-700">{t('Распоред:', 'Hours:')} </span>
                    <span>{t(venue.openingHours.mk, venue.openingHours.en)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700">{t('Пристапност:', 'Accessibility:')} </span>
                    <span>{t(venue.accessibilityInfo.mk, venue.accessibilityInfo.en)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-stone-100 flex items-center justify-between mt-4">
              <a
                href={venue.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
              >
                <span>{t('Официјален извор', 'Official Source')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => navigate('otkrij')}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                {t('Вклучи во авантура', 'Include in Quest')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
