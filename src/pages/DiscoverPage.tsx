import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { getEventPriceLabel, hasConfirmedEventPrice } from '../utils/eventUtils';
import { resolveImageUrl } from '../utils/imageAssets';
import { CulturalCategory, VerificationStatus } from '../types';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Bookmark,
  Check,
  Compass,
} from 'lucide-react';

interface DiscoverPageProps {
  navigate: (route: string) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { events, venues, passport, saveEvent, removeSavedEvent } = useCulturalData();

  const [activeTab, setActiveTab] = useState<'events' | 'venues'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number | 'all'>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');

  const categories = [
    { id: 'all', labelMK: 'Сите', labelEN: 'All' },
    { id: 'theme_night', labelMK: 'Вечерва & Тематски вечери', labelEN: 'Tonight & Themes' },
    { id: 'nightlife', labelMK: 'Ноќен живот & Свирки', labelEN: 'Nightlife & Gigs' },
    { id: 'festival', labelMK: 'Фестивали', labelEN: 'Festivals' },
    { id: 'gallery', labelMK: 'Галерии & Изложби', labelEN: 'Galleries & Art' },
    { id: 'museum', labelMK: 'Музеи', labelEN: 'Museums' },
    { id: 'theatre', labelMK: 'Театар & Танц', labelEN: 'Theatre & Dance' },
    { id: 'historic', labelMK: 'Историја & Наследство', labelEN: 'Heritage' },
    { id: 'workshop', labelMK: 'Занаети & Работилници', labelEN: 'Crafts' },
    { id: 'independent_space', labelMK: 'Независни простори', labelEN: 'Indie Spaces' },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesCat =
      selectedCategory === 'all' ||
      ev.category === selectedCategory ||
      (selectedCategory === 'theme_night' && (ev.category === 'theme_night' || ev.category === 'nightlife')) ||
      (selectedCategory === 'nightlife' && (ev.category === 'nightlife' || ev.category === 'theme_night'));
    const matchesPrice =
      maxPrice === 'all' || (hasConfirmedEventPrice(ev) && ev.priceMKD <= maxPrice);
    const matchesSearch =
      searchQuery.trim() === '' ||
      ev.title.mk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.mk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.theme?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venueName.mk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.venueName.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.musicGenres?.some((g) => g.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesPrice && matchesSearch;
  });

  const filteredVenues = venues.filter((ven) => {
    const matchesCat = selectedCategory === 'all' || ven.category === selectedCategory;
    const matchesNeighborhood = selectedNeighborhood === 'all' || ven.neighborhood === selectedNeighborhood;
    const matchesPrice = maxPrice === 'all' || ven.admissionPriceMKD <= maxPrice;
    const matchesSearch =
      searchQuery.trim() === '' ||
      ven.name.mk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ven.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ven.description.mk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesNeighborhood && matchesPrice && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold">
            <Compass className="w-3.5 h-3.5 text-blue-900" />
            <span>{t('КУЛТУРЕН КАТАЛОГ НА СКОПЈЕ', 'SKOPJE CULTURAL REPOSITORY')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            {t('Истражи изложби, театри и простори', 'Discover Exhibitions, Theatres & Venues')}
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            {t(
              'Филтрирај според буџет во МКД, реон или уметнички жанр. Сите податоци се верификувани со транспарентни извори.',
              'Filter by budget in MKD, neighborhood, or category. All records verified with transparent source links.'
            )}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-stone-100 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'events'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Настани & Изложби', 'Events & Exhibitions')} ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('venues')}
            className={`px-4 py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'venues'
                ? 'bg-white text-stone-900 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('Уметнички простори', 'Cultural Spaces')} ({venues.length})
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="space-y-4 bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder={t('Пребарувај по наслов, уметник или опис...', 'Search title, artist, or keywords...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md bg-stone-50 text-stone-900 focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Budget filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-600 uppercase font-mono">
              {t('Буџет:', 'Budget:')}
            </span>
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs py-2 px-3 border border-stone-300 rounded-md bg-stone-50 text-stone-900 cursor-pointer"
            >
              <option value="all">{t('Сите цени', 'All prices')}</option>
              <option value={0}>{t('Само бесплатно (0 МКД)', 'Free only (0 MKD)')}</option>
              <option value={100}>{t('До 100 МКД', 'Up to 100 MKD')}</option>
              <option value={200}>{t('До 200 МКД', 'Up to 200 MKD')}</option>
            </select>
          </div>
        </div>

        {/* Category Pills (Functional filter buttons) */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {t(c.labelMK, c.labelEN)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Content */}
      {activeTab === 'events' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isSaved = passport.savedEventIds.includes(event.id);

            return (
              <div
                key={event.id}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-stone-100">
                    <img
                      src={resolveImageUrl(event.image || '/src/assets/images/poster_art_exhibition_1792095894931.jpg')}
                      alt={event.title.mk}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-stone-900/85 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                      {getEventPriceLabel(event, t)}
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-stone-500 uppercase">{event.category}</span>
                      <VerificationBadge status={event.verificationStatus} />
                    </div>

                    <h3 className="text-base font-serif font-bold text-stone-900 line-clamp-2">
                      {t(event.title.mk, event.title.en)}
                    </h3>

                    <div className="text-xs text-stone-500 flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {event.date} · {event.startTime
                          ? `${event.startTime} ч.`
                          : t('времето не е наведено', 'time not listed')}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{t(event.venueName.mk, event.venueName.en)}</span>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed pt-1">
                      {t(event.description.mk, event.description.en)}
                    </p>
                  </div>
                </div>

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

                  <button
                    onClick={() =>
                      event.category === 'nightlife' ||
                      event.category === 'theme_night' ||
                      event.category === 'festival'
                        ? navigate('vecerva')
                        : navigate('otkrij')
                    }
                    className="text-blue-900 font-semibold hover:underline cursor-pointer"
                  >
                    {event.category === 'nightlife' ||
                    event.category === 'theme_night' ||
                    event.category === 'festival'
                      ? t('Вечерва / Ноќен план →', 'Tonight / Night Plan →')
                      : t('Планирај авантура →', 'Plan Quest →')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-stone-100">
                  <img
                    src={resolveImageUrl(venue.image)}
                    alt={venue.name.mk}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-stone-900/85 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {venue.admissionPriceMKD === 0 ? t('Бесплатно', 'Free') : `${venue.admissionPriceMKD} МКД`}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-stone-500 uppercase">{venue.neighborhood}</span>
                    <VerificationBadge status={venue.verificationStatus} />
                  </div>

                  <h3 className="text-base font-serif font-bold text-stone-900">
                    {t(venue.name.mk, venue.name.en)}
                  </h3>

                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{venue.address}</span>
                  </p>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed pt-1">
                    {t(venue.description.mk, venue.description.en)}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 flex items-center justify-between mt-3 text-xs">
                <a
                  href={venue.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-stone-500 hover:text-stone-800 underline flex items-center gap-1"
                >
                  <span>{t('Официјален извор', 'Source')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => navigate('map')}
                  className="text-blue-900 font-semibold hover:underline cursor-pointer"
                >
                  {t('Погледни на мапа →', 'View on Map →')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
