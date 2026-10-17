export type Language = 'mk' | 'en';

export type VerificationStatus = 
  | 'verified_official'          // Верификувано од официјален извор
  | 'organizer_submitted'        // Поднесено од организатор
  | 'not_independently_verified' // Не е независно проверено
  | 'demo_data';                 // Демонстрациски податок

export type CulturalCategory =
  | 'museum'
  | 'gallery'
  | 'theatre'
  | 'cinema'
  | 'historic'
  | 'independent_space'
  | 'workshop'
  | 'festival'
  | 'literary'
  | 'public_art'
  | 'nightlife'
  | 'theme_night';

export type QuestType =
  | 'history_detective'
  | 'art_explorer'
  | 'hidden_gem'
  | 'culture_quiz'
  | 'local_creator'
  | 'photo_quest'
  | 'digital_quest';

export type AdventureMode =
  | 'quick'
  | 'budget'
  | 'hidden_skopje'
  | 'friends'
  | 'art_explorer'
  | 'history_detective'
  | 'weekend'
  | 'surprise_me'
  | 'evening_quest'
  | 'mixed_adventure';

export interface LocalizedString {
  mk: string;
  en: string;
}

export interface Venue {
  id: string;
  name: LocalizedString;
  category: CulturalCategory;
  address: string;
  neighborhood: string; // Дебар Маало, Стара Чаршија, Кале, Центар, Водно, etc.
  coordinates: [number, number]; // [lat, lng]
  description: LocalizedString;
  whyDiscover: LocalizedString;
  admissionPriceMKD: number; // 0 = free
  openingHours: LocalizedString;
  accessibilityInfo: LocalizedString;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
  image: string;
  tags: string[];
  isLesserKnown?: boolean;
}

export interface CulturalEvent {
  id: string;
  title: LocalizedString;
  venueId: string;
  venueName: LocalizedString;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM, omitted when the event time is not provided
  endTime?: string;
  category: CulturalCategory;
  priceMKD: number; // 0 = free
  priceType?: 'free' | 'ticket' | 'minimum_consumption' | 'unconfirmed';
  isPriceConfirmed?: boolean;
  theme?: string; // e.g. '80s / 90s / 2000s', 'Latin & Salsa', 'Pub Quiz & Trivia', 'Jazz & Acoustic', 'Techno & Electronic'
  musicGenres?: string[];
  ageRestriction?: string; // e.g. '18+', 'all_ages'
  ticketUrl?: string;
  reservationUrl?: string;
  recurrenceRule?: string; // e.g. 'Секој петок', 'Секоја сабота'
  indoorOutdoor?: 'indoor' | 'outdoor' | 'mixed';
  description: LocalizedString;
  matchReason?: LocalizedString; // Explanation why this event matches the user vibe/budget
  organizer: string;
  sourceUrl: string;
  verificationStatus: VerificationStatus;
  image?: string;
  isFeatured?: boolean;
}

export interface QuestQuestion {
  id: string;
  question: LocalizedString;
  options: {
    mk: string[];
    en: string[];
  };
  correctAnswerIndex: number;
  explanation: LocalizedString;
}

export interface Quest {
  id: string;
  title: LocalizedString;
  type: QuestType;
  venueId: string;
  venueName: LocalizedString;
  description: LocalizedString;
  culturalBackground: LocalizedString;
  instructions: LocalizedString;
  questions: QuestQuestion[];
  points: number;
  badgeAwarded?: string;
  qrCodeValue: string;
  isOnlineFeasible: boolean;
  verificationStatus: VerificationStatus;
  sourceUrl?: string;
}

export interface AdventureStop {
  id: string;
  venueId: string;
  venueName: LocalizedString;
  stopTitle: LocalizedString;
  description: LocalizedString;
  estimatedMinutes: number;
  costMKD: number;
  isCostUnknown?: boolean;
  address: string;
  coordinates?: [number, number];
  verificationStatus: VerificationStatus;
  optionalQuestId?: string;
  suggestedArrival?: string;
  eventStartTime?: string;
  ticketUrl?: string;
}

export interface AdventureItinerary {
  id: string;
  title: LocalizedString;
  mode: AdventureMode;
  personalizedExplanation: LocalizedString;
  totalMinutes: number;
  totalCostMKD: number;
  hasUnknownCost: boolean;
  stops: AdventureStop[];
  sourceLinks: { name: string; url: string }[];
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface Badge {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  iconName: string;
  earnedAt?: string;
}

export interface PassportProfile {
  level: {
    mk: string;
    en: string;
  };
  levelRank: number; // 1 to 5
  xp: number;
  nextLevelXp: number;
  completedQuestIds: string[];
  savedAdventureIds: string[];
  savedEventIds: string[];
  discoveredVenueIds: string[];
  badges: Badge[];
}

export interface EventSubmission {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime?: string;
  venue: string;
  address: string;
  category: CulturalCategory;
  priceMKD: number;
  priceType?: 'free' | 'ticket' | 'minimum_consumption' | 'unconfirmed';
  theme?: string;
  musicGenres?: string[];
  ageRestriction?: string;
  ticketUrl?: string;
  reservationUrl?: string;
  sourceUrl: string;
  organizerName: string;
  organizerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface NightPlanConfig {
  dateChoice: 'tonight' | 'tomorrow' | 'weekend' | 'custom';
  selectedDate: string;
  mood: string;
  eventTypes: string[];
  budgetMKD: number | 'free' | 'flexible';
  neighborhood: string;
  socialContext: 'solo' | 'friends' | 'date' | 'student' | 'family';
  indoorOutdoor: 'all' | 'indoor' | 'outdoor';
  musicGenre: string;
  verifiedOnly: boolean;
}

export interface PosterExtractionResult {
  title: string;
  organizer: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  address: string;
  priceMKD: string;
  description: string;
  category: CulturalCategory;
  registrationUrl: string;
  accessibilityInfo: string;
  confidence: {
    [key: string]: 'high' | 'medium' | 'low' | 'missing';
  };
}
