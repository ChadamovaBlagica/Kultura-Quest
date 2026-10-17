import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-stone-200 bg-[#F5F2EB] text-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Editorial Tagline */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-xl font-bold font-serif text-stone-900 tracking-tight">
              KULTURA QUEST
            </span>
            <p className="text-sm font-serif italic text-stone-600 max-w-md">
              „Не гледај ја културата од страна. Откриј ја.“
            </p>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              {t(
                'Платформа за културно откривање и персонализирани авантури во Скопје и Македонија. Ги поврзуваме луѓето со изложби, скриени галерии, театар и занаетчиско наследство.',
                'Cultural discovery and adventure platform for Skopje and North Macedonia. Connecting explorers to contemporary art, independent venues, historic stones, and living crafts.'
              )}
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2 text-sm">
            <div className="text-xs font-semibold text-stone-900 tracking-wider uppercase mb-2">
              {t('Откривање', 'Exploration')}
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => navigate('vecerva')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left font-semibold text-blue-900"
                >
                  {t('Вечерва — Ноќен живот & Тематски вечери', 'Tonight — Nightlife & Theme Nights')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('otkrij')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('OTKRIJ планер (една авантура)', 'OTKRIJ Planner (Single Itinerary)')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('scan')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Скенирај културен постер', 'Scan Cultural Poster')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('map')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Културна карта на Скопје', 'Skopje Cultural Map')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('hidden-culture')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Скриена култура и независни простори', 'Hidden Culture & Indie Spaces')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('quests')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Интерактивни мисии и квизови', 'Interactive Quests & Quizzes')}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div className="space-y-2 text-sm">
            <div className="text-xs font-semibold text-stone-900 tracking-wider uppercase mb-2">
              {t('Платформа', 'Platform')}
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => navigate('guide')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('AI Културен водич', 'AI Cultural Guide')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('passport')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Дигитален пасош и поени', 'Digital Passport & XP')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('submit-event')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Предложи настан / За уметници', 'Submit Event / For Artists')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('admin')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Администраторски преглед', 'Admin Verification Panel')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('settings')}
                  className="hover:text-stone-900 transition-colors cursor-pointer text-left"
                >
                  {t('Поставки и податоци', 'Settings & Demo Controls')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-300 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex items-center gap-2">
            <span>KULTURA QUEST © 2026</span>
            <span aria-hidden="true">·</span>
            <span>{t('Скопје, Македонија', 'Skopje, North Macedonia')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('Отворен пристап до културата', 'Open Cultural Access')}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">
              {t('Сите прикажани цени се во МКД', 'All displayed prices in MKD')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
