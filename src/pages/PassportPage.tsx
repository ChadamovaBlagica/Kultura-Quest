import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { getEventPriceLabel, hasConfirmedEventPrice } from '../utils/eventUtils';
import {
  Award,
  Compass,
  MapPin,
  Bookmark,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Footprints,
  BookOpen,
} from 'lucide-react';

interface PassportPageProps {
  navigate: (route: string) => void;
}

export const PassportPage: React.FC<PassportPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const {
    passport,
    savedAdventures,
    events,
    quests,
    venues,
    removeSavedAdventure,
    removeSavedEvent,
    setActiveItinerary,
  } = useCulturalData();

  const progressPercentage = Math.min(
    100,
    Math.round((passport.xp / passport.nextLevelXp) * 100)
  );

  const savedEventsList = events.filter((e) => passport.savedEventIds.includes(e.id));
  const completedQuestsList = quests.filter((q) => passport.completedQuestIds.includes(q.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-2 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
          <BookOpen className="w-3.5 h-3.5 text-blue-900" />
          <span>{t('ДИГИТАЛЕН КУЛТУРЕН ПАСОШ', 'DIGITAL CULTURAL PASSPORT')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          {t('Твојот личен културен дневник', 'Your Personal Cultural Journal')}
        </h1>
        <p className="text-stone-600 text-sm leading-relaxed">
          {t(
            'Секоја посетена изложба, завршена мисија и зачувана рута се запишуваат овде. Твојот напредок сведочи за активната љубопитност кон културниот живот на Скопје.',
            'Every completed quest, verified location, and saved adventure is recorded in your cultural dossier.'
          )}
        </p>
      </div>

      {/* Passport Book Document Container */}
      <div className="bg-[#FAF7F0] border-2 border-stone-300 rounded-xl p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Passport Top Cover Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 pb-6">
          <div className="space-y-1">
            <div className="text-[11px] font-mono text-stone-600 uppercase font-semibold">
              {t('СТАТУС НА ИСТРАЖУВАЧ', 'EXPLORER RANK')}
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
              <span>{t(passport.level.mk, passport.level.en)}</span>
              <span className="text-xs font-mono bg-blue-900 text-white px-2 py-0.5 rounded">
                Ниво {passport.levelRank}
              </span>
            </div>
          </div>

          <div className="text-right sm:text-right space-y-1">
            <div className="text-[11px] font-mono text-stone-600 uppercase font-semibold">
              {t('ВКУПНО ИСКУСТВО', 'TOTAL EXPERIENCE')}
            </div>
            <div className="text-3xl font-mono font-bold text-blue-900 tabular-nums">
              {passport.xp} <span className="text-base font-normal text-stone-600">XP</span>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-stone-600">
              {t('Напредок кон следно ниво:', 'Progress to next rank:')}
            </span>
            <span className="text-stone-900 font-bold tabular-nums">
              {passport.xp} / {passport.nextLevelXp} XP ({progressPercentage}%)
            </span>
          </div>
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-900 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-300 p-4 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-stone-500 uppercase font-semibold">
              {t('Завршени мисии', 'Quests Completed')}
            </div>
            <div className="text-2xl font-mono font-bold text-stone-900 tabular-nums">
              {passport.completedQuestIds.length}
            </div>
          </div>

          <div className="bg-white border border-stone-300 p-4 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-stone-500 uppercase font-semibold">
              {t('Откриени локации', 'Discovered Venues')}
            </div>
            <div className="text-2xl font-mono font-bold text-stone-900 tabular-nums">
              {passport.discoveredVenueIds.length}
            </div>
          </div>

          <div className="bg-white border border-stone-300 p-4 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-stone-500 uppercase font-semibold">
              {t('Зачувани авантури', 'Saved Quests')}
            </div>
            <div className="text-2xl font-mono font-bold text-stone-900 tabular-nums">
              {savedAdventures.length}
            </div>
          </div>

          <div className="bg-white border border-stone-300 p-4 rounded-lg space-y-1">
            <div className="text-[10px] font-mono text-stone-500 uppercase font-semibold">
              {t('Освоени значки', 'Badges Earned')}
            </div>
            <div className="text-2xl font-mono font-bold text-amber-800 tabular-nums">
              {passport.badges.filter((b) => !!b.earnedAt).length}
            </div>
          </div>
        </div>

        {/* Badges & Achievements Showcase */}
        <div className="space-y-4 pt-4 border-t border-stone-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-stone-900">
              {t('Културни значки и признанија', 'Cultural Badges & Honors')}
            </h3>
            <span className="text-xs font-mono text-stone-600 font-medium">
              {passport.badges.filter((b) => !!b.earnedAt).length} / {passport.badges.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {passport.badges.map((badge) => {
              const isEarned = !!badge.earnedAt;

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-lg border transition-all flex items-start gap-3 ${
                    isEarned
                      ? 'bg-white border-amber-300 shadow-xs'
                      : 'bg-stone-100/50 border-stone-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isEarned ? 'bg-amber-100 text-amber-900' : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-bold text-stone-900">
                      {t(badge.title.mk, badge.title.en)}
                    </div>
                    <div className="text-[11px] text-stone-600 leading-snug">
                      {t(badge.description.mk, badge.description.en)}
                    </div>
                    {isEarned && (
                      <div className="text-[10px] font-mono text-emerald-800 font-semibold pt-1">
                        {t('Освоено', 'Unlocked')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saved Adventures Section */}
        <div className="space-y-4 pt-6 border-t border-stone-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-stone-900">
              {t('Зачувани авантури (OTKRIJ патеки)', 'Saved Adventures')}
            </h3>
            {savedAdventures.length > 0 && (
              <span className="text-xs font-mono text-stone-600 font-medium">
                {savedAdventures.length} {t('патеки', 'routes')}
              </span>
            )}
          </div>

          {savedAdventures.length === 0 ? (
            <div className="bg-white p-6 rounded-lg border border-dashed border-stone-300 text-center space-y-3">
              <Compass className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-600">
                {t(
                  'Сѐ уште немаш зачувано персонализирана авантура. Отвори го OTKRIJ и зачувај рута.',
                  'No saved adventures yet. Launch OTKRIJ to build and save a quest.'
                )}
              </p>
              <button
                onClick={() => navigate('otkrij')}
                className="px-4 py-2 bg-blue-900 text-white text-xs font-medium rounded hover:bg-blue-800 transition-colors cursor-pointer"
              >
                {t('Отвори OTKRIJ планер', 'Launch OTKRIJ')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAdventures.map((itinerary) => (
                <div
                  key={itinerary.id}
                  className="bg-white p-4 rounded-lg border border-stone-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-serif font-bold text-stone-900">
                      {t(itinerary.title.mk, itinerary.title.en)}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500">
                      <span>{itinerary.stops.length} {t('станици', 'stops')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{itinerary.totalMinutes} {t('мин.', 'min.')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-800 font-semibold">{itinerary.totalCostMKD} МКД</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setActiveItinerary(itinerary);
                        navigate('otkrij');
                      }}
                      className="px-3 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded hover:bg-blue-800 cursor-pointer"
                    >
                      {t('Отвори патека', 'Open Route')}
                    </button>
                    <button
                      onClick={() => removeSavedAdventure(itinerary.id)}
                      className="px-3 py-1.5 border border-stone-300 text-stone-600 hover:text-stone-900 text-xs rounded cursor-pointer"
                    >
                      {t('Отстрани', 'Remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Events & Evening Experiences */}
        <div className="space-y-4 pt-6 border-t border-stone-300">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-stone-900">
              {t('Зачувани настани & вечерни планови', 'Saved Events & Nightlife')}
            </h3>
            {savedEventsList.length > 0 && (
              <span className="text-xs font-mono text-stone-600 font-medium">
                {savedEventsList.length} {t('настани', 'events')}
              </span>
            )}
          </div>

          {savedEventsList.length === 0 ? (
            <div className="bg-white p-6 rounded-lg border border-dashed border-stone-300 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-xs text-stone-600">
                {t(
                  'Сѐ уште немаш зачувано настани или вечерни забави. Истражи го каталогот или делот „Вечерва“.',
                  'No saved events yet. Browse Discover or check Tonight.'
                )}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => navigate('vecerva')}
                  className="px-4 py-2 bg-amber-400 text-stone-950 font-bold text-xs rounded hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  {t('Истражи вечерва', 'Explore Tonight')}
                </button>
                <button
                  onClick={() => navigate('discover')}
                  className="px-4 py-2 bg-blue-900 text-white font-medium text-xs rounded hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  {t('Сите настани', 'All Events')}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedEventsList.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-4 rounded-lg border border-stone-300 flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-800 font-bold">
                        {event.date} · {event.startTime
                          ? `${event.startTime} ч.`
                          : t('Времето не е наведено', 'Time not listed')}
                      </span>
                      <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-semibold">
                        {getEventPriceLabel(event, t)}
                      </span>
                    </div>

                    <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                      {t(event.title.mk, event.title.en)}
                    </h4>

                    <div className="text-xs text-stone-600 flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{t(event.venueName.mk, event.venueName.en)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <button
                      onClick={() =>
                        event.category === 'nightlife' ||
                        event.category === 'theme_night' ||
                        event.category === 'festival'
                          ? navigate('vecerva')
                          : navigate('discover')
                      }
                      className="text-blue-900 font-semibold hover:underline cursor-pointer"
                    >
                      {t('Отвори детали →', 'View Details →')}
                    </button>
                    <button
                      onClick={() => removeSavedEvent(event.id)}
                      className="text-stone-500 hover:text-red-700 cursor-pointer"
                    >
                      {t('Отстрани', 'Remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Quests Archive */}
        {completedQuestsList.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-stone-300">
            <h3 className="text-sm font-serif font-bold text-stone-900">
              {t('Историја на завршени мисии', 'Completed Quests Archive')}
            </h3>
            <div className="space-y-2">
              {completedQuestsList.map((q) => (
                <div
                  key={q.id}
                  className="bg-white p-3 rounded border border-stone-200 flex items-center justify-between text-xs"
                >
                  <div className="font-medium text-stone-900">
                    {t(q.title.mk, q.title.en)}
                  </div>
                  <span className="font-mono text-emerald-800 font-semibold">
                    +{q.points} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
