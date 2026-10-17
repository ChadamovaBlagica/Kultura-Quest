import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Play, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface HackathonTourProps {
  navigate: (route: string) => void;
  triggerDemoScene?: (sceneNumber: number) => void;
}

export const HackathonTourBanner: React.FC<HackathonTourProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [activeScene, setActiveScene] = useState(1);

  if (!isOpen) return null;

  const scenes = [
    {
      num: 1,
      titleMK: '1. Откривање',
      titleEN: '1. Discover',
      descMK: 'Почетна страница и културен преглед на Скопје',
      descEN: 'Landing and Skopje cultural landscape',
      route: 'home',
    },
    {
      num: 2,
      titleMK: '2. Персонализација',
      titleEN: '2. Personalize',
      descMK: '3 часа време, 300 МКД буџет, современа уметност',
      descEN: '3 hours, 300 MKD budget, contemporary art',
      route: 'otkrij',
    },
    {
      num: 3,
      titleMK: '3. Една авантура (OTKRIJ)',
      titleEN: '3. Single-Option Quest',
      descMK: 'Единствена, фокусирана културна рута без двоумење',
      descEN: 'Definitive single-option itinerary generated',
      route: 'otkrij',
    },
    {
      num: 4,
      titleMK: '4. Скенирај постер',
      titleEN: '4. Scan Poster',
      descMK: 'OCR екстракција на настан од постер со верификација',
      descEN: 'OCR & Vision poster extraction with confidence flags',
      route: 'scan',
    },
    {
      num: 5,
      titleMK: '5. Поврзи настан',
      titleEN: '5. Connect Event',
      descMK: 'Зачувување и планирање авантура околу настанот',
      descEN: 'Save event and generate custom quest',
      route: 'scan',
    },
    {
      num: 6,
      titleMK: '6. Културна мисија',
      titleEN: '6. Quest Experience',
      descMK: 'Решавање мисија во МСУ и освојување значка',
      descEN: 'Complete MoCA Solidarity quest & earn XP',
      route: 'quests',
    },
    {
      num: 7,
      titleMK: '7. Дигитален пасош',
      titleEN: '7. Digital Passport',
      descMK: 'Ажуриран напредок, ниво и заработени поени',
      descEN: 'Passport level progression and badge showcases',
      route: 'passport',
    },
    {
      num: 8,
      titleMK: '8. Општествен импакт',
      titleEN: '8. Community Impact',
      descMK: 'Поддршка за скриени простори и локални занаетчии',
      descEN: 'Promoting independent spaces and artisans',
      route: 'hidden-culture',
    },
    {
      num: 9,
      titleMK: '9. Вечерва & Ноќен живот',
      titleEN: '9. Tonight & Nightlife',
      descMK: 'Тематски вечери, диџеј сетови, паб квизови и планер за вечерва',
      descEN: 'Theme nights, DJ sets, pub quizzes, and Plan My Night',
      route: 'vecerva',
    },
  ];

  const handleStepClick = (scene: typeof scenes[0]) => {
    setActiveScene(scene.num);
    navigate(scene.route);
  };

  const handleNext = () => {
    const nextNum = activeScene < 9 ? activeScene + 1 : 1;
    const nextScene = scenes.find((s) => s.num === nextNum)!;
    handleStepClick(nextScene);
  };

  return (
    <div className="bg-stone-900 text-stone-100 border-b border-stone-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-serif italic font-medium text-amber-300">
            {t('90-секундно Хакатон Демо:', '90-Sec Demo Walkthrough:')}
          </span>
          <span className="text-stone-300 font-medium">
            {t(scenes[activeScene - 1].titleMK, scenes[activeScene - 1].titleEN)}
          </span>
          <span className="text-stone-400 hidden sm:inline">
            — {t(scenes[activeScene - 1].descMK, scenes[activeScene - 1].descEN)}
          </span>
        </div>

        {/* Right: Step buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {scenes.map((s) => (
            <button
              key={s.num}
              onClick={() => handleStepClick(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer shrink-0 ${
                activeScene === s.num
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
              title={t(s.descMK, s.descEN)}
            >
              {s.num}
            </button>
          ))}

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-2.5 py-0.5 ml-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium rounded text-[11px] cursor-pointer whitespace-nowrap transition-colors"
          >
            <span>{t('Следна сцена', 'Next Scene')}</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-200 ml-1 cursor-pointer"
            title={t('Затвори лента', 'Dismiss banner')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
