import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { StaticSkopjeMap } from '../components/StaticSkopjeMap';
import { Venue, CulturalCategory } from '../types';
import {
  MapPin,
  List,
  Map as MapIcon,
  Search,
  ExternalLink,
  Plus,
  Check,
  Compass,
  Building,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MapPageProps {
  navigate: (route: string) => void;
}

export const MapPage: React.FC<MapPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { venues, setActiveItinerary } = useCulturalData();

  const [viewMode, setViewMode] = useState<'static' | 'interactive' | 'list'>('static');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeVenue, setActiveVenue] = useState<Venue | null>(venues[0] || null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  const categories = [
    { id: 'all', labelMK: 'Сите категории', labelEN: 'All Categories' },
    { id: 'nightlife', labelMK: 'Ноќен живот & Клубови', labelEN: 'Nightlife & Bars' },
    { id: 'theme_night', labelMK: 'Тематски вечери & Пабови', labelEN: 'Theme Nights & Pubs' },
    { id: 'museum', labelMK: 'Музеи', labelEN: 'Museums' },
    { id: 'gallery', labelMK: 'Галерии', labelEN: 'Galleries' },
    { id: 'historic', labelMK: 'Историски локалитети', labelEN: 'Historic Sites' },
    { id: 'independent_space', labelMK: 'Независни простори', labelEN: 'Indie Spaces' },
    { id: 'workshop', labelMK: 'Занаети и ателјеа', labelEN: 'Crafts & Ateliers' },
    { id: 'public_art', labelMK: 'Брутализам и споменици', labelEN: 'Public Art' },
  ];

  const neighborhoods = [
    { id: 'all', labelMK: 'Сите маала', labelEN: 'All Neighborhoods' },
    { id: 'Кале', labelMK: 'Кале', labelEN: 'Kale' },
    { id: 'Стара Чаршија', labelMK: 'Стара Чаршија', labelEN: 'Old Bazaar' },
    { id: 'Центар', labelMK: 'Центар', labelEN: 'City Center' },
    { id: 'Дебар Маало', labelMK: 'Дебар Маало', labelEN: 'Debar Maalo' },
  ];

  const filteredVenues = venues.filter((venue) => {
    const matchesCategory = selectedCategory === 'all' || venue.category === selectedCategory;
    const matchesNeighborhood = selectedNeighborhood === 'all' || venue.neighborhood === selectedNeighborhood;
    const matchesSearch =
      searchQuery.trim() === '' ||
      venue.name.mk.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.description.mk.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesNeighborhood && matchesSearch;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode !== 'interactive' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Skopje (Kale / Stone Bridge / Old Bazaar axis)
      const map = L.map(mapContainerRef.current, {
        center: [41.9985, 21.4335],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Custom SVG Pin Icon
    const createCustomIcon = (isSelected: boolean, isLesserKnown: boolean) => {
      const bgColor = isSelected ? '#1E40AF' : isLesserKnown ? '#9A3412' : '#1C1917';
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${bgColor}" width="32" height="32" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: svg,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
    };

    // Add markers for filtered venues
    filteredVenues.forEach((venue) => {
      const isSelected = activeVenue?.id === venue.id;
      const marker = L.marker(venue.coordinates, {
        icon: createCustomIcon(isSelected, !!venue.isLesserKnown),
      }).addTo(map);

      marker.on('click', () => {
        setActiveVenue(venue);
      });

      markersRef.current[venue.id] = marker;
    });

    // Invalidate size in case of tab/view change
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Keep map instance alive across filter updates
    };
  }, [viewMode, filteredVenues, activeVenue]);

  const handleSelectVenue = (venue: Venue) => {
    setActiveVenue(venue);
    if (mapInstanceRef.current && viewMode === 'interactive') {
      mapInstanceRef.current.flyTo(venue.coordinates, 15, { duration: 0.8 });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Filter and Switch Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500">
            <Compass className="w-3.5 h-3.5 text-blue-900" />
            <span>{t('КУЛТУРНА МАПА НА СКОПЈЕ', 'SKOPJE CULTURAL MAP')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {t('Топографија на уметноста и ноќниот живот', 'Art & Nightlife Topography')}
          </h1>
        </div>

        {/* View mode toggle with Static Map as primary */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="flex items-center p-1 bg-stone-100 rounded-lg">
            <button
              onClick={() => setViewMode('static')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'static'
                  ? 'bg-blue-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('Статична мапа (Без API)', 'Static Map (No API)')}</span>
            </button>
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'interactive'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{t('Интерактивна (OSM)', 'Interactive (OSM)')}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t('Листа', 'List View')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            placeholder={t('Пребарај локација, музеј или споменик...', 'Search museum, gallery, or site...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-md bg-white text-stone-900 focus:outline-none focus:border-blue-900"
          />
        </div>

        {/* Categories Select */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs py-2 px-3 border border-stone-300 rounded-md bg-white text-stone-800 cursor-pointer"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {t(c.labelMK, c.labelEN)}
            </option>
          ))}
        </select>

        {/* Neighborhood Select */}
        <select
          value={selectedNeighborhood}
          onChange={(e) => setSelectedNeighborhood(e.target.value)}
          className="text-xs py-2 px-3 border border-stone-300 rounded-md bg-white text-stone-800 cursor-pointer"
        >
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>
              {t(n.labelMK, n.labelEN)}
            </option>
          ))}
        </select>

        <span className="text-xs font-mono text-stone-500 ml-auto">
          {filteredVenues.length} {t('локации', 'locations')}
        </span>
      </div>

      {/* Main Layout: Static Map vs Interactive Leaflet vs List */}
      {viewMode === 'static' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Static Illustrated Vector Map Area (Zero API key required) */}
          <div className="lg:col-span-8">
            <StaticSkopjeMap
              venues={filteredVenues}
              activeVenueId={activeVenue?.id}
              onSelectVenue={handleSelectVenue}
              heightClass="h-[560px]"
              showFilters={false}
            />
          </div>

          {/* Venue Detail Inspector (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs">
            {activeVenue ? (
              <div className="space-y-4">
                <div className="relative h-44 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                  <img
                    src={activeVenue.image}
                    alt={activeVenue.name.mk}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {activeVenue.admissionPriceMKD === 0
                      ? t('Бесплатен влез', 'Free Entry')
                      : `${activeVenue.admissionPriceMKD} МКД`}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-stone-500 uppercase">
                      {activeVenue.neighborhood}
                    </span>
                    <VerificationBadge status={activeVenue.verificationStatus} />
                  </div>

                  <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                    {t(activeVenue.name.mk, activeVenue.name.en)}
                  </h3>

                  <p className="text-xs text-stone-500 italic flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{activeVenue.address}</span>
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed pt-1">
                    {t(activeVenue.description.mk, activeVenue.description.en)}
                  </p>

                  <div className="p-3 bg-[#FAF7F0] rounded-md border border-stone-200 text-xs text-stone-700 space-y-1">
                    <div className="font-semibold text-stone-900">
                      {t('Зошто вреди да се открие:', 'Why Discover:')}
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {t(activeVenue.whyDiscover.mk, activeVenue.whyDiscover.en)}
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-stone-500 space-y-1">
                    <div>
                      <span className="font-semibold text-stone-700">{t('Работно време:', 'Hours:')} </span>
                      <span>{t(activeVenue.openingHours.mk, activeVenue.openingHours.en)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700">{t('Пристапност:', 'Accessibility:')} </span>
                      <span>{t(activeVenue.accessibilityInfo.mk, activeVenue.accessibilityInfo.en)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                  <a
                    href={activeVenue.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-900 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>{t('Официјална веб-страница', 'Official Site')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => navigate('otkrij')}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                  >
                    {t('Додај во авантура', 'Add to Quest')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <Info className="w-8 h-8 mx-auto" />
                <p className="text-xs">{t('Избери локација од мапата', 'Select a marker from the map')}</p>
              </div>
            )}
          </div>
        </div>
      ) : viewMode === 'interactive' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Leaflet Map Canvas (8 cols) */}
          <div className="lg:col-span-8 rounded-xl border border-stone-300 overflow-hidden shadow-xs relative h-[520px] bg-stone-100">
            <div ref={mapContainerRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-mono text-stone-600 border border-stone-200">
              {t('Кликни врз ознака за детални информации', 'Click marker to inspect venue')}
            </div>
          </div>

          {/* Venue Detail Inspector (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-stone-200 rounded-xl p-5 space-y-4 shadow-xs">
            {activeVenue ? (
              <div className="space-y-4">
                <div className="relative h-44 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                  <img
                    src={activeVenue.image}
                    alt={activeVenue.name.mk}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {activeVenue.admissionPriceMKD === 0
                      ? t('Бесплатен влез', 'Free Entry')
                      : `${activeVenue.admissionPriceMKD} МКД`}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-stone-500 uppercase">
                      {activeVenue.neighborhood}
                    </span>
                    <VerificationBadge status={activeVenue.verificationStatus} />
                  </div>

                  <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                    {t(activeVenue.name.mk, activeVenue.name.en)}
                  </h3>

                  <p className="text-xs text-stone-500 italic flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{activeVenue.address}</span>
                  </p>

                  <p className="text-xs text-stone-600 leading-relaxed pt-1">
                    {t(activeVenue.description.mk, activeVenue.description.en)}
                  </p>

                  <div className="p-3 bg-[#FAF7F0] rounded-md border border-stone-200 text-xs text-stone-700 space-y-1">
                    <div className="font-semibold text-stone-900">
                      {t('Зошто вреди да се открие:', 'Why Discover:')}
                    </div>
                    <div className="text-[11px] leading-relaxed">
                      {t(activeVenue.whyDiscover.mk, activeVenue.whyDiscover.en)}
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-stone-500 space-y-1">
                    <div>
                      <span className="font-semibold text-stone-700">{t('Работно време:', 'Hours:')} </span>
                      <span>{t(activeVenue.openingHours.mk, activeVenue.openingHours.en)}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700">{t('Пристапност:', 'Accessibility:')} </span>
                      <span>{t(activeVenue.accessibilityInfo.mk, activeVenue.accessibilityInfo.en)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                  <a
                    href={activeVenue.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-900 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>{t('Официјална веб-страница', 'Official Site')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => navigate('otkrij')}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded cursor-pointer transition-colors"
                  >
                    {t('Додај во авантура', 'Add to Quest')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <Info className="w-8 h-8 mx-auto" />
                <p className="text-xs">{t('Избери локација од мапата', 'Select a marker from the map')}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List View Fallback */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => (
            <div
              key={venue.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:border-stone-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-stone-100">
                  <img
                    src={venue.image}
                    alt={venue.name.mk}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {venue.admissionPriceMKD === 0 ? t('Бесплатно', 'Free') : `${venue.admissionPriceMKD} МКД`}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-500 uppercase">{venue.neighborhood}</span>
                    <VerificationBadge status={venue.verificationStatus} />
                  </div>

                  <h3 className="text-base font-serif font-bold text-stone-900">
                    {t(venue.name.mk, venue.name.en)}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
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
                  <span>{t('Извор', 'Source')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => {
                    handleSelectVenue(venue);
                    setViewMode('static');
                  }}
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
