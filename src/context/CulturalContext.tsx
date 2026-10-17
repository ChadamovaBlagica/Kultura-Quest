import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Venue,
  CulturalEvent,
  Quest,
  AdventureItinerary,
  AdventureStop,
  PassportProfile,
  EventSubmission,
  Badge,
} from '../types';
import {
  INITIAL_VENUES,
  INITIAL_EVENTS,
  INITIAL_QUESTS,
  INITIAL_BADGES,
} from '../data/culturalData';
import { DESHAVKI_NIGHTLIFE_EVENTS, REPLACED_NIGHTLIFE_EVENT_IDS } from '../data/nightlifeEvents';

interface CulturalContextType {
  venues: Venue[];
  events: CulturalEvent[];
  quests: Quest[];
  passport: PassportProfile;
  submissions: EventSubmission[];
  savedAdventures: AdventureItinerary[];
  activeItinerary: AdventureItinerary | null;
  setActiveItinerary: (itinerary: AdventureItinerary | null) => void;
  getUpcomingEvents: (includeExpired?: boolean) => CulturalEvent[];
  completeQuest: (questId: string, earnedXp: number, badgeId?: string) => void;
  saveAdventure: (itinerary: AdventureItinerary) => void;
  removeSavedAdventure: (id: string) => void;
  updateItineraryStops: (itineraryId: string, stops: AdventureStop[]) => void;
  reorderItineraryStops: (itineraryId: string, fromIndex: number, toIndex: number) => void;
  removeStopFromItinerary: (itineraryId: string, stopId: string) => void;
  addStopToItinerary: (itineraryId: string, stop: AdventureStop) => void;
  saveEvent: (eventId: string) => void;
  removeSavedEvent: (eventId: string) => void;
  submitEvent: (submission: Omit<EventSubmission, 'id' | 'status' | 'submittedAt'>) => void;
  approveSubmission: (id: string) => void;
  rejectSubmission: (id: string) => void;
  addNewEvent: (event: CulturalEvent) => void;
  resetDemoData: () => void;
}

const CulturalContext = createContext<CulturalContextType | undefined>(undefined);

export const CulturalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Venues & Events: ensure newly added venues/events are always merged cleanly
  const [venues, setVenues] = useState<Venue[]>(() => {
    const saved = localStorage.getItem('kq_venues_v2');
    return saved ? JSON.parse(saved) : INITIAL_VENUES;
  });

  const [events, setEvents] = useState<CulturalEvent[]>(() => {
    const saved = localStorage.getItem('kq_events_v2');
    if (!saved) return INITIAL_EVENTS;

    const replacedIds = new Set(REPLACED_NIGHTLIFE_EVENT_IDS);
    const savedEvents: CulturalEvent[] = JSON.parse(saved);
    const currentEvents = savedEvents.filter((event) => !replacedIds.has(event.id));
    const currentEventIds = new Set(currentEvents.map((event) => event.id));
    const missingArchiveEvents = DESHAVKI_NIGHTLIFE_EVENTS.filter((event) => !currentEventIds.has(event.id));
    return [...currentEvents, ...missingArchiveEvents];
  });

  const [quests] = useState<Quest[]>(INITIAL_QUESTS);

  // User Passport
  const [passport, setPassport] = useState<PassportProfile>(() => {
    const saved = localStorage.getItem('kq_passport');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure any newly added badge definitions exist
      const existingBadgeIds = parsed.badges?.map((b: Badge) => b.id) || [];
      const missingBadges = INITIAL_BADGES.filter((b) => !existingBadgeIds.includes(b.id));
      const replacedEventIds = new Set(REPLACED_NIGHTLIFE_EVENT_IDS);
      return {
        ...parsed,
        savedEventIds: (parsed.savedEventIds || []).filter((id: string) => !replacedEventIds.has(id)),
        badges: [...(parsed.badges || []), ...missingBadges],
      };
    }
    return {
      level: {
        mk: 'Љубопитен почетник',
        en: 'Curious Beginner',
      },
      levelRank: 1,
      xp: 40,
      nextLevelXp: 150,
      completedQuestIds: [],
      savedAdventureIds: [],
      savedEventIds: ['event_msu_fragmenti', 'deshavki_kuku_lele_tribeca'],
      discoveredVenueIds: ['msu_skopje', 'chifte_hamam', 'menada_old_bazaar'],
      badges: INITIAL_BADGES,
    };
  });

  // Saved Adventures
  const [savedAdventures, setSavedAdventures] = useState<AdventureItinerary[]>(() => {
    const saved = localStorage.getItem('kq_saved_adventures');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeItinerary, setActiveItinerary] = useState<AdventureItinerary | null>(null);

  // Submissions (Admin workflow)
  const [submissions, setSubmissions] = useState<EventSubmission[]>(() => {
    const saved = localStorage.getItem('kq_submissions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'sub_nightlife_1',
        title: 'Блуз џем сесија во Дебар Маало',
        description: 'Отворен неделен блуз џем сешн за млади инструменталисти и љубители на гитарски звук.',
        date: '2026-10-25',
        startTime: '21:00',
        venue: 'Паб Глувото Куче',
        address: 'ул. Наум Наумовски Борче бр. 52',
        category: 'nightlife',
        theme: 'Jazz & Acoustic',
        musicGenres: ['блуз', 'рок'],
        priceMKD: 0,
        priceType: 'free',
        sourceUrl: 'https://facebook.com/gluvotokuce',
        organizerName: 'Скопје Блуз Колектив',
        organizerEmail: 'blues@skopje.mk',
        status: 'pending',
        submittedAt: '2026-10-16T08:30:00Z',
      },
      {
        id: 'sub_1',
        title: 'Урбана поезија во Дебар Маало',
        description: 'Отворен микрофон и поетско читање на млади независни автори во дворот на Старото маало.',
        date: '2026-11-02',
        startTime: '19:00',
        venue: 'Двор на Галерија Прима',
        address: 'ул. Орце Николов 108',
        category: 'literary',
        priceMKD: 0,
        priceType: 'free',
        sourceUrl: 'https://poezija.mk',
        organizerName: 'Младинска Книжевна Иницијатива',
        organizerEmail: 'kontakt@poezija.mk',
        status: 'pending',
        submittedAt: '2026-10-14T14:20:00Z',
      },
      {
        id: 'sub_2',
        title: 'Ситопечат работилница: Постери за Скопје',
        description: 'Интерактивна работилница за рачно печатење мотиви од скопскиот брутализам на текстил и хартија.',
        date: '2026-11-05',
        startTime: '16:00',
        venue: 'Ателје Глина & Мастило',
        address: 'ул. Наум Наумовски Борче 32',
        category: 'workshop',
        priceMKD: 250,
        priceType: 'ticket',
        sourceUrl: 'https://instagram.com/skopje_clay_ink',
        organizerName: 'ФЛУ Колектив',
        organizerEmail: 'art@flu.ukim.edu.mk',
        status: 'pending',
        submittedAt: '2026-10-15T09:15:00Z',
      },
    ];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kq_venues_v2', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('kq_events_v2', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('kq_passport', JSON.stringify(passport));
  }, [passport]);

  useEffect(() => {
    localStorage.setItem('kq_saved_adventures', JSON.stringify(savedAdventures));
  }, [savedAdventures]);

  useEffect(() => {
    localStorage.setItem('kq_submissions', JSON.stringify(submissions));
  }, [submissions]);

  // Exclude expired events by reference date (2026-10-16 local baseline)
  const getUpcomingEvents = (includeExpired = false): CulturalEvent[] => {
    if (includeExpired) return events;
    const today = '2026-10-16';
    return events.filter((e) => e.date >= today);
  };

  // Level determination logic based on XP
  const calculateLevel = (totalXp: number): { level: { mk: string; en: string }; rank: number; nextLevelXp: number } => {
    if (totalXp >= 600) {
      return {
        level: { mk: 'Амбасадор на културата', en: 'Culture Ambassador' },
        rank: 5,
        nextLevelXp: 1000,
      };
    } else if (totalXp >= 400) {
      return {
        level: { mk: 'Културен авантурист', en: 'Cultural Adventurer' },
        rank: 4,
        nextLevelXp: 600,
      };
    } else if (totalXp >= 250) {
      return {
        level: { mk: 'Ловец на приказни', en: 'Story Hunter' },
        rank: 3,
        nextLevelXp: 400,
      };
    } else if (totalXp >= 120) {
      return {
        level: { mk: 'Културен истражувач', en: 'Culture Explorer' },
        rank: 2,
        nextLevelXp: 250,
      };
    }
    return {
      level: { mk: 'Љубопитен почетник', en: 'Curious Beginner' },
      rank: 1,
      nextLevelXp: 120,
    };
  };

  const completeQuest = (questId: string, earnedXp: number, badgeId?: string) => {
    if (passport.completedQuestIds.includes(questId)) {
      return; // prevent duplicate point farming
    }

    const quest = quests.find((q) => q.id === questId);
    const newCompletedIds = [...passport.completedQuestIds, questId];
    const newTotalXp = passport.xp + earnedXp;
    const { level, rank, nextLevelXp } = calculateLevel(newTotalXp);

    let updatedBadges = [...passport.badges];
    if (badgeId) {
      updatedBadges = updatedBadges.map((b) =>
        b.id === badgeId ? { ...b, earnedAt: new Date().toISOString() } : b
      );
    }

    const newDiscovered = quest?.venueId && !passport.discoveredVenueIds.includes(quest.venueId)
      ? [...passport.discoveredVenueIds, quest.venueId]
      : passport.discoveredVenueIds;

    setPassport({
      ...passport,
      xp: newTotalXp,
      level,
      levelRank: rank,
      nextLevelXp,
      completedQuestIds: newCompletedIds,
      discoveredVenueIds: newDiscovered,
      badges: updatedBadges,
    });
  };

  const saveAdventure = (itinerary: AdventureItinerary) => {
    setSavedAdventures((prev) => {
      const exists = prev.some((a) => a.id === itinerary.id);
      if (exists) {
        return prev.map((a) => (a.id === itinerary.id ? itinerary : a));
      }
      return [itinerary, ...prev];
    });

    if (!passport.savedAdventureIds.includes(itinerary.id)) {
      setPassport((prev) => ({
        ...prev,
        savedAdventureIds: [...prev.savedAdventureIds, itinerary.id],
      }));
    }
  };

  const removeSavedAdventure = (id: string) => {
    setSavedAdventures((prev) => prev.filter((a) => a.id !== id));
    setPassport((prev) => ({
      ...prev,
      savedAdventureIds: prev.savedAdventureIds.filter((item) => item !== id),
    }));
  };

  const updateItineraryStops = (itineraryId: string, newStops: AdventureStop[]) => {
    const updatedTotalCost = newStops.reduce((sum, s) => sum + (s.costMKD || 0), 0);
    const updatedTotalMinutes = newStops.reduce((sum, s) => sum + (s.estimatedMinutes || 45), 0);

    const updater = (it: AdventureItinerary): AdventureItinerary => ({
      ...it,
      stops: newStops,
      totalCostMKD: updatedTotalCost,
      totalMinutes: updatedTotalMinutes,
    });

    if (activeItinerary && activeItinerary.id === itineraryId) {
      setActiveItinerary(updater(activeItinerary));
    }

    setSavedAdventures((prev) =>
      prev.map((it) => (it.id === itineraryId ? updater(it) : it))
    );
  };

  const reorderItineraryStops = (itineraryId: string, fromIndex: number, toIndex: number) => {
    const targetItinerary = activeItinerary?.id === itineraryId
      ? activeItinerary
      : savedAdventures.find((a) => a.id === itineraryId);

    if (!targetItinerary) return;

    const newStops = [...targetItinerary.stops];
    const [moved] = newStops.splice(fromIndex, 1);
    newStops.splice(toIndex, 0, moved);

    updateItineraryStops(itineraryId, newStops);
  };

  const removeStopFromItinerary = (itineraryId: string, stopId: string) => {
    const targetItinerary = activeItinerary?.id === itineraryId
      ? activeItinerary
      : savedAdventures.find((a) => a.id === itineraryId);

    if (!targetItinerary) return;

    const newStops = targetItinerary.stops.filter((s) => s.id !== stopId);
    updateItineraryStops(itineraryId, newStops);
  };

  const addStopToItinerary = (itineraryId: string, stop: AdventureStop) => {
    const targetItinerary = activeItinerary?.id === itineraryId
      ? activeItinerary
      : savedAdventures.find((a) => a.id === itineraryId);

    if (!targetItinerary) return;

    const newStops = [...targetItinerary.stops, stop];
    updateItineraryStops(itineraryId, newStops);
  };

  const saveEvent = (eventId: string) => {
    if (!passport.savedEventIds.includes(eventId)) {
      setPassport((prev) => ({
        ...prev,
        savedEventIds: [...prev.savedEventIds, eventId],
      }));
    }
  };

  const removeSavedEvent = (eventId: string) => {
    setPassport((prev) => ({
      ...prev,
      savedEventIds: prev.savedEventIds.filter((id) => id !== eventId),
    }));
  };

  const submitEvent = (data: Omit<EventSubmission, 'id' | 'status' | 'submittedAt'>) => {
    const newSub: EventSubmission = {
      ...data,
      id: `sub_${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setSubmissions([newSub, ...submissions]);
  };

  const approveSubmission = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    // Create a live event
    const newEvent: CulturalEvent = {
      id: `event_approved_${Date.now()}`,
      title: { mk: sub.title, en: sub.title },
      venueId: 'custom_venue',
      venueName: { mk: sub.venue, en: sub.venue },
      date: sub.date,
      startTime: sub.startTime,
      endTime: sub.endTime,
      category: sub.category,
      priceMKD: sub.priceMKD,
      priceType: sub.priceType || (sub.priceMKD === 0 ? 'free' : 'ticket'),
      isPriceConfirmed: true,
      theme: sub.theme,
      musicGenres: sub.musicGenres,
      ageRestriction: sub.ageRestriction,
      ticketUrl: sub.ticketUrl,
      reservationUrl: sub.reservationUrl,
      description: { mk: sub.description, en: sub.description },
      organizer: sub.organizerName,
      sourceUrl: sub.sourceUrl || '#',
      verificationStatus: 'organizer_submitted',
      image: '/src/assets/images/skopje_theme_night_party_1792169588405.jpg',
      isFeatured: false,
    };

    setEvents([newEvent, ...events]);
    setSubmissions(submissions.map((s) => (s.id === id ? { ...s, status: 'approved' } : s)));
  };

  const rejectSubmission = (id: string) => {
    setSubmissions(submissions.map((s) => (s.id === id ? { ...s, status: 'rejected' } : s)));
  };

  const addNewEvent = (event: CulturalEvent) => {
    setEvents([event, ...events]);
  };

  const resetDemoData = () => {
    localStorage.removeItem('kq_venues_v2');
    localStorage.removeItem('kq_events_v2');
    localStorage.removeItem('kq_passport');
    localStorage.removeItem('kq_saved_adventures');
    localStorage.removeItem('kq_submissions');
    setVenues(INITIAL_VENUES);
    setEvents(INITIAL_EVENTS);
    setSavedAdventures([]);
    setActiveItinerary(null);
    setPassport({
      level: { mk: 'Љубопитен почетник', en: 'Curious Beginner' },
      levelRank: 1,
      xp: 40,
      nextLevelXp: 150,
      completedQuestIds: [],
      savedAdventureIds: [],
      savedEventIds: ['event_msu_fragmenti', 'deshavki_kuku_lele_tribeca'],
      discoveredVenueIds: ['msu_skopje', 'chifte_hamam', 'menada_old_bazaar'],
      badges: INITIAL_BADGES,
    });
  };

  return (
    <CulturalContext.Provider
      value={{
        venues,
        events,
        quests,
        passport,
        submissions,
        savedAdventures,
        activeItinerary,
        setActiveItinerary,
        getUpcomingEvents,
        completeQuest,
        saveAdventure,
        removeSavedAdventure,
        updateItineraryStops,
        reorderItineraryStops,
        removeStopFromItinerary,
        addStopToItinerary,
        saveEvent,
        removeSavedEvent,
        submitEvent,
        approveSubmission,
        rejectSubmission,
        addNewEvent,
        resetDemoData,
      }}
    >
      {children}
    </CulturalContext.Provider>
  );
};

export const useCulturalData = () => {
  const context = useContext(CulturalContext);
  if (!context) {
    throw new Error('useCulturalData must be used within a CulturalProvider');
  }
  return context;
};
