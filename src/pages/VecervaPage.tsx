import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { CulturalEvent, AdventureItinerary, AdventureStop } from '../types';
import {
  getEventPriceLabel,
  getNightDateRange,
  hasConfirmedEventPrice,
  isNightlifeEvent,
} from '../utils/eventUtils';
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Coins,
  Ticket,
  ExternalLink,
  Bookmark,
  Check,
  Music,
  Wine,
  Users,
  Compass,
  Filter,
  Plus,
  ArrowRight,
  HelpCircle,
  Flame,
  Moon,
  Volume2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Trash2,
  Footprints,
  X,
  Share2,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { StaticSkopjeMap } from '../components/StaticSkopjeMap';

interface VecervaPageProps {
  navigate: (route: string) => void;
}

export const VecervaPage: React.FC<VecervaPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const dateRange = getNightDateRange();
  const {
    getUpcomingEvents,
    passport,
    saveEvent,
    removeSavedEvent,
    saveAdventure,
    setActiveItinerary,
    venues,
  } = useCulturalData();

  // Active filters
  const [dateFilter, setDateFilter] = useState<'tonight' | 'tomorrow' | 'weekend' | 'all'>('tonight');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState<number | 'free' | 'all'>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive "Plan My Night" modal/panel state
  const [plannerOpen, setPlannerOpen] = useState<boolean>(false);
  const [planMood, setPlanMood] = useState<string>('party');
  const [planBudget, setPlanBudget] = useState<number>(300);
  const [planDate, setPlanDate] = useState<'tonight' | 'tomorrow' | 'weekend' | 'custom'>('tonight');
  const [planCustomDate, setPlanCustomDate] = useState<string>(() => dateRange.today);
  const [planCompany, setPlanCompany] = useState<'friends' | 'date' | 'solo'>('friends');
  const [planNeighborhood, setPlanNeighborhood] = useState<string>('all');
  const [planEventType, setPlanEventType] = useState<string>('all');
  const [planTimeSlot, setPlanTimeSlot] = useState<'early' | 'late' | 'all_night'>('all_night');
  const [generatedNightPlan, setGeneratedNightPlan] = useState<AdventureItinerary | null>(null);
  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<CulturalEvent | null>(null);
  const [eventShareToast, setEventShareToast] = useState<boolean>(false);
  const [showModalStaticMap, setShowModalStaticMap] = useState<boolean>(false);

  const { today: TODAY, tomorrow: TOMORROW, weekend: WEEKEND } = dateRange;

  // Get only unexpired upcoming events
  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(false);
  }, [getUpcomingEvents]);

  // Filter nightlife / theme night events
  const nightlifeEvents = useMemo(() => {
    return upcomingEvents.filter(isNightlifeEvent);
  }, [upcomingEvents]);

  // Filter based on active controls
  const filteredEvents = useMemo(() => {
    return nightlifeEvents.filter((ev) => {
      // Date filter
      if (dateFilter === 'tonight' && ev.date !== TODAY) return false;
      if (dateFilter === 'tomorrow' && ev.date !== TOMORROW) return false;
      if (dateFilter === 'weekend' && !WEEKEND.includes(ev.date)) return false;

      // Theme collections filter
      if (selectedCollection === 'throwback' && ev.theme !== '80s / 90s / 2000s') return false;
      if (selectedCollection === 'latin' && ev.theme !== 'Latin Nights') return false;
      if (selectedCollection === 'quiz' && ev.theme !== 'Quiz & Trivia Nights') return false;
      if (selectedCollection === 'jazz' && ev.theme !== 'Jazz & Acoustic') return false;
      if (selectedCollection === 'techno' && ev.theme !== 'Electronic & Techno') return false;
      if (selectedCollection === 'rock' && ev.theme !== 'Rock & Alternative') return false;
      if (selectedCollection === 'karaoke' && ev.theme !== 'Karaoke Nights') return false;
      if (selectedCollection === 'live_music' && ev.theme !== 'Live Music') return false;
      if (selectedCollection === 'club_dj' && ev.theme !== 'Club & DJ') return false;
      if (selectedCollection === 'festival' && ev.category !== 'festival') return false;
      if (
        selectedCollection === 'affordable' &&
        (!hasConfirmedEventPrice(ev) || ev.priceMKD > 150)
      ) return false;

      // Budget filter
      if (maxBudget === 'free' && (!hasConfirmedEventPrice(ev) || ev.priceMKD !== 0)) return false;
      if (
        typeof maxBudget === 'number' &&
        (!hasConfirmedEventPrice(ev) || ev.priceMKD > maxBudget)
      ) return false;

      // Neighborhood filter
      if (selectedNeighborhood !== 'all') {
        const venue = venues.find((v) => v.id === ev.venueId);
        if (!venue || venue.neighborhood !== selectedNeighborhood) return false;
      }

      // Verified only
      if (verifiedOnly && ev.verificationStatus !== 'verified_official') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle =
          ev.title.mk.toLowerCase().includes(q) || ev.title.en.toLowerCase().includes(q);
        const matchesTheme = ev.theme?.toLowerCase().includes(q);
        const matchesVenue =
          ev.venueName.mk.toLowerCase().includes(q) || ev.venueName.en.toLowerCase().includes(q);
        const matchesGenre = ev.musicGenres?.some((g) => g.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTheme && !matchesVenue && !matchesGenre) return false;
      }

      return true;
    });
  }, [
    nightlifeEvents,
    dateFilter,
    selectedCollection,
    maxBudget,
    selectedNeighborhood,
    verifiedOnly,
    searchQuery,
    venues,
    WEEKEND,
  ]);

  // Curated theme buttons
  const themeCollections = [
    { id: 'all', labelMK: 'Сите вечерни настани', labelEN: 'All Night Events' },
    { id: 'throwback', labelMK: '80s, 90s & 2000s Ретро', labelEN: '80s, 90s & 2000s' },
    { id: 'latin', labelMK: 'Латино & Салса', labelEN: 'Latin & Salsa' },
    { id: 'quiz', labelMK: 'Паб квизови & Игри', labelEN: 'Pub Quizzes & Trivia' },
    { id: 'jazz', labelMK: 'Жив џез & Акустика', labelEN: 'Live Jazz & Acoustic' },
    { id: 'techno', labelMK: 'Електроника & Техно', labelEN: 'Electronic & Techno' },
    { id: 'rock', labelMK: 'Инди & Алтернативен рок', labelEN: 'Indie & Alt Rock' },
    { id: 'karaoke', labelMK: 'Караоке вечери', labelEN: 'Karaoke Nights' },
    { id: 'live_music', labelMK: 'Жива музика', labelEN: 'Live Music' },
    { id: 'club_dj', labelMK: 'Клубови & DJ', labelEN: 'Clubs & DJs' },
    { id: 'festival', labelMK: 'Фестивали', labelEN: 'Festivals' },
    { id: 'affordable', labelMK: 'Бесплатно / до 150 МКД', labelEN: 'Under 150 MKD / Free' },
  ];

  // Quick Curated Spots count
  const tonightCount = nightlifeEvents.filter((e) => e.date === TODAY).length;
  const tomorrowCount = nightlifeEvents.filter((e) => e.date === TOMORROW).length;
  const weekendCount = nightlifeEvents.filter((e) => WEEKEND.includes(e.date)).length;

  // Generate Interactive "Plan My Night" (Strict Single-Option Architecture)
  const handleGenerateNightPlan = () => {
    let targetDate = TODAY;
    if (planDate === 'tomorrow') targetDate = TOMORROW;
    else if (planDate === 'weekend') targetDate = WEEKEND[0] || TODAY;
    else if (planDate === 'custom') targetDate = planCustomDate || TODAY;

    // Filter candidates by date & budget
    const dateCandidates = nightlifeEvents.filter((e) => {
      if (planDate === 'weekend') {
        return WEEKEND.includes(e.date) &&
          (planBudget >= 500 || (hasConfirmedEventPrice(e) && e.priceMKD <= planBudget));
      }
      return e.date === targetDate &&
        (planBudget >= 500 || (hasConfirmedEventPrice(e) && e.priceMKD <= planBudget));
    });

    const pool = dateCandidates.length > 0 ? dateCandidates : nightlifeEvents;

    // Multi-factor scoring
    const scored = pool.map((event) => {
      let score = 0;
      const venue = venues.find((v) => v.id === event.venueId);

      // Mood match
      if (planMood === 'party' || planMood === 'dance') {
        if (event.theme?.includes('80s') || event.theme?.includes('Electronic') || event.theme?.includes('Latin')) score += 6;
      } else if (planMood === 'chill' || planMood === 'date') {
        if (event.theme?.includes('Jazz') || event.theme?.includes('Acoustic') || event.theme?.includes('Cinema') || event.theme?.includes('Comedy')) score += 6;
      } else if (planMood === 'trivia' || planMood === 'competitive') {
        if (event.theme?.includes('Quiz') || event.theme?.includes('Trivia')) score += 8;
      } else if (planMood === 'music') {
        if (event.theme?.includes('Jazz') || event.theme?.includes('Rock') || event.theme?.includes('Electronic')) score += 6;
      } else if (planMood === 'comedy') {
        if (event.theme?.includes('Comedy')) score += 8;
      } else if (planMood === 'artsy') {
        if (event.category === 'independent_space' || event.theme?.includes('Cinema') || event.theme?.includes('80s')) score += 6;
      } else if (planMood === 'student') {
        if (hasConfirmedEventPrice(event) && event.priceMKD <= 150) score += 7;
      } else if (planMood === 'unusual') {
        if (event.venueId === 'la_kaña_carsija' || event.venueId === 'shortbus_cultural_hub' || event.venueId === 'jadro_cultural_centre') score += 7;
      }

      // Event Type match
      if (planEventType === 'theme_parties' && event.theme?.includes('80s')) score += 6;
      if (planEventType === 'clubs_dj' && event.theme?.includes('Electronic')) score += 6;
      if (planEventType === 'live_music' && (event.theme?.includes('Jazz') || event.theme?.includes('Rock'))) score += 6;
      if (planEventType === 'karaoke' && event.theme?.includes('Karaoke')) score += 8;
      if (planEventType === 'pub_quiz' && event.theme?.includes('Quiz')) score += 8;
      if (planEventType === 'latin_dance' && event.theme?.includes('Latin')) score += 8;
      if (planEventType === 'comedy' && event.theme?.includes('Comedy')) score += 8;

      // Neighborhood match
      if (planNeighborhood !== 'all' && venue && venue.neighborhood === planNeighborhood) {
        score += 9;
      }

      // Random jitter for diverse re-rolls
      score += Math.random() * 2.5;

      return { event, score, venue };
    });

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0] || { event: pool[0], venue: venues[0] };
    const primaryEvent = chosen.event;
    const matchingVenue = chosen.venue || venues.find((v) => v.id === primaryEvent.venueId);

    if (!matchingVenue) {
      const isCostUnknown = !hasConfirmedEventPrice(primaryEvent);
      const eventStop: AdventureStop = {
        id: `main_${Date.now()}`,
        venueId: primaryEvent.venueId,
        venueName: primaryEvent.venueName,
        stopTitle: {
          mk: primaryEvent.title.mk,
          en: primaryEvent.title.en,
        },
        description: {
          mk: `${primaryEvent.description.mk} (Организатор: ${primaryEvent.organizer}). ${
            isCostUnknown
              ? `Наведена е непотврдена проценка од околу ${primaryEvent.priceMKD} МКД за влез.`
              : `Влез: ${primaryEvent.priceMKD === 0 ? 'бесплатен' : `${primaryEvent.priceMKD} МКД`}.`
          }`,
          en: `${primaryEvent.description.en} (Organizer: ${primaryEvent.organizer}). ${
            isCostUnknown
              ? `The listed entry estimate is approximately ${primaryEvent.priceMKD} MKD and is unconfirmed.`
              : `Entry: ${primaryEvent.priceMKD === 0 ? 'free' : `${primaryEvent.priceMKD} MKD`}.`
          }`,
        },
        estimatedMinutes: 0,
        costMKD: isCostUnknown ? 0 : primaryEvent.priceMKD,
        isCostUnknown,
        suggestedArrival: primaryEvent.startTime,
        eventStartTime: primaryEvent.startTime,
        address: primaryEvent.venueName.mk,
        verificationStatus: primaryEvent.verificationStatus,
        ticketUrl: primaryEvent.ticketUrl || primaryEvent.reservationUrl,
      };
      const eventPlan: AdventureItinerary = {
        id: `night_plan_${Date.now()}`,
        title: {
          mk: `Вечерен план: ${primaryEvent.title.mk}`,
          en: `Evening Plan: ${primaryEvent.title.en}`,
        },
        mode: 'evening_quest',
        personalizedExplanation: {
          mk: 'Планот го содржи настанот од архивата. Не се дадени проверени координати за ова место, затоа не се додаваат измислени попатни локации.',
          en: 'This plan includes the listed event only. Verified coordinates were not provided for this venue, so no extra stops have been invented.',
        },
        totalMinutes: 0,
        totalCostMKD: eventStop.costMKD,
        hasUnknownCost: isCostUnknown,
        stops: [eventStop],
        sourceLinks: primaryEvent.sourceUrl
          ? [{ name: primaryEvent.organizer, url: primaryEvent.sourceUrl }]
          : [],
        verificationStatus: primaryEvent.verificationStatus,
        createdAt: new Date().toISOString(),
      };
      setGeneratedNightPlan(eventPlan);
      setActiveItinerary(eventPlan);
      setIsPlanSaved(false);
      return;
    }

    // Build 3 Stops: Warmup + Main Event + Late-Night Wrap-Up
    let warmupVenue = venues[1];
    if (matchingVenue.neighborhood === 'Стара Чаршија') {
      warmupVenue = venues.find((v) => v.id === 'chifte_hamam') || venues.find((v) => v.id === 'menada_old_bazaar') || venues[1];
    } else if (matchingVenue.neighborhood === 'Дебар Маало') {
      warmupVenue = venues.find((v) => v.id === 'galerija_prima_centar') || venues.find((v) => v.id === 'jadro_cultural_centre') || venues[4];
    } else {
      warmupVenue = venues.find((v) => v.id === 'kotur_cinema_cafe') || venues.find((v) => v.id === 'kino_kultura') || venues[2];
    }

    const warmupArrival = planTimeSlot === 'late' ? '20:15' : '18:45';
    const warmupStop: AdventureStop = {
      id: `warmup_${Date.now()}`,
      venueId: warmupVenue.id,
      venueName: warmupVenue.name,
      stopTitle: {
        mk: `1. Културно загревање: Разглед и аперитив во ${warmupVenue.neighborhood}`,
        en: `1. Cultural Warmup: Art & evening drink in ${warmupVenue.neighborhood}`,
      },
      description: {
        mk: `Започни ја вечерта релаксирано со посета на ${warmupVenue.name.mk} пред главната музичка програма.`,
        en: `Start your evening on an inspiring note with a cultural stop at ${warmupVenue.name.en} before the main event.`,
      },
      estimatedMinutes: 50,
      costMKD: warmupVenue.admissionPriceMKD,
      suggestedArrival: warmupArrival,
      address: warmupVenue.address,
      coordinates: warmupVenue.coordinates,
      verificationStatus: warmupVenue.verificationStatus,
    };

    const mainStop: AdventureStop = {
      id: `main_${Date.now()}`,
      venueId: primaryEvent.venueId,
      venueName: primaryEvent.venueName,
      stopTitle: {
        mk: `2. Главен настан: ${primaryEvent.title.mk}`,
        en: `2. Main Night Event: ${primaryEvent.title.en}`,
      },
      description: {
        mk: `${primaryEvent.description.mk} (Организатор: ${primaryEvent.organizer}). Влез: ${
          !hasConfirmedEventPrice(primaryEvent)
            ? `наведена е непотврдена проценка од околу ${primaryEvent.priceMKD} МКД`
            : primaryEvent.priceMKD === 0
              ? 'бесплатен'
              : `${primaryEvent.priceMKD} МКД`
        }.`,
        en: `${primaryEvent.description.en} (Organizer: ${primaryEvent.organizer}). Entry: ${
          !hasConfirmedEventPrice(primaryEvent)
            ? `listed estimate approx. ${primaryEvent.priceMKD} MKD, unconfirmed`
            : primaryEvent.priceMKD === 0
              ? 'free'
              : `${primaryEvent.priceMKD} MKD`
        }.`,
      },
      estimatedMinutes: planTimeSlot === 'early' ? 120 : 160,
      costMKD: hasConfirmedEventPrice(primaryEvent) ? primaryEvent.priceMKD : 0,
      isCostUnknown: !hasConfirmedEventPrice(primaryEvent),
      suggestedArrival: primaryEvent.startTime,
      eventStartTime: primaryEvent.startTime,
      address: matchingVenue ? matchingVenue.address : 'Скопје',
      coordinates: matchingVenue ? matchingVenue.coordinates : [42.0008, 21.4368],
      verificationStatus: primaryEvent.verificationStatus,
      ticketUrl: primaryEvent.ticketUrl || primaryEvent.reservationUrl,
    };

    let wrapupTitleMK = '';
    let wrapupTitleEN = '';
    let wrapupDescMK = '';
    let wrapupDescEN = '';

    if (matchingVenue.neighborhood === 'Стара Чаршија') {
      wrapupTitleMK = '3. Ноќно заокружување: Чаршиски чај & слаткарница Охрид';
      wrapupTitleEN = '3. Nightcap Wrap-up: Bazaar Mint Tea & Heritage Confectionery';
      wrapupDescMK = 'Опуштен дебрифинг на калдрмата под фенерите со автентичен турски чај и топол разговор под ѕвездите.';
      wrapupDescEN = 'Wind down along cobblestone alleys under lanterns with authentic mint tea and sweet local pastry.';
    } else if (matchingVenue.neighborhood === 'Дебар Маало') {
      wrapupTitleMK = '3. Ноќно заокружување: Дебармаалски топол муабет & ноќен скопски симит';
      wrapupTitleEN = '3. Nightcap Wrap-up: Debar Maalo Late Night Bites & Craft Brew';
      wrapupDescMK = 'Заврши ја вечерта во култната маалска фурна на симит/бурек или тивок разговор со пријателите на отворена тераса.';
      wrapupDescEN = 'Wrap up your night with a local Skopje savory bite or a calm midnight chat on a cozy terrace.';
    } else {
      wrapupTitleMK = '3. Ноќно заокружување: Прошетка по Кејот на Вардар и Камени Мост';
      wrapupTitleEN = '3. Nightcap Wrap-up: Vardar Riverfront Stroll & Stone Bridge View';
      wrapupDescMK = 'Пешачка релаксација покрај реката со панорамски поглед на осветленото Скопско Кале.';
      wrapupDescEN = 'Soothing riverside stroll across the illuminated Stone Bridge admiring Skopje Kale fortress.';
    }

    const wrapupStop: AdventureStop = {
      id: `wrapup_${Date.now()}`,
      venueId: matchingVenue.id,
      venueName: {
        mk: `${matchingVenue.neighborhood} (Ноќна зона)`,
        en: `${matchingVenue.neighborhood} (Night Zone)`,
      },
      stopTitle: {
        mk: wrapupTitleMK,
        en: wrapupTitleEN,
      },
      description: {
        mk: wrapupDescMK,
        en: wrapupDescEN,
      },
      estimatedMinutes: 45,
      costMKD: 0,
      suggestedArrival: '23:45',
      address: matchingVenue.address,
      coordinates: matchingVenue.coordinates,
      verificationStatus: 'verified_official',
    };

    const totalCost = warmupStop.costMKD + mainStop.costMKD + wrapupStop.costMKD;
    const totalMinutes = warmupStop.estimatedMinutes + mainStop.estimatedMinutes + wrapupStop.estimatedMinutes;

    const singlePlan: AdventureItinerary = {
      id: `night_plan_${Date.now()}`,
      title: {
        mk: `Вечерен план: ${primaryEvent.title.mk}`,
        en: `Evening Plan: ${primaryEvent.title.en}`,
      },
      mode: 'evening_quest',
      personalizedExplanation: {
        mk: `Создадовме дефинитивна три-етапна вечерна рута за ${planCompany === 'friends' ? 'екипа' : planCompany === 'date' ? 'дејт за двајца' : 'соло истражувач'} според твојот буџет од ${planBudget} МКД во ${matchingVenue.neighborhood}. Патеката опфаќа загревање, главен настан и опуштен ноќен дебрифинг со 8-12 мин. пешачење помеѓу локациите.`,
        en: `Crafted a definitive 3-stage evening itinerary for ${planCompany === 'friends' ? 'friends' : planCompany === 'date' ? 'date night' : 'solo exploring'} for your ${planBudget} MKD budget in ${matchingVenue.neighborhood}. Bridges warmup art, main night thrills, and a relaxed nightcap with 8-12 min walkable connections.`,
      },
      totalMinutes,
      totalCostMKD: totalCost,
      hasUnknownCost: !primaryEvent.isPriceConfirmed,
      stops: [warmupStop, mainStop, wrapupStop],
      sourceLinks: [
        ...(primaryEvent.sourceUrl
          ? [{ name: primaryEvent.organizer, url: primaryEvent.sourceUrl }]
          : []),
        { name: warmupVenue.name.mk, url: warmupVenue.sourceUrl },
      ],
      verificationStatus: primaryEvent.verificationStatus,
      createdAt: new Date().toISOString(),
    };

    setGeneratedNightPlan(singlePlan);
    setActiveItinerary(singlePlan);
    setIsPlanSaved(false);
  };

  const handleSharePlan = () => {
    if (!generatedNightPlan) return;
    const text = `KULTURA QUEST: ${generatedNightPlan.title.mk}\n${generatedNightPlan.personalizedExplanation.mk}\nВреме: ${
      generatedNightPlan.totalMinutes ? `~${generatedNightPlan.totalMinutes} мин.` : 'не е наведено'
    } | Буџет: ${generatedNightPlan.totalCostMKD} МКД${
      generatedNightPlan.hasUnknownCost ? ' + цена непотврдена' : ''
    }\nСтаници:\n${generatedNightPlan.stops
      .map((s, idx) => `${idx + 1}. ${s.stopTitle.mk}${s.suggestedArrival ? ` (${s.suggestedArrival} ч.)` : ''} - ${
        s.isCostUnknown ? 'цена непотврдена' : s.costMKD === 0 ? 'Бесплатно' : `${s.costMKD} МКД`
      }`)
      .join('\n')}\nОткриј повеќе на KULTURA QUEST!`;
    navigator.clipboard.writeText(text);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3500);
  };

  const handleSaveNightPlan = () => {
    if (generatedNightPlan) {
      saveAdventure(generatedNightPlan);
      setIsPlanSaved(true);
    }
  };

  // Reorder stops inside plan
  const handleMoveStop = (fromIndex: number, toIndex: number) => {
    if (!generatedNightPlan) return;
    const newStops = [...generatedNightPlan.stops];
    const [moved] = newStops.splice(fromIndex, 1);
    newStops.splice(toIndex, 0, moved);

    const updated = {
      ...generatedNightPlan,
      stops: newStops,
    };
    setGeneratedNightPlan(updated);
    setActiveItinerary(updated);
  };

  const handleRemoveStop = (stopId: string) => {
    if (!generatedNightPlan) return;
    const newStops = generatedNightPlan.stops.filter((s) => s.id !== stopId);
    const updated = {
      ...generatedNightPlan,
      stops: newStops,
      totalCostMKD: newStops.reduce((sum, s) => sum + s.costMKD, 0),
      totalMinutes: newStops.reduce((sum, s) => sum + s.estimatedMinutes, 0),
      hasUnknownCost: newStops.some((stop) => stop.isCostUnknown),
    };
    setGeneratedNightPlan(updated);
    setActiveItinerary(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Editorial Hero Marquee */}
      <section className="relative rounded-2xl overflow-hidden border border-stone-800 bg-[#141210] text-stone-100 p-8 sm:p-12 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">
              <Moon className="w-4 h-4" />
              <span>{t('СКОПЈЕ ПОСЛЕ 19:00 ЧАСОТ', 'SKOPJE AFTER DARK')}</span>
              <span aria-hidden="true">·</span>
              <span>{t('НОЌЕН ЖИВОТ & ТЕМАТСКИ ВЕЧЕРИ', 'NIGHTLIFE & THEME NIGHTS')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-[1.15]">
              {t('Градот има план за вечерва.', 'The city has plans for tonight.')}
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t(
                'Од тематски забави и DJ сетови до квизови, свирки и скриени места — пронајди вечер што одговара на твојот vibe.',
                'From throwback theme nights and live jazz to pub trivia, vinyl sessions, and hidden courtyard bars — find an evening tailored strictly to your vibe.'
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setDateFilter('tonight');
                  const el = document.getElementById('events-catalog');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs sm:text-sm transition-colors cursor-pointer shadow-md"
              >
                <Flame className="w-4 h-4 text-stone-950" />
                <span>{t('Откриј што се случува вечерва', 'Discover Tonight')}</span>
                <span className="font-mono text-xs opacity-80">({tonightCount})</span>
              </button>

              <button
                onClick={() => setPlannerOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 bg-stone-900/80 hover:bg-stone-800 text-white font-medium rounded-lg text-xs sm:text-sm border border-stone-700 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('Генерирај план за вечерва (AI)', 'Plan My Night')}</span>
              </button>
            </div>

            {/* Freshness & Trust Notice */}
            <div className="pt-3 flex flex-wrap items-center gap-3 text-xs text-stone-400 font-mono">
              <span>● {t('Ажурирано за денес', 'Updated for today')}</span>
              <span aria-hidden="true">·</span>
              <span>{t('Транспарентни цени во МКД', 'Transparent MKD Prices')}</span>
              <span aria-hidden="true">·</span>
              <span>{t('Без истечени настани', 'Zero Expired Events')}</span>
            </div>
          </div>

          {/* Right Image Canvas */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-stone-800 shadow-xl bg-stone-900">
              <img
                src="/src/assets/images/skopje_nightlife_vinyl_1792169587307.jpg"
                alt="Skopje Nightlife Venue"
                className="w-full h-[320px] sm:h-[360px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[11px] font-mono uppercase text-amber-400">
                  {t('ИЗБОР НА ВЕЧЕРТА', 'TONIGHT’S PICK')}
                </span>
                <h4 className="text-base font-serif font-bold text-white">
                  {t('Чаршиски џез во Менада & 80s Винил во МКЦ', 'Bazaar Jazz at Menada & 80s Vinyl at MKC')}
                </h4>
                <p className="text-xs text-stone-300 mt-1 line-clamp-2">
                  {t(
                    'Од бесплатни акустични сесии до синтпоп ретро забави за под 200 МКД.',
                    'From free acoustic sessions to retro throwback parties for under 200 MKD.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Date Switcher Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg overflow-x-auto">
          <button
            onClick={() => setDateFilter('tonight')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              dateFilter === 'tonight'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Вечерва', 'Tonight')} ({tonightCount})
          </button>

          <button
            onClick={() => setDateFilter('tomorrow')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              dateFilter === 'tomorrow'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Утре', 'Tomorrow')} ({tomorrowCount})
          </button>

          <button
            onClick={() => setDateFilter('weekend')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              dateFilter === 'weekend'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Овој викенд', 'This Weekend')} ({weekendCount})
          </button>

          <button
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              dateFilter === 'all'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Сите претстојни', 'All Upcoming')} ({nightlifeEvents.length})
          </button>
        </div>

        <button
          onClick={() => setPlannerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('Отвори планер на вечерта', 'Plan My Night')}</span>
        </button>
      </section>

      {/* Theme Collections & Filters */}
      <section className="space-y-4 bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder={t('Пребарај тематска вечер, жанр, диџеј или локација...', 'Search theme night, genre, DJ, or bar...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50 text-stone-900 focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Budget dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-stone-600 uppercase font-mono">{t('Буџет:', 'Budget:')}</span>
            <select
              value={maxBudget}
              onChange={(e) =>
                setMaxBudget(e.target.value === 'all' ? 'all' : e.target.value === 'free' ? 'free' : Number(e.target.value))
              }
              className="py-1.5 px-2.5 border border-stone-300 rounded-md bg-stone-50 text-stone-800 cursor-pointer"
            >
              <option value="all">{t('Сите цени', 'All budgets')}</option>
              <option value="free">{t('Само бесплатно (0 МКД)', 'Free only')}</option>
              <option value={150}>{t('До 150 МКД', 'Up to 150 MKD')}</option>
              <option value={300}>{t('До 300 МКД', 'Up to 300 MKD')}</option>
              <option value={600}>{t('До 600 МКД', 'Up to 600 MKD')}</option>
            </select>
          </div>

          {/* Neighborhood dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-semibold text-stone-600 uppercase font-mono">{t('Реон:', 'Area:')}</span>
            <select
              value={selectedNeighborhood}
              onChange={(e) => setSelectedNeighborhood(e.target.value)}
              className="py-1.5 px-2.5 border border-stone-300 rounded-md bg-stone-50 text-stone-800 cursor-pointer"
            >
              <option value="all">{t('Сите маала', 'All areas')}</option>
              <option value="Стара Чаршија">{t('Стара Чаршија', 'Old Bazaar')}</option>
              <option value="Дебар Маало">{t('Дебар Маало', 'Debar Maalo')}</option>
              <option value="Центар">{t('Центар & Кеј', 'Center')}</option>
            </select>
          </div>

          {/* Verified toggle */}
          <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer pl-2">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded border-stone-300 text-blue-900 focus:ring-blue-900"
            />
            <span>{t('Само верификувани', 'Verified only')}</span>
          </label>
        </div>

        {/* Theme Collection Pills (Functional buttons) */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
          {themeCollections.map((col) => {
            const isSelected = selectedCollection === col.id;
            return (
              <button
                key={col.id}
                onClick={() => setSelectedCollection(col.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-900 text-white font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {t(col.labelMK, col.labelEN)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Events Catalog Grid */}
      <section id="events-catalog" className="space-y-6">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              {dateFilter === 'tonight'
                ? t('Настани закажани за вечерва', 'Events Scheduled for Tonight')
                : dateFilter === 'tomorrow'
                ? t('Настани закажани за утре', 'Events Scheduled for Tomorrow')
                : dateFilter === 'weekend'
                ? t('Викенд вечерни настани', 'Weekend Nightlife Lineup')
                : t('Сите претстојни вечерни настани', 'All Upcoming Evening Events')}
            </h2>
            <span className="text-xs font-mono text-stone-500">({filteredEvents.length})</span>
          </div>

          <span className="text-xs font-mono text-stone-500">
            {t('Цените се во МКД', 'Prices in MKD')}
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center space-y-4">
            <Moon className="w-10 h-10 text-stone-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-stone-800">
                {t('Нема пронајдено вечерни настани според овие филтри', 'No evening events match your criteria')}
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {t(
                  'Обиди се да ги ресетираш филтрите за буџет или категорија за да ги видиш сите достапни вечерни активности.',
                  'Try resetting your budget or category filters to view other experiences.'
                )}
              </p>
            </div>
            <button
              onClick={() => {
                setDateFilter('all');
                setSelectedCollection('all');
                setMaxBudget('all');
                setSelectedNeighborhood('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 cursor-pointer"
            >
              {t('Ресетирај ги филтрите', 'Reset Filters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isSaved = passport.savedEventIds.includes(event.id);
              const venue = venues.find((v) => v.id === event.venueId);

              const priceDisplay = getEventPriceLabel(event, t);

              return (
                <div
                  key={event.id}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-400 transition-colors flex flex-col justify-between"
                >
                  <div>
                    {/* Event Banner */}
                    <div
                      onClick={() => setSelectedEventDetail(event)}
                      className="relative h-48 bg-stone-100 overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={event.image || '/src/assets/images/skopje_nightlife_vinyl_1792169587307.jpg'}
                        alt={event.title.mk}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {/* Date Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-stone-900/90 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded font-mono font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>
                          {event.date === TODAY
                            ? t('ВЕЧЕРВА', 'TONIGHT')
                            : event.date === TOMORROW
                            ? t('УТРЕ', 'TOMORROW')
                            : event.date}
                        </span>
                      </div>

                      {/* Price Badge */}
                      <div
                        className={`absolute top-2.5 right-2.5 text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          event.priceType === 'unconfirmed'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : event.priceMKD === 0
                            ? 'bg-emerald-900 text-white'
                            : 'bg-stone-900 text-white'
                        }`}
                      >
                        {priceDisplay}
                      </div>

                      {/* Theme Tag */}
                      {event.theme && (
                        <div className="absolute bottom-2.5 left-2.5 bg-black/75 text-amber-300 text-[10px] px-2 py-0.5 rounded font-mono">
                          {event.theme}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-stone-500 uppercase">
                          {venue?.neighborhood || 'Скопје'}
                        </span>
                        <VerificationBadge status={event.verificationStatus} />
                      </div>

                      <h3
                        onClick={() => setSelectedEventDetail(event)}
                        className="text-base font-serif font-bold text-stone-900 leading-snug cursor-pointer hover:text-blue-900 transition-colors"
                      >
                        {t(event.title.mk, event.title.en)}
                      </h3>

                      {/* Time and Venue info */}
                      <div className="space-y-1 text-xs text-stone-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>
                            {event.startTime
                              ? `${event.startTime} ч.`
                              : t('Времето не е наведено', 'Time not listed')}
                            {event.endTime ? ` – ${event.endTime} ч.` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>{t(event.venueName.mk, event.venueName.en)}</span>
                        </div>
                      </div>

                      {/* Music Genres */}
                      {event.musicGenres && event.musicGenres.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {event.musicGenres.map((genre, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded"
                            >
                              #{genre}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {t(event.description.mk, event.description.en)}
                      </p>

                      {/* Why it matches */}
                      {event.matchReason && (
                        <div className="p-2.5 bg-[#FAF7F0] border border-stone-200 rounded text-[11px] text-stone-700 leading-snug">
                          <span className="font-semibold text-stone-900">
                            {t('Зошто одговара: ', 'Why it matches: ')}
                          </span>
                          <span>{t(event.matchReason.mk, event.matchReason.en)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-3 text-xs">
                    <button
                      onClick={() => (isSaved ? removeSavedEvent(event.id) : saveEvent(event.id))}
                      className={`flex items-center gap-1 cursor-pointer font-medium ${
                        isSaved ? 'text-emerald-800' : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{isSaved ? t('Зачувано', 'Saved') : t('Зачувај', 'Save')}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedEventDetail(event)}
                        className="text-stone-700 hover:text-stone-950 underline font-medium cursor-pointer"
                      >
                        {t('Детали', 'Details')}
                      </button>
                      {event.ticketUrl && (
                        <a
                          href={event.ticketUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-stone-600 hover:text-stone-900 underline flex items-center gap-0.5"
                        >
                          <Ticket className="w-3 h-3" />
                          <span>{t('Билети', 'Tickets')}</span>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setPlanDate(event.date === TODAY ? 'tonight' : 'tomorrow');
                          setPlannerOpen(true);
                        }}
                        className="text-blue-900 font-semibold hover:underline cursor-pointer"
                      >
                        {t('Додај во план →', 'Add to Plan →')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* COMPREHENSIVE EVENT DETAIL MODAL */}
      {selectedEventDetail && (() => {
        const event = selectedEventDetail;
        const venue = venues.find((v) => v.id === event.venueId);
        const isSaved = passport.savedEventIds.includes(event.id);
        const relatedEvents = nightlifeEvents
          .filter((e) => e.id !== event.id && (e.theme === event.theme || e.venueId === event.venueId || e.date === event.date))
          .slice(0, 2);

        return (
          <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-stone-300 rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl overflow-hidden flex flex-col">
              {/* Image & Header */}
              <div className="relative h-64 bg-stone-900 shrink-0">
                <img
                  src={event.image || '/src/assets/images/skopje_nightlife_vinyl_1792169587307.jpg'}
                  alt={event.title.mk}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => setSelectedEventDetail(null)}
                  className="absolute top-3 right-3 p-2 bg-stone-900/80 hover:bg-stone-900 text-white rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                  <span className="bg-stone-900/90 text-amber-400 text-xs px-2.5 py-1 rounded font-mono font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {event.date === TODAY
                        ? t('ВЕЧЕРВА', 'TONIGHT')
                        : event.date === TOMORROW
                        ? t('УТРЕ', 'TOMORROW')
                        : event.date}
                    </span>
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded font-mono font-bold ${
                      event.priceType === 'unconfirmed'
                        ? 'bg-amber-100 text-amber-900'
                        : event.priceMKD === 0
                        ? 'bg-emerald-900 text-white'
                        : 'bg-stone-900 text-white'
                    }`}
                  >
                    {getEventPriceLabel(event, t)}
                  </span>
                  {event.ageRestriction && (
                    <span className="bg-black/75 text-stone-200 text-xs px-2 py-1 rounded font-mono">
                      {event.ageRestriction}
                    </span>
                  )}
                  {event.indoorOutdoor && (
                    <span className="bg-black/75 text-stone-300 text-xs px-2 py-1 rounded font-mono">
                      {event.indoorOutdoor === 'indoor'
                        ? t('Затворен простор', 'Indoor')
                        : event.indoorOutdoor === 'outdoor'
                        ? t('Отворен простор', 'Outdoor')
                        : t('Мешан / Двор', 'Courtyard / Terrace')}
                    </span>
                  )}
                </div>

                {event.theme && (
                  <div className="absolute bottom-3 left-3 bg-black/85 text-amber-300 text-xs px-3 py-1 rounded-md font-mono font-semibold">
                    {event.theme}
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-stone-500 uppercase tracking-wider font-semibold">
                      {venue?.neighborhood || 'Скопје'}
                    </span>
                    <VerificationBadge status={event.verificationStatus} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
                    {t(event.title.mk, event.title.en)}
                  </h2>
                </div>

                {/* Key event facts bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                      {t('Време & Траење', 'Time & Schedule')}
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>
                        {event.startTime
                          ? `${event.startTime} ч.`
                          : t('Времето не е наведено', 'Time not listed')}
                        {event.endTime ? ` – ${event.endTime} ч.` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-stone-500 uppercase tracking-wider text-[10px] font-semibold">
                      {t('Локација & Маало', 'Venue & Address')}
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                      <MapPin className="w-4 h-4 text-blue-900" />
                      <span>{t(event.venueName.mk, event.venueName.en)}</span>
                    </div>
                    {venue?.address && (
                      <div className="text-stone-600 text-[11px] pl-5">{venue.address}</div>
                    )}
                    {venue && (
                      <div className="pl-5 pt-1">
                        <button
                          onClick={() => setShowModalStaticMap((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-900 hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          <Layers className="w-3 h-3 text-blue-900" />
                          <span>
                            {showModalStaticMap
                              ? t('Сокриј мапа', 'Hide Static Map')
                              : t('Погледни на статична мапа (Без API)', 'View on Static Map (No API)')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Static Map Preview if toggled */}
                {showModalStaticMap && venue && (
                  <div className="space-y-2 p-3 bg-stone-100 rounded-xl border border-stone-200 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-600">
                      <span className="font-semibold">{t('Статична локација во Скопје (Без API)', 'Static Venue Location (No API Required)')}</span>
                      <span className="text-[10px] text-stone-500">41.99° N · 21.43° E</span>
                    </div>
                    <StaticSkopjeMap
                      venues={venues}
                      activeVenueId={venue.id}
                      heightClass="h-64"
                      showFilters={false}
                    />
                  </div>
                )}

                {/* Genres */}
                {event.musicGenres && event.musicGenres.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-mono font-semibold uppercase text-stone-500">
                      {t('Жанрови & Вајб', 'Genres & Style')}:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {event.musicGenres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono bg-stone-100 text-stone-800 px-2.5 py-1 rounded-md border border-stone-200"
                        >
                          #{genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-semibold uppercase text-stone-500">
                    {t('Опис на настанот', 'Event Overview')}:
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                    {t(event.description.mk, event.description.en)}
                  </p>
                </div>

                {/* Match reason */}
                {event.matchReason && (
                  <div className="p-4 bg-[#FAF7F0] border border-amber-200/70 rounded-xl space-y-1 text-xs text-stone-800">
                    <div className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{t('Зошто KULTURA QUEST го препорачува овој настан:', 'Why KULTURA QUEST highlights this experience:')}</span>
                    </div>
                    <p className="leading-relaxed pl-5">
                      {t(event.matchReason.mk, event.matchReason.en)}
                    </p>
                  </div>
                )}

                {/* Organizer & Source */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200 text-xs text-stone-600">
                  <div>
                    <span className="font-semibold text-stone-800">{t('Организатор: ', 'Organizer: ')}</span>
                    <span>{event.organizer}</span>
                  </div>
                  {event.sourceUrl && (
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-900 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>{t('Официјален извор / Социјални мрежи', 'Official Source / Socials')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (isSaved ? removeSavedEvent(event.id) : saveEvent(event.id))}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                        isSaved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {isSaved ? <Check className="w-4 h-4 text-emerald-700" /> : <Bookmark className="w-4 h-4" />}
                      <span>{isSaved ? t('Зачувано во Пасош', 'Saved to Passport') : t('Зачувај во Пасош', 'Save to Passport')}</span>
                    </button>

                    <button
                      onClick={() => {
                        const eventTime = event.startTime ? `, ${event.startTime} ч.` : '';
                        const shareText = `${event.title.mk} во ${event.venueName.mk} (${event.date}${eventTime}) - KULTURA QUEST`;
                        navigator.clipboard.writeText(shareText);
                        setEventShareToast(true);
                        setTimeout(() => setEventShareToast(false), 3000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2.5 bg-stone-50 text-stone-700 border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t('Сподели', 'Share')}</span>
                    </button>
                    {eventShareToast && (
                      <span className="text-xs text-emerald-800 font-mono font-medium">{t('Копирано!', 'Copied!')}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(event.ticketUrl || event.reservationUrl) && (
                      <a
                        href={event.ticketUrl || event.reservationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-lg transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-amber-400" />
                        <span>{t('Резервирај / Билети', 'Tickets / Booking')}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    )}

                    <button
                      onClick={() => {
                        setSelectedEventDetail(null);
                        setPlanDate(event.date === TODAY ? 'tonight' : 'tomorrow');
                        setPlannerOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-900 text-white hover:bg-blue-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{t('Планирај вечер со овој настан', 'Plan Night With This')}</span>
                    </button>
                  </div>
                </div>

                {/* Related Events Section */}
                {relatedEvents.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 space-y-3">
                    <h4 className="text-xs font-mono font-bold uppercase text-stone-600">
                      {t('Слични вечерни доживувања', 'Related Evening Experiences')}:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {relatedEvents.map((rel) => (
                        <div
                          key={rel.id}
                          onClick={() => setSelectedEventDetail(rel)}
                          className="p-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg cursor-pointer transition-colors space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                            <span>
                              {rel.startTime ? `${rel.startTime} ч.` : t('Времето не е наведено', 'Time not listed')}
                              {' · '}
                              {rel.date === TODAY ? t('Вечерва', 'Tonight') : rel.date}
                            </span>
                            <span>
                              {getEventPriceLabel(rel, t)}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-stone-900 line-clamp-1">
                            {t(rel.title.mk, rel.title.en)}
                          </div>
                          <div className="text-[11px] text-stone-600 line-clamp-1 font-mono">
                            {t(rel.venueName.mk, rel.venueName.en)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* INTERACTIVE "PLAN MY NIGHT" MODAL */}
      {plannerOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-300 rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-900 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('ИНТЕРАКТИВЕН ПЛАНЕР: ВЕЧЕРВА', 'PLAN MY NIGHT (SINGLE-OPTION)')}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                  {t('Создади персонализиран план за вечерва', 'Craft Your Custom Evening Quest')}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  {t(
                    'Избери го твоето расположение, време и буџет. Системот генерира точно една фокусирана патека со загревање и главен настан.',
                    'Select date, mood, and budget in MKD. Generates strictly one coherent night route.'
                  )}
                </p>
              </div>
              <button
                onClick={() => setPlannerOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 uppercase font-mono">
                  {t('Кога?', 'When?')}
                </label>
                <select
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value as any)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium cursor-pointer"
                >
                  <option value="tonight">{t('Вечерва', 'Tonight')}</option>
                  <option value="tomorrow">{t('Утре', 'Tomorrow')}</option>
                  <option value="weekend">{t('Овој викенд', 'This Weekend')}</option>
                  <option value="custom">{t('Избери друг датум', 'Custom Date')}</option>
                </select>

                {planDate === 'custom' && (
                  <input
                    type="date"
                    value={planCustomDate}
                    onChange={(e) => setPlanCustomDate(e.target.value)}
                    className="w-full mt-1.5 p-2 border border-stone-300 rounded-lg bg-white text-xs font-mono"
                  />
                )}
              </div>

              {/* Mood (All 11 options from specification) */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 uppercase font-mono">
                  {t('Расположение / Vibe', 'Mood / Vibe')}
                </label>
                <select
                  value={planMood}
                  onChange={(e) => setPlanMood(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium cursor-pointer"
                >
                  <option value="party">{t('Забава & Танц (Party mode)', 'Party & Dance')}</option>
                  <option value="chill">{t('Опуштено & Муабет (Chill & cozy)', 'Chill & Cozy')}</option>
                  <option value="date">{t('Романтичен дејт (Date night)', 'Date Night')}</option>
                  <option value="socialize">{t('Дружење & Нови луѓе (Socialize)', 'Socialize & Meet People')}</option>
                  <option value="dance">{t('Танцување цела ноќ (Dance all night)', 'Dance All Night')}</option>
                  <option value="music">{t('Музички гурман (Music lover)', 'Music Lover')}</option>
                  <option value="artsy">{t('Уметнички & Алтернативно (Artsy)', 'Artsy & Alternative')}</option>
                  <option value="competitive">{t('Натпреварувачки & Квиз (Competitive)', 'Competitive & Playful')}</option>
                  <option value="comedy">{t('Стендап & Смеење (Comedy & Improv)', 'Comedy & Spoken Word')}</option>
                  <option value="unusual">{t('Невообичаено место (Something unusual)', 'Something Unusual')}</option>
                  <option value="student">{t('Студентски буџет (Student budget)', 'Student Budget')}</option>
                  <option value="surprise">{t('Изненади ме! (Surprise me)', 'Surprise Me')}</option>
                </select>
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 uppercase font-mono">
                  {t('Буџет во МКД', 'Budget in MKD')}
                </label>
                <select
                  value={planBudget}
                  onChange={(e) => setPlanBudget(Number(e.target.value))}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium cursor-pointer"
                >
                  <option value={0}>{t('Бесплатно (0 МКД)', 'Free (0 MKD)')}</option>
                  <option value={200}>{t('До 200 МКД', 'Up to 200 MKD')}</option>
                  <option value={300}>{t('До 300 МКД (Студентски)', 'Up to 300 MKD (Student)')}</option>
                  <option value={600}>{t('До 600 МКД (Умерен)', 'Up to 600 MKD (Moderate)')}</option>
                  <option value={1200}>{t('До 1,200 МКД (Премиум)', 'Up to 1,200 MKD (Splurge)')}</option>
                </select>
              </div>
            </div>

            {/* Event Types & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 uppercase font-mono">
                  {t('Тип на доживување', 'Event Type')}
                </label>
                <select
                  value={planEventType}
                  onChange={(e) => setPlanEventType(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium cursor-pointer"
                >
                  <option value="all">{t('Сите типови настани', 'All Event Types')}</option>
                  <option value="theme_parties">{t('Тематски забави (80s, 90s, 2000s ретро)', 'Theme Parties (Retro)')}</option>
                  <option value="clubs_dj">{t('Клубови & DJ сетови (техно, електроника)', 'Clubs & DJ Sets')}</option>
                  <option value="live_music">{t('Жива музика (џез, блуз, инди рок)', 'Live Music & Gigs')}</option>
                  <option value="karaoke">{t('Караоке вечери (отворен микрофон)', 'Karaoke Nights')}</option>
                  <option value="pub_quiz">{t('Паб квизови & друштвени игри', 'Pub Quizzes & Games')}</option>
                  <option value="latin_dance">{t('Латино & салса под ѕвезди', 'Latin & Salsa Nights')}</option>
                  <option value="comedy">{t('Стендап комедија & поетски слем', 'Standup & Spoken Word')}</option>
                  <option value="alternative">{t('Алтернативни и андерграунд места', 'Alternative & Underground')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 uppercase font-mono">
                  {t('Време на излегување', 'Time Frame')}
                </label>
                <select
                  value={planTimeSlot}
                  onChange={(e) => setPlanTimeSlot(e.target.value as any)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium cursor-pointer"
                >
                  <option value="all_night">{t('Цела ноќ (19:00 – 03:00+)', 'Full Night (19:00 – 03:00+)')}</option>
                  <option value="early">{t('Рана вечер (18:00 – 21:30)', 'Early Evening (18:00 – 21:30)')}</option>
                  <option value="late">{t('Доцна вечер (21:00 – 02:00)', 'Late Night (21:00 – 02:00)')}</option>
                </select>
              </div>
            </div>

            {/* Social Context & Neighborhood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 uppercase font-mono">
                  {t('Социјален контекст', 'Social Context')}
                </label>
                <select
                  value={planCompany}
                  onChange={(e) => setPlanCompany(e.target.value as any)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium cursor-pointer"
                >
                  <option value="friends">{t('Со пријатели / Екипа', 'With Friends / Group')}</option>
                  <option value="date">{t('За двајца / Дејт', 'Date Night / Couple')}</option>
                  <option value="solo">{t('Соло истражувач', 'Solo Explorer')}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-stone-700 uppercase font-mono">
                  {t('Претпочитана локација / Реон', 'Preferred Neighborhood')}
                </label>
                <select
                  value={planNeighborhood}
                  onChange={(e) => setPlanNeighborhood(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium cursor-pointer"
                >
                  <option value="all">{t('Сите маала (Пешачка релација)', 'All walkable areas')}</option>
                  <option value="Стара Чаршија">{t('Стара Чаршија (Боемски барови & Латино)', 'Old Bazaar')}</option>
                  <option value="Дебар Маало">{t('Дебар Маало (Пабови & Квизови)', 'Debar Maalo')}</option>
                  <option value="Центар">{t('Центар & МКЦ (Ретро забави & Инди)', 'City Center & MKC')}</option>
                  <option value="Градски Парк">{t('Градски Парк & Кеј (Отворени тераси)', 'City Park & Quay')}</option>
                  <option value="Карпош">{t('Карпош (Маалски собиралишта)', 'Karposh')}</option>
                </select>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerateNightPlan}
              className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t('Синтетизирај вечерна патека (Една опција)', 'Synthesize Single Evening Route')}</span>
            </button>

            {/* Toast notification for sharing */}
            {shareToast && (
              <div className="p-3 bg-emerald-900 text-white rounded-lg text-xs font-mono flex items-center gap-2 animate-fade-in shadow-md">
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>
                  {t(
                    'Планот за вечерва е копиран на вашиот клипборд!',
                    'Tonight plan has been copied to your clipboard!'
                  )}
                </span>
              </div>
            )}

            {/* Generated Plan Output (Strict Single Option Itinerary) */}
            {generatedNightPlan && (
              <div className="border border-stone-300 rounded-xl bg-[#FAF7F0] p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-blue-900 text-white px-2 py-0.5 rounded font-bold">
                      {t('ЕДИНСТВЕНА ВЕЧЕРНА РУТА', 'SINGLE DEFINITIVE EVENING ROUTE')}
                    </span>
                    <h4 className="text-xl font-serif font-bold text-stone-900 mt-1">
                      {t(generatedNightPlan.title.mk, generatedNightPlan.title.en)}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Re-roll */}
                    <button
                      onClick={handleGenerateNightPlan}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 cursor-pointer transition-colors"
                      title={t('Генерирај друга варијанта', 'Re-roll with another combination')}
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t('Нова комбинација', 'Re-roll')}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={handleSharePlan}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:bg-stone-50 cursor-pointer transition-colors"
                      title={t('Копирај план', 'Copy plan summary')}
                    >
                      <Share2 className="w-3.5 h-3.5 text-stone-500" />
                      <span>{t('Сподели', 'Share')}</span>
                    </button>

                    {/* Save to Passport */}
                    <button
                      onClick={handleSaveNightPlan}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        isPlanSaved
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {isPlanSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span>{isPlanSaved ? t('Зачувано во пасош', 'Saved to Passport') : t('Зачувај план', 'Save Plan')}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">
                  {t(generatedNightPlan.personalizedExplanation.mk, generatedNightPlan.personalizedExplanation.en)}
                </p>

                {/* Summary Strip */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-stone-200 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block">{t('Вкупно време', 'Duration')}</span>
                    <span className="font-bold text-stone-900">
                      {generatedNightPlan.totalMinutes
                        ? `~${generatedNightPlan.totalMinutes} ${t('мин.', 'min')}`
                        : t('Не е наведено', 'Not listed')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block">{t('Вкупен трошок', 'Total Cost')}</span>
                    <span className="font-bold text-emerald-800">
                      {generatedNightPlan.hasUnknownCost
                        ? generatedNightPlan.totalCostMKD > 0
                          ? `${generatedNightPlan.totalCostMKD} МКД + ${t('непотврдена цена', 'price unconfirmed')}`
                          : t('Цена непотврдена', 'Price unconfirmed')
                        : `${generatedNightPlan.totalCostMKD} МКД`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase block">{t('Станици', 'Stops')}</span>
                    <span className="font-bold text-stone-900">
                      {generatedNightPlan.stops.length} {t('локации', 'stops')}
                    </span>
                  </div>
                </div>

                {/* Walking & Transit Advice Card */}
                {generatedNightPlan.stops.length > 1 && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-stone-700 space-y-1">
                    <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('Совети за движење & транспорт:', 'Walking & Transit Guidance:')}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-mono flex items-center gap-1.5">
                      <Footprints className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>
                        {t(
                          '8-12 мин. лесно пешачење помеѓу локациите во избраниот реон. Локален такси превоз во централното подрачје: ~120-150 МКД.',
                          '8-12 min easy stroll between venues. Local central Skopje taxi fare: ~120-150 MKD.'
                        )}
                      </span>
                    </p>
                  </div>
                )}

                {/* Interactive Stops Sequence (Reorder & Remove supported) */}
                <div className="space-y-3">
                  <div className="text-[11px] font-mono uppercase text-stone-600 font-bold">
                    {t(
                      `Станици на планот (${generatedNightPlan.stops.length}-етапна патека, може да се пререди):`,
                      `Itinerary Sequence (${generatedNightPlan.stops.length}-Stage Route, Reorderable):`
                    )}
                  </div>

                  {generatedNightPlan.stops.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="bg-white p-4 rounded-lg border border-stone-200 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-stone-900">
                            {t(stop.stopTitle.mk, stop.stopTitle.en)}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 font-mono flex flex-wrap items-center gap-2 pl-7">
                          <span>
                            {stop.suggestedArrival
                              ? `${stop.suggestedArrival} ч.`
                              : t('Времето не е наведено', 'Time not listed')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{t(stop.venueName.mk, stop.venueName.en)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-800 font-bold">
                            {stop.isCostUnknown
                              ? t('Цена непотврдена', 'Price unconfirmed')
                              : stop.costMKD === 0
                                ? t('Бесплатно', 'Free')
                                : `${stop.costMKD} МКД`}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 pl-7 leading-relaxed">
                          {t(stop.description.mk, stop.description.en)}
                        </p>
                      </div>

                      {/* Reorder and remove buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {index > 0 && (
                          <button
                            onClick={() => handleMoveStop(index, index - 1)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded cursor-pointer"
                            title={t('Помести нагоре', 'Move up')}
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {index < generatedNightPlan.stops.length - 1 && (
                          <button
                            onClick={() => handleMoveStop(index, index + 1)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded cursor-pointer"
                            title={t('Помести надолу', 'Move down')}
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveStop(stop.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 text-xs rounded cursor-pointer"
                          title={t('Отстрани станица', 'Remove stop')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plan Bottom Action */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200">
                  {generatedNightPlan.stops.every((stop) => !!stop.coordinates) && <button
                    onClick={() => {
                      setPlannerOpen(false);
                      navigate('map');
                    }}
                    className="text-xs text-blue-900 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t('Прикажи на мапата на Скопје', 'View on Map')}</span>
                  </button>}

                  <button
                    onClick={() => {
                      setPlannerOpen(false);
                      navigate('otkrij');
                    }}
                    className="px-4 py-2 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 cursor-pointer"
                  >
                    {t('Отвори во целосен OTKRIJ модул →', 'Open in OTKRIJ →')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
