import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { AdventureItinerary, AdventureMode } from '../types';
import {
  Sparkles,
  Clock,
  Coins,
  MapPin,
  Check,
  Bookmark,
  Share2,
  ExternalLink,
  RotateCcw,
  Compass,
  Users,
  Footprints,
  ShieldCheck,
} from 'lucide-react';

interface OtkrijPageProps {
  navigate: (route: string) => void;
}

export const OtkrijPage: React.FC<OtkrijPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { saveAdventure, setActiveItinerary } = useCulturalData();

  // Generator inputs
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['art', 'history']);
  const [availableHours, setAvailableHours] = useState<number>(3);
  const [budgetMKD, setBudgetMKD] = useState<number>(300);
  const [neighborhood, setNeighborhood] = useState<string>('all');
  const [environment, setEnvironment] = useState<'indoor' | 'outdoor' | 'mixed'>('mixed');
  const [mood, setMood] = useState<AdventureMode>('art_explorer');
  const [company, setCompany] = useState<'alone' | 'friends' | 'family'>('friends');
  const [accessibilityRequired, setAccessibilityRequired] = useState<boolean>(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<AdventureItinerary | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const interestOptions = [
    { id: 'art', labelMK: 'Современа уметност', labelEN: 'Contemporary Art' },
    { id: 'history', labelMK: 'Историја и архитектура', labelEN: 'History & Architecture' },
    { id: 'hidden', labelMK: 'Скриени алтернативни простори', labelEN: 'Hidden Alternative Spaces' },
    { id: 'crafts', labelMK: 'Занаети и филигран', labelEN: 'Living Crafts & Filigree' },
    { id: 'theatre', labelMK: 'Независен театар и танц', labelEN: 'Independent Theatre & Dance' },
    { id: 'film', labelMK: 'Арт-кино проекции', labelEN: 'Arthouse Film' },
    { id: 'nightlife', labelMK: 'Вечерва: Тематски вечери & свирки', labelEN: 'Tonight: Nightlife & Themes' },
  ];

  const moodModes: { id: AdventureMode; labelMK: string; labelEN: string }[] = [
    { id: 'evening_quest', labelMK: 'Вечерно Скопје (Свирки & Теми)', labelEN: 'Skopje After Dark Quest' },
    { id: 'art_explorer', labelMK: 'Уметнички истражувач', labelEN: 'Art Explorer' },
    { id: 'budget', labelMK: 'Буџетска авантура (0-100 МКД)', labelEN: 'Budget Quest' },
    { id: 'hidden_skopje', labelMK: 'Скриено Скопје', labelEN: 'Hidden Skopje' },
    { id: 'history_detective', labelMK: 'Историски детектив', labelEN: 'History Detective' },
    { id: 'friends', labelMK: 'Култура со пријатели', labelEN: 'Culture with Friends' },
    { id: 'quick', labelMK: 'Брза авантура (1 час)', labelEN: 'Quick Quest' },
    { id: 'weekend', labelMK: 'Викенд доживување', labelEN: 'Weekend Quest' },
    { id: 'surprise_me', labelMK: 'Изненади ме!', labelEN: 'Surprise Me' },
  ];

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter((item) => item !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsSaved(false);

    try {
      const response = await fetch('/api/generate-adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: selectedInterests,
          availableMinutes: availableHours * 60,
          budgetMKD,
          neighborhood,
          indoorOutdoor: environment,
          mood,
          company,
          accessibilityRequired,
          language: 'mk',
        }),
      });

      const data = await response.json();
      if (data && data.itinerary) {
        setGeneratedItinerary(data.itinerary);
        setActiveItinerary(data.itinerary);
      }
    } catch (err) {
      console.error('Error requesting adventure:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (generatedItinerary) {
      saveAdventure(generatedItinerary);
      setIsSaved(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-900 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>{t('ПОТПИСЕН МОДУЛ: OTKRIJ', 'SIGNATURE MODULE: OTKRIJ')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {t('Персонализирана културна авантура', 'Personalized Cultural Quest')}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t(
            'Избери ги твоите параметри: достапно време, максимален буџет и расположение. Алгоритмот ќе изгради ТОЧНО ЕДНА фокусирана патека без вишок избори и непотребни трошоци.',
            'Define your parameters: time, budget, and mood. The engine generates strictly ONE coherent, budget-respecting itinerary with zero split options.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Parameter Controls */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <h2 className="text-base font-serif font-bold text-stone-900">
              {t('Параметри за пребарување', 'Adventure Constraints')}
            </h2>
            <span className="text-xs font-mono text-stone-600">
              {t('Прецизен алгоритам', 'Exact Engine')}
            </span>
          </div>

          {/* 1. Cultural Interests */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              {t('Културни интереси', 'Cultural Interests')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {interestOptions.map((opt) => {
                const isSelected = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-blue-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                    {t(opt.labelMK, opt.labelEN)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Available Time */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-stone-700 uppercase tracking-wider">
                {t('Слободно време', 'Available Time')}
              </span>
              <span className="font-mono font-bold text-stone-900">
                {availableHours} {t('часа', 'hours')} ({availableHours * 60} {t('мин.', 'min.')})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setAvailableHours(h)}
                  className={`py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                    availableHours === h
                      ? 'border-blue-900 bg-blue-50 text-blue-950 font-bold'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {h} {h === 1 ? t('час', 'hr') : t('часа', 'hrs')}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Maximum Budget in MKD */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-stone-700 uppercase tracking-wider">
                {t('Максимален буџет', 'Maximum Budget')}
              </span>
              <span className="font-mono font-bold text-emerald-800">
                {budgetMKD === 0 ? t('0 МКД (Бесплатно)', '0 MKD (Free)') : `${budgetMKD} МКД`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 150, 300, 600].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudgetMKD(b)}
                  className={`py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                    budgetMKD === b
                      ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {b === 0 ? t('Бесплатно', 'Free') : `${b} МКД`}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Neighborhood / Area in Skopje */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              {t('Претпочитан реон во Скопје', 'Preferred Neighborhood')}
            </label>
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full text-xs py-2 px-3 border border-stone-300 rounded-md bg-stone-50 text-stone-900 focus:outline-none focus:border-blue-900 cursor-pointer"
            >
              <option value="all">{t('Сите маала (Оптимално пешачење)', 'All Neighborhoods (Walkable)')}</option>
              <option value="Stara Carsija">{t('Стара Чаршија и Кале', 'Old Bazaar & Kale')}</option>
              <option value="Debar Maalo">{t('Дебар Маало (Боемски кварт)', 'Debar Maalo')}</option>
              <option value="Centar">{t('Центар и Кеј', 'City Center & Quay')}</option>
            </select>
          </div>

          {/* 5. Company & Mood */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Друштво', 'Company')}
              </label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value as any)}
                className="w-full text-xs py-2 px-2.5 border border-stone-300 rounded-md bg-stone-50 text-stone-900 cursor-pointer"
              >
                <option value="alone">{t('Сам / Сама', 'Solo')}</option>
                <option value="friends">{t('Со пријатели', 'With Friends')}</option>
                <option value="family">{t('Со семејство', 'With Family')}</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Амбиент', 'Setting')}
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as any)}
                className="w-full text-xs py-2 px-2.5 border border-stone-300 rounded-md bg-stone-50 text-stone-900 cursor-pointer"
              >
                <option value="mixed">{t('Комбинирано', 'Mixed')}</option>
                <option value="indoor">{t('Само внатре', 'Indoor Only')}</option>
                <option value="outdoor">{t('Само на отворено', 'Outdoor Only')}</option>
              </select>
            </div>
          </div>

          {/* 6. Adventure Mode Priority */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
              {t('Режим на авантура', 'Adventure Mode')}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {moodModes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMood(m.id)}
                  className={`py-1.5 px-2 text-[11px] font-medium rounded text-left transition-colors cursor-pointer truncate ${
                    mood === m.id
                      ? 'bg-stone-900 text-white font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {t(m.labelMK, m.labelEN)}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Checkbox */}
          <div className="pt-2 border-t border-stone-200 flex items-center gap-2">
            <input
              type="checkbox"
              id="acc-check"
              checked={accessibilityRequired}
              onChange={(e) => setAccessibilityRequired(e.target.checked)}
              className="rounded border-stone-300 text-blue-900 focus:ring-blue-900 cursor-pointer"
            />
            <label htmlFor="acc-check" className="text-xs text-stone-700 cursor-pointer">
              {t(
                'Само пристапни локации (без скалила / за количка)',
                'Wheelchair / step-free accessible only'
              )}
            </label>
          </div>

          {/* Submit Generator Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 disabled:bg-stone-400 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            {isGenerating ? (
              <span>{t('Синтетизирање на една патека...', 'Synthesizing Single Itinerary...')}</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t('Генерирај една оптимизирана авантура', 'Generate Single Focused Quest')}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column (7 cols): Strict Single-Option Result */}
        <div className="lg:col-span-7 space-y-6">
          {!generatedItinerary && !isGenerating ? (
            /* Initial State */
            <div className="bg-[#FAF7F0] border border-stone-200 rounded-xl p-8 text-center space-y-4">
              <Compass className="w-10 h-10 text-stone-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  {t('Подготвен за откривање?', 'Ready to Discover?')}
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                  {t(
                    'Притисни го копчето за генерирање за да добиеш една дефинитивна културна рута во Скопје што точно одговара на твојот буџет и време.',
                    'Press generate to receive one definitive cultural route for Skopje matching your exact budget and time constraints.'
                  )}
                </p>
              </div>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('Генерирај (Пример: 3 часа, 300 МКД)', 'Generate (Demo: 3h, 300 MKD)')}</span>
              </button>
            </div>
          ) : isGenerating ? (
            /* Loading State */
            <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4">
              <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-serif font-bold text-stone-900">
                  {t('Синтетизираме единствена патека...', 'Synthesizing Single Itinerary...')}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {t('Усогласување на буџетот во МКД и работното време на музеите', 'Validating MKD prices and museum operating schedules')}
                </p>
              </div>
            </div>
          ) : (
            /* SINGLE-OPTION ITINERARY PRESENTATION */
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
              {/* Card Header & Verification */}
              <div className="p-6 bg-[#FAF7F0] border-b border-stone-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-900 uppercase">
                      {t('ЕДИНСТВЕНА ИЗБРАНА ПАТЕКА', 'SINGLE OPTIMIZED ITINERARY')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <VerificationBadge status={generatedItinerary!.verificationStatus} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                        isSaved
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
                      }`}
                    >
                      {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{isSaved ? t('Зачувано во пасош', 'Saved to Passport') : t('Зачувај рута', 'Save Quest')}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-1.5 rounded text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-300 cursor-pointer"
                      title={t('Сподели', 'Share')}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {t(generatedItinerary!.title.mk, generatedItinerary!.title.en)}
                </h2>

                <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                  {t(
                    generatedItinerary!.personalizedExplanation.mk,
                    generatedItinerary!.personalizedExplanation.en
                  )}
                </p>

                {/* Constraint Summary Strip */}
                <div className="pt-3 border-t border-stone-200 grid grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-stone-600" />
                    <div>
                      <div className="text-[10px] text-stone-600 uppercase font-mono font-medium">
                        {t('Време', 'Duration')}
                      </div>
                      <div className="font-bold font-mono text-stone-900">
                        ~{Math.round(generatedItinerary!.totalMinutes / 60)} {t('часа', 'hrs')} ({generatedItinerary!.totalMinutes} {t('мин.', 'min')})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="text-[10px] text-stone-600 uppercase font-mono font-medium">
                        {t('Вкупен трошок', 'Total Cost')}
                      </div>
                      <div className="font-bold font-mono text-emerald-800">
                        {generatedItinerary!.totalCostMKD} МКД
                        <span className="text-[10px] font-normal text-stone-600 ml-1">
                          (од макс {budgetMKD} МКД)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Footprints className="w-4 h-4 text-blue-800" />
                    <div>
                      <div className="text-[10px] text-stone-600 uppercase font-mono font-medium">
                        {t('Пешачка рута', 'Walkable Route')}
                      </div>
                      <div className="font-bold text-stone-900">
                        {generatedItinerary!.stops.length} {t('станици', 'stops')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stops Timeline */}
              <div className="p-6 space-y-6">
                <div className="text-xs font-mono uppercase tracking-wider text-stone-600 font-semibold">
                  {t('СЕКВЕНЦА НА СТАНИЦИ (ХРОНОЛОШКИ)', 'TIMELINE SEQUENCE OF STOPS')}
                </div>

                <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                  {generatedItinerary!.stops.map((stop, index) => (
                    <div key={stop.id} className="relative pl-9 space-y-2">
                      {/* Step Number Dot */}
                      <div className="absolute left-1 top-0.5 w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-stone-900">
                          {t(stop.stopTitle.mk, stop.stopTitle.en)}
                        </h4>
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-stone-500">{stop.estimatedMinutes} мин.</span>
                          <span className="text-emerald-800 font-semibold">
                            {stop.costMKD === 0 ? t('Бесплатно', 'Free') : `${stop.costMKD} МКД`}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-500 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{t(stop.venueName.mk, stop.venueName.en)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="italic">{stop.address}</span>
                      </div>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {t(stop.description.mk, stop.description.en)}
                      </p>

                      {/* Optional Mission Trigger */}
                      {stop.optionalQuestId && (
                        <div className="pt-1">
                          <button
                            onClick={() => navigate('quests')}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>{t('Поврзана мисија достапна (+100 XP) →', 'Linked Quest Available (+100 XP) →')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Source Verification Links */}
                <div className="pt-4 border-t border-stone-200 space-y-2">
                  <div className="text-[11px] font-mono uppercase text-stone-600 font-medium">
                    {t('Официјални извори на податоци', 'Official Source Records')}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-600">
                    {generatedItinerary!.sourceLinks.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-900 underline flex items-center gap-1"
                      >
                        <span>{src.name}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Actions bottom */}
                <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => navigate('map')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t('Прикажи ја патеката на картата', 'View Route on Map')}</span>
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('Прегенерирај со истите параметри', 'Regenerate')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
