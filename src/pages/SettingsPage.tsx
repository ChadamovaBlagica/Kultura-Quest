import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import {
  Settings,
  Globe,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SettingsPageProps {
  navigate: (route: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ navigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { resetDemoData } = useCulturalData();

  const [resetSuccess, setResetSuccess] = useState(false);
  const [wheelchairPriority, setWheelchairPriority] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-stone-200 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold">
          <Settings className="w-4 h-4 text-blue-900" />
          <span>{t('КОНФИГУРАЦИЈА & ПОСТАВКИ', 'CONFIGURATION & PREFERENCES')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          {t('Поставки на платформата', 'Platform Settings')}
        </h1>
        <p className="text-xs text-stone-600 leading-relaxed">
          {t(
            'Прилагоди го јазикот, пристапноста и ресетирај ги демонстрациските податоци пред презентација.',
            'Customize language, accessibility preferences, or reset demonstration state.'
          )}
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6 text-xs shadow-xs">
        {/* Language Selection */}
        <div className="space-y-3 border-b border-stone-100 pb-5">
          <div className="flex items-center gap-2 font-semibold text-stone-800 uppercase tracking-wider">
            <Globe className="w-4 h-4 text-stone-500" />
            <span>{t('Главен јазик на интерфејсот', 'Interface Language')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLanguage('mk')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                language === 'mk'
                  ? 'border-blue-900 bg-blue-50/50 text-blue-950 font-bold'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="text-sm font-serif">Македонски јазик</div>
              <div className="text-[11px] font-normal text-stone-500">Примарен јазик со кирилично писмо</div>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                language === 'en'
                  ? 'border-blue-900 bg-blue-50/50 text-blue-950 font-bold'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="text-sm font-serif">English</div>
              <div className="text-[11px] font-normal text-stone-500">Secondary language for international explorers</div>
            </button>
          </div>
        </div>

        {/* Accessibility Toggles */}
        <div className="space-y-3 border-b border-stone-100 pb-5">
          <div className="font-semibold text-stone-800 uppercase tracking-wider block">
            {t('Пристапност и приказ', 'Accessibility')}
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wheelchairPriority}
                onChange={(e) => setWheelchairPriority(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-blue-900 focus:ring-blue-900"
              />
              <div>
                <span className="font-semibold text-stone-800 block">
                  {t('Дај приоритет на рамни влезови и лифтови', 'Prioritize step-free & wheelchair access')}
                </span>
                <span className="text-stone-500">
                  {t('Филтрира само локации со верификувана пристапност за лица во колички.', 'Exclusively recommends venues with verified ramp or elevator access.')}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
                className="mt-0.5 rounded border-stone-300 text-blue-900 focus:ring-blue-900"
              />
              <div>
                <span className="font-semibold text-stone-800 block">
                  {t('Намалено движење (Reduced motion)', 'Reduced motion')}
                </span>
                <span className="text-stone-500">
                  {t('Ги исклучува визуелните анимации за полесно читање.', 'Disables micro-interactions and transitions for comfort.')}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Reset Demo Data */}
        <div className="space-y-3">
          <div className="font-semibold text-stone-800 uppercase tracking-wider block">
            {t('Ресетирање на демо податоци (Хакатон)', 'Demo Data Controls')}
          </div>
          <p className="text-stone-500 leading-relaxed">
            {t(
              'Ако сакаш одново да го поминеш 90-секундното хакатон сценарио, кликни го копчето подолу за да го вратиш пасошот, поените и зачуваните рути во почетна состојба.',
              'Reset all stored local progress, XP, and submitted events back to the initial deterministic presentation baseline.'
            )}
          </p>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-800 hover:bg-red-50 rounded-lg cursor-pointer font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('Врати ги демо податоците во почетна состојба', 'Reset Demo State')}</span>
          </button>

          {resetSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t('Податоците се успешно ресетирани!', 'Demo data reset successfully!')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
