import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import {
  getEventPriceLabel,
  getNightDateRange,
  hasConfirmedEventPrice,
  isNightlifeEvent,
} from '../utils/eventUtils';
import {
  Compass,
  Camera,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Moon,
  Flame,
  Calendar,
  Ticket,
  Music,
} from 'lucide-react';
import { StaticSkopjeMap } from '../components/StaticSkopjeMap';

interface LandingPageProps {
  navigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { events, venues, quests } = useCulturalData();

  const [tonightDate, setTonightDate] = useState<'tonight' | 'tomorrow' | 'weekend'>('tonight');
  const [tonightTheme, setTonightTheme] = useState<string>('all');
  const [tonightMaxBudget, setTonightMaxBudget] = useState<number | 'all'>('all');

  const { today: TODAY, tomorrow: TOMORROW, weekend: WEEKEND } = getNightDateRange();

  const upcomingNightEvents = useMemo(() => {
    return events.filter(
      (e) =>
        isNightlifeEvent(e) && e.date >= TODAY
    );
  }, [events]);

  const filteredTonightEvents = useMemo(() => {
    return upcomingNightEvents.filter((ev) => {
      if (tonightDate === 'tonight' && ev.date !== TODAY) return false;
      if (tonightDate === 'tomorrow' && ev.date !== TOMORROW) return false;
      if (tonightDate === 'weekend' && !WEEKEND.includes(ev.date)) return false;

      if (tonightTheme === 'throwback' && ev.theme !== '80s / 90s / 2000s') return false;
      if (tonightTheme === 'latin' && ev.theme !== 'Latin Nights') return false;
      if (tonightTheme === 'quiz' && ev.theme !== 'Quiz & Trivia Nights') return false;
      if (tonightTheme === 'jazz' && ev.theme !== 'Jazz & Acoustic') return false;
      if (tonightTheme === 'techno' && ev.theme !== 'Electronic & Techno') return false;
      if (tonightTheme === 'live_music' && ev.theme !== 'Live Music') return false;
      if (tonightTheme === 'club_dj' && ev.theme !== 'Club & DJ') return false;
      if (tonightTheme === 'festival' && ev.category !== 'festival') return false;

      if (
        tonightMaxBudget !== 'all' &&
        (!hasConfirmedEventPrice(ev) || ev.priceMKD > tonightMaxBudget)
      ) return false;

      return true;
    });
  }, [upcomingNightEvents, tonightDate, tonightTheme, tonightMaxBudget, WEEKEND]);

  const featuredEvent = events[0];
  const featuredQuest = quests[0];

  return (
    <div className="space-y-16">
      {/* Editorial Marquee Hero */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 7 cols: Editorial Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-mono">
                <span>{t('СКОПЈЕ КУЛТУРНА ПЛАТФОРМА', 'SKOPJE CULTURAL PLATFORM')}</span>
                <span aria-hidden="true">·</span>
                <span>{t('СЕЗОНА 2026', 'SEASON 2026')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.1] text-balance">
                {t(
                  'Твојот град крие приказни. Откриј ги.',
                  'Your city holds stories. Uncover them.'
                )}
              </h1>

              <p className="text-lg text-stone-600 leading-relaxed max-w-xl font-normal">
                {t(
                  'Од изложби и скриени уметнички простори до културни авантури создадени според твојот буџет, интереси и слободно време.',
                  'From exhibitions and intimate hidden galleries to curated cultural adventures tailored strictly to your budget, interests, and free hours.'
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => navigate('otkrij')}
                  className="flex items-center gap-2 px-6 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg text-sm transition-colors cursor-pointer shadow-sm"
                >
                  <Compass className="w-4 h-4" aria-hidden="true" />
                  <span>{t('Откриј авантура', 'Discover Quest')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </button>

                <button
                  onClick={() => navigate('scan')}
                  className="flex items-center gap-2 px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-lg text-sm border border-stone-300 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-stone-600" aria-hidden="true" />
                  <span>{t('Скенирај постер', 'Scan Poster')}</span>
                </button>
              </div>

              {/* Core Journey Flow Bar */}
              <div className="pt-4 border-t border-stone-200">
                <div className="text-[11px] font-mono uppercase tracking-wider text-stone-600 mb-2 font-medium">
                  {t('Корисничко патување', 'Core User Journey')}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-700">
                  <span className="text-blue-900 font-semibold">{t('ОТКРИЈ', 'DISCOVER')}</span>
                  <span className="text-stone-300">→</span>
                  <span>{t('ПЛАНИРАЈ', 'PLAN')}</span>
                  <span className="text-stone-300">→</span>
                  <span>{t('ДОЖИВЕЈ', 'EXPERIENCE')}</span>
                  <span className="text-stone-300">→</span>
                  <span>{t('НАУЧИ', 'LEARN')}</span>
                  <span className="text-stone-300">→</span>
                  <span className="text-amber-800 font-semibold">{t('НАПРЕДУВАЈ', 'EARN PROGRESS')}</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Hero Visual Framed */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border border-stone-300 shadow-md bg-stone-100">
                <img
                  src="/src/assets/images/hero_skopje_culture_1792095894217.jpg"
                  alt={t(
                    'Поглед кон Скопската Чаршија и терасите на Музејот на современа уметност',
                    'Panoramic view of Skopje Old Bazaar and contemporary art museum terraces'
                  )}
                  className="w-full h-[380px] sm:h-[440px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-300 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('Стара Чаршија & Кале, Скопје', 'Old Bazaar & Kale, Skopje')}</span>
                  </div>
                  <h3 className="text-lg font-serif font-semibold text-white">
                    {t(
                      'Спој на вековно наследство и пост-земјотресен брутализам',
                      'Dialogues between medieval stones and post-earthquake modernism'
                    )}
                  </h3>
                  <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                    {t(
                      'Музејот на светската солидарност (МСУ) и калдрмите на чаршијата во единствена 3-часовна авантура.',
                      'MoCA solidarity collection and bazaar crafts woven into one focused 3-hour journey.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Utility Ribbon */}
        <div className="mt-10 border-y border-stone-200 bg-[#F5F2EB]/80 py-3.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('100% Верификувани локации', '100% Verified Locations')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-800 shrink-0" />
                <span>{t('Прецизно почитување на време', 'Accurate Time Alignment')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{t('Транспарентни цени во МКД', 'Transparent MKD Pricing')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-stone-800 shrink-0" />
                <span>{t('Дигитален пасош & мисии', 'Digital Passport & Quests')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Feature: OTKRIJ Teaser & Single-Option Philosophy */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-xl border border-stone-200 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-blue-900 font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4" />
                <span>{t('ПОТПИСНА ФУНКЦИЈА: OTKRIJ', 'SIGNATURE FEATURE: OTKRIJ')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {t(
                  'Една авантура. Без преоптовареност. Без двоумење.',
                  'One Adventure. Zero Overwhelm. No Split Decisions.'
                )}
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t(
                  'Наместо илјада расфрлани настани во календари, нашиот интелигентен алгоритам создава ЕДНА оптимизирана, практична културна патека според твојот буџет и минути.',
                  'Instead of fragmented listings and endless decision fatigue, OTKRIJ synthesizes exactly ONE coherent, budget-respecting itinerary at a time.'
                )}
              </p>
            </div>

            <button
              onClick={() => navigate('otkrij')}
              className="px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap self-start md:self-center shadow-xs"
            >
              {t('Отвори го планерот OTKRIJ', 'Launch OTKRIJ Planner')}
            </button>
          </div>
        </div>
      </section>

      {/* Prominent Nightlife & Theme Nights Homepage Section: "Градот има план за вечерва." */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-stone-800 bg-[#141210] text-stone-100 p-6 sm:p-10 shadow-xl space-y-8">
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stone-800 pb-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
                <Moon className="w-4 h-4" />
                <span>{t('СКОПЈЕ ПОСЛЕ 19:00', 'SKOPJE AFTER DARK')}</span>
                <span aria-hidden="true">·</span>
                <span>{t('ВЕЧЕРВА & ТЕМАТСКИ ВЕЧЕРИ', 'TONIGHT & THEME NIGHTS')}</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                {t('Градот има план за вечерва.', 'The city has plans for tonight.')}
              </h2>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                {t(
                  'Од тематски забави и DJ сетови до квизови, свирки и скриени места — пронајди вечер што одговара на твојот vibe.',
                  'From theme parties and DJ sets to quizzes, live gigs, and hidden gems — find an evening tailored to your vibe.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('vecerva')}
                className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shadow-md"
              >
                <Flame className="w-4 h-4 text-stone-950" />
                <span>{t('Откриј вечерва', 'Discover Tonight')}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={() => navigate('vecerva')}
                className="flex items-center gap-2 px-5 py-3 bg-stone-800 hover:bg-stone-700 text-white font-medium rounded-lg text-xs sm:text-sm border border-stone-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('Генерирај план за вечерва', 'Plan My Night')}</span>
              </button>
            </div>
          </div>

          {/* Interactive Date & Theme Controls */}
          <div className="space-y-4">
            {/* Top row: Date switch & Quick budget */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-stone-900 rounded-lg overflow-x-auto border border-stone-800">
                <button
                  onClick={() => setTonightDate('tonight')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    tonightDate === 'tonight'
                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {t('Вечерва', 'Tonight')}
                </button>
                <button
                  onClick={() => setTonightDate('tomorrow')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    tonightDate === 'tomorrow'
                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {t('Утре', 'Tomorrow')}
                </button>
                <button
                  onClick={() => setTonightDate('weekend')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    tonightDate === 'weekend'
                      ? 'bg-amber-400 text-stone-950 shadow-xs'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  {t('Викенд', 'Weekend')}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-stone-400">{t('Буџет:', 'Budget:')}</span>
                <select
                  value={tonightMaxBudget}
                  onChange={(e) =>
                    setTonightMaxBudget(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="py-1 px-2.5 rounded bg-stone-900 border border-stone-700 text-stone-200 text-xs cursor-pointer focus:outline-none"
                >
                  <option value="all">{t('Сите буџети', 'All budgets')}</option>
                  <option value={0}>{t('Бесплатен влез (0 МКД)', 'Free (0 MKD)')}</option>
                  <option value={150}>{t('До 150 МКД', 'Up to 150 MKD')}</option>
                  <option value={300}>{t('До 300 МКД', 'Up to 300 MKD')}</option>
                </select>
              </div>
            </div>

            {/* Theme Collection Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { id: 'all', labelMK: 'Сите теми', labelEN: 'All Themes' },
                { id: 'throwback', labelMK: '80s & 90s Ретро', labelEN: '80s & 90s Retro' },
                { id: 'jazz', labelMK: 'Џез & Блуз свирки', labelEN: 'Live Jazz & Blues' },
                { id: 'quiz', labelMK: 'Паб квизови & Игри', labelEN: 'Pub Quizzes & Games' },
                { id: 'latin', labelMK: 'Латино & Салса', labelEN: 'Latin & Salsa' },
                { id: 'techno', labelMK: 'Техно & Електроника', labelEN: 'Techno & Electronic' },
                { id: 'live_music', labelMK: 'Жива музика', labelEN: 'Live Music' },
                { id: 'club_dj', labelMK: 'Клубови & DJ', labelEN: 'Clubs & DJs' },
                { id: 'festival', labelMK: 'Фестивали', labelEN: 'Festivals' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setTonightTheme(theme.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors cursor-pointer font-medium ${
                    tonightTheme === theme.id
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {t(theme.labelMK, theme.labelEN)}
                </button>
              ))}
            </div>
          </div>

          {/* Events Showcase Grid or Empty State */}
          {filteredTonightEvents.length === 0 ? (
            <div className="border border-dashed border-stone-800 rounded-xl p-8 text-center space-y-3">
              <Moon className="w-8 h-8 text-stone-500 mx-auto" />
              <p className="text-sm text-stone-400">
                {t(
                  'Нема настани со овие филтри за избраниот датум.',
                  'No evening events found for these specific filters.'
                )}
              </p>
              <button
                onClick={() => {
                  setTonightTheme('all');
                  setTonightMaxBudget('all');
                }}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded font-medium cursor-pointer"
              >
                {t('Ресетирај филтри', 'Reset filters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTonightEvents.slice(0, 3).map((event) => {
                const venue = venues.find((v) => v.id === event.venueId);
                return (
                  <div
                    key={event.id}
                    onClick={() => navigate('vecerva')}
                    className="group bg-stone-900/90 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-400/50 transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Event Banner */}
                      <div className="relative h-44 bg-stone-950 overflow-hidden">
                        <img
                          src={event.image || '/src/assets/images/skopje_nightlife_vinyl_1792169587307.jpg'}
                          alt={event.title.mk}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 opacity-90"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.startTime ? `${event.startTime} ч.` : t('Времето не е наведено', 'Time not listed')}</span>
                        </div>

                        <div className="absolute top-2.5 right-2.5 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                          {getEventPriceLabel(event, t)}
                        </div>

                        {event.theme && (
                          <div className="absolute bottom-2.5 left-2.5 bg-blue-950/80 text-blue-200 text-[10px] px-2 py-0.5 rounded font-mono">
                            {event.theme}
                          </div>
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span className="font-mono">{venue?.neighborhood || 'Скопје'}</span>
                          <VerificationBadge status={event.verificationStatus} />
                        </div>

                        <h3 className="text-sm font-serif font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {t(event.title.mk, event.title.en)}
                        </h3>

                        <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                          {t(event.description.mk, event.description.en)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between text-xs border-t border-stone-800/80 mt-2">
                      <span className="text-stone-400 font-mono text-[11px]">
                        {t(event.venueName.mk, event.venueName.en)}
                      </span>
                      <button
                        onClick={() => navigate('vecerva')}
                        className="text-amber-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>{t('Детали', 'Details')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Callout Bar */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-800 text-xs text-stone-400 font-mono">
            <span>● {t('Вклучува скриени локали, живи свирки и маалски пабови', 'Includes hidden bars, live gigs, and neighborhood pubs')}</span>
            <button
              onClick={() => navigate('vecerva')}
              className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              {t('Отвори го целосниот модул „Вечерва“ →', 'Open complete "Tonight" module →')}
            </button>
          </div>
        </div>
      </section>

      {/* Curated 3-Tier Discovery Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-stone-600 font-medium">
              {t('АКТУЕЛНО ВО СКОПЈЕ', 'CURRENT IN SKOPJE')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {t('Избрани изложби и скриени бисери', 'Featured Exhibitions & Hidden Gems')}
            </h2>
          </div>
          <button
            onClick={() => navigate('discover')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>{t('Види ги сите настани и галерии', 'Browse All Venues & Events')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Featured Event (Matches generated poster!) */}
          <div className="group rounded-lg border border-stone-200 bg-white overflow-hidden flex flex-col transition-all hover:border-stone-400">
            <div className="relative h-48 bg-stone-100 overflow-hidden">
              <img
                src={featuredEvent.image || '/src/assets/images/poster_art_exhibition_1792095894931.jpg'}
                alt={featuredEvent.title.mk}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded font-mono">
                {getEventPriceLabel(featuredEvent, t)}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-600 mb-1 font-medium">
                  <span>{t(featuredEvent.venueName.mk, featuredEvent.venueName.en)}</span>
                  <span aria-hidden="true">·</span>
                  <VerificationBadge status={featuredEvent.verificationStatus} />
                </div>
                <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-blue-900 transition-colors">
                  {t(featuredEvent.title.mk, featuredEvent.title.en)}
                </h3>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                  {t(featuredEvent.description.mk, featuredEvent.description.en)}
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="font-mono">
                  {featuredEvent.date} · {featuredEvent.startTime
                    ? `${featuredEvent.startTime} ч.`
                    : t('Времето не е наведено', 'Time not listed')}
                </span>
                <button
                  onClick={() => navigate('otkrij')}
                  className="font-semibold text-blue-900 hover:underline cursor-pointer"
                >
                  {t('Додај во рута →', 'Add to Quest →')}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Hidden Culture Spotlight (Prima Center Debar Maalo) */}
          <div className="group rounded-lg border border-stone-200 bg-white overflow-hidden flex flex-col transition-all hover:border-stone-400">
            <div className="relative h-48 bg-stone-100 overflow-hidden">
              <img
                src="/src/assets/images/hidden_gallery_space_1792095895430.jpg"
                alt="Prima Center Gallery"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-amber-900/85 text-white text-[11px] px-2 py-0.5 rounded font-mono">
                {t('Скриена Култура', 'Hidden Culture')}
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-600 mb-1 font-medium">
                  <span>Дебар Маало</span>
                  <span aria-hidden="true">·</span>
                  <span>{t('Слободен влез', 'Free Entry')}</span>
                </div>
                <h3 className="text-base font-serif font-bold text-stone-900 group-hover:text-blue-900 transition-colors">
                  {t('Галерија „Прима Центар“', 'Prima Center Gallery')}
                </h3>
                <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                  {t(
                    'Интимна маалска галерија за графички листови и авто-изданија скриена на тивко скалиште во Дебар Маало.',
                    'Intimate residential gallery for printmaking editions and artist books tucked in quiet Debar Maalo.'
                  )}
                </p>
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="font-mono">{t('Среда - Сабота 16:00', 'Wed - Sat 16:00')}</span>
                <button
                  onClick={() => navigate('hidden-culture')}
                  className="font-semibold text-blue-900 hover:underline cursor-pointer"
                >
                  {t('Истражи простор →', 'Explore Space →')}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Interactive Mission of the Day */}
          <div className="group rounded-lg border border-stone-200 bg-[#FAF7F0] overflow-hidden flex flex-col justify-between p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-amber-800 font-bold tracking-wider uppercase">
                  {t('МИСИЈА НА ДЕНОТ', 'QUEST OF THE DAY')}
                </span>
                <span className="font-mono text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-semibold">
                  +{featuredQuest.points} XP
                </span>
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                {t(featuredQuest.title.mk, featuredQuest.title.en)}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t(featuredQuest.description.mk, featuredQuest.description.en)}
              </p>
              <div className="text-xs text-stone-500 font-serif italic pt-1">
                {t('Локација: Музеј на современа уметност на Кале', 'Venue: MoCA on Kale Hill')}
              </div>
            </div>

            <div className="pt-6 border-t border-stone-300 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">
                {t('Достапно и дигитално', 'Available online')}
              </span>
              <button
                onClick={() => navigate('quests')}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded cursor-pointer transition-colors"
              >
                {t('Реши мисија', 'Start Mission')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Static Cultural Map of Skopje Section (Zero API required) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold">
              <Layers className="w-3.5 h-3.5 text-blue-900" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
              {t('Културна карта на Скопје', 'Static Cultural Map of Skopje')}
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              {t(
                'Комплетна векторска мапа на сите 22 културни институции, галерии и вечерни простори по должината на реката Вардар.',
                'Complete offline-ready vector topography of all 22 cultural venues and nightlife spots along the Vardar river.'
              )}
            </p>
          </div>
          <button
            onClick={() => navigate('map')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>{t('Отвори ја мапата во цел екран', 'Open Fullscreen Map')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <StaticSkopjeMap
          venues={venues}
          heightClass="h-[460px]"
          showFilters={true}
          onSelectVenue={() => navigate('map')}
        />
      </section>

      {/* Scan & Poster Hook Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1C1917] text-white rounded-xl p-8 sm:p-10 border border-stone-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-widest">
                <Camera className="w-3.5 h-3.5" />
                <span>{t('ПОСТЕР ВО КУЛТУРЕН НАСТАН', 'POSTER-TO-EVENT AI & OCR')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                {t(
                  'Виде уметнички постер на улица? Фотографирај го.',
                  'Spotted a cultural event poster? Scan & transform it.'
                )}
              </h2>
              <p className="text-stone-300 text-sm max-w-xl leading-relaxed">
                {t(
                  'Нашата OCR и визуелна технологија автоматски ги извлекува датумот, времето, локацијата и цената. Можеш веднаш да ги уредиш деталите и да изградиш авантура околу него.',
                  'Our vision and OCR engine extracts titles, dates, venues, and ticket prices in seconds with editable verification fields.'
                )}
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                onClick={() => navigate('scan')}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-sm rounded-lg transition-colors cursor-pointer shadow-md"
              >
                {t('Пробај со демо постер', 'Try Demo Poster Scan')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
