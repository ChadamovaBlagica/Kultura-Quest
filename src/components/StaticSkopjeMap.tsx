import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Venue } from '../types';
import { VerificationBadge } from './VerificationBadge';
import {
  MapPin,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Info,
  Layers,
  Sparkles,
  Music,
  Wine,
  Building,
  Navigation,
  X,
} from 'lucide-react';

interface StaticSkopjeMapProps {
  venues: Venue[];
  activeVenueId?: string | null;
  onSelectVenue?: (venue: Venue) => void;
  heightClass?: string;
  showFilters?: boolean;
}

// Bounding box for Central Skopje cultural basin
const BOUNDS = {
  minLat: 41.9850,
  maxLat: 42.0080,
  minLng: 21.4130,
  maxLng: 21.4450,
};

// Map dimensions for SVG coordinate system
const SVG_WIDTH = 900;
const SVG_HEIGHT = 640;

export const StaticSkopjeMap: React.FC<StaticSkopjeMapProps> = ({
  venues,
  activeVenueId,
  onSelectVenue,
  heightClass = 'h-[580px]',
  showFilters = true,
}) => {
  const { t } = useLanguage();

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredVenue, setHoveredVenue] = useState<Venue | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(() => {
    if (activeVenueId) {
      return venues.find((v) => v.id === activeVenueId) || null;
    }
    return null;
  });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Convert GPS coordinates to SVG canvas points
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * SVG_WIDTH;
    const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SVG_HEIGHT;
    return { x, y };
  };

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesNeighborhood =
        selectedNeighborhood === 'all' || venue.neighborhood === selectedNeighborhood;
      const matchesCategory =
        selectedCategory === 'all' ||
        venue.category === selectedCategory ||
        (selectedCategory === 'nightlife' && (venue.category === 'nightlife' || venue.category === 'theme_night'));
      return matchesNeighborhood && matchesCategory;
    });
  }, [venues, selectedNeighborhood, selectedCategory]);

  const activeOrHovered = hoveredVenue || selectedVenue;

  const handlePinClick = (venue: Venue) => {
    setSelectedVenue(venue);
    if (onSelectVenue) {
      onSelectVenue(venue);
    }
  };

  const resetMap = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setSelectedNeighborhood('all');
    setSelectedCategory('all');
  };

  return (
    <div className="flex flex-col bg-[#FAF8F5] border border-stone-200 rounded-xl overflow-hidden shadow-xs">
      {/* Top Map Control Bar */}
      {showFilters && (
        <div className="p-3.5 bg-white border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Neighborhood Quick Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-stone-500 uppercase font-semibold text-[10px] mr-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-900" />
              <span>{t('Реон:', 'District:')}</span>
            </span>
            {[
              { id: 'all', labelMK: 'Сите реони', labelEN: 'All' },
              { id: 'Дебар Маало', labelMK: 'Дебар Маало', labelEN: 'Debar Maalo' },
              { id: 'Стара Чаршија', labelMK: 'Стара Чаршија', labelEN: 'Old Bazaar' },
              { id: 'Центар', labelMK: 'Центар', labelEN: 'Center' },
              { id: 'Кале', labelMK: 'Кале', labelEN: 'Kale' },
            ].map((dist) => (
              <button
                key={dist.id}
                onClick={() => setSelectedNeighborhood(dist.id)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  selectedNeighborhood === dist.id
                    ? 'bg-blue-900 text-white font-medium'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {t(dist.labelMK, dist.labelEN)}
              </button>
            ))}
          </div>

          {/* Category Toggle */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 bg-stone-100 border border-stone-300 rounded text-stone-800 text-xs cursor-pointer font-medium"
            >
              <option value="all">{t('Сите типови локации', 'All venue types')}</option>
              <option value="nightlife">{t('Вечерва & Свирки', 'Nightlife & Gigs')}</option>
              <option value="museum">{t('Музеи', 'Museums')}</option>
              <option value="gallery">{t('Галерии', 'Galleries')}</option>
              <option value="independent_space">{t('Независни простори', 'Indie Spaces')}</option>
              <option value="workshop">{t('Занаети', 'Crafts')}</option>
            </select>

            {/* Zoom & Reset Controls */}
            <div className="flex items-center gap-1 border-l border-stone-200 pl-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                title={t('Зумирај', 'Zoom in')}
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.8))}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                title={t('Одзумирај', 'Zoom out')}
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetMap}
                className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                title={t('Ресетирај поглед', 'Reset view')}
                aria-label="Reset view"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Map Canvas Area */}
      <div className={`relative w-full ${heightClass} bg-[#F4F1EA] overflow-hidden select-none`}>
        {/* SVG Static Vector Map */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full object-cover transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Water Pattern / River Gradient */}
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BAE6FD" />
              <stop offset="50%" stopColor="#7DD3FC" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>

            {/* District Gradients */}
            <radialGradient id="debarMaaloGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="carsijaGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFEDD5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FED7AA" stopOpacity="0.25" />
            </radialGradient>
            <radialGradient id="kaleGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DCFCE7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#BBF7D0" stopOpacity="0.2" />
            </radialGradient>
            <radialGradient id="centarGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E0E7FF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#C7D2FE" stopOpacity="0.25" />
            </radialGradient>
            <radialGradient id="parkGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.3" />
            </radialGradient>

            {/* Pin Filter Shadow */}
            <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 1. Base Ground Grid */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#F7F5EE" />

          {/* Subtle Grid Lines */}
          <g stroke="#E7E3D8" strokeWidth="1" strokeDasharray="4 6" opacity="0.6">
            <line x1="0" y1="160" x2={SVG_WIDTH} y2="160" />
            <line x1="0" y1="320" x2={SVG_WIDTH} y2="320" />
            <line x1="0" y1="480" x2={SVG_WIDTH} y2="480" />
            <line x1="225" y1="0" x2="225" y2={SVG_HEIGHT} />
            <line x1="450" y1="0" x2="450" y2={SVG_HEIGHT} />
            <line x1="675" y1="0" x2="675" y2={SVG_HEIGHT} />
          </g>

          {/* 2. City Park Greenery (Градски Парк) */}
          <path
            d="M 120 40 C 200 30, 310 50, 360 120 C 370 170, 320 200, 240 210 C 160 210, 100 150, 110 80 Z"
            fill="url(#parkGradient)"
            stroke="#6EE7B7"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="210" y="110" fill="#047857" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.8">
            ГРАДСКИ ПАРК (CITY PARK)
          </text>

          {/* 3. District Polygons */}
          {/* Debar Maalo */}
          <path
            d="M 180 220 C 270 215, 340 230, 370 300 C 375 360, 320 410, 220 410 C 150 400, 140 310, 180 220 Z"
            fill="url(#debarMaaloGradient)"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text x="220" y="295" fill="#B45309" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.85">
            Дебар Маало
          </text>
          <text x="215" y="312" fill="#D97706" fontSize="9" fontFamily="monospace" opacity="0.75">
            (Debar Maalo Bohemian Quarter)
          </text>

          {/* Kale Fortress Hill */}
          <path
            d="M 440 90 C 510 80, 580 110, 600 170 C 580 230, 480 240, 440 190 C 420 150, 410 110, 440 90 Z"
            fill="url(#kaleGradient)"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="475" y="145" fill="#065F46" fontSize="11" fontFamily="serif" fontWeight="bold" opacity="0.85">
            Кале & МСУ
          </text>
          <text x="470" y="160" fill="#047857" fontSize="9" fontFamily="monospace" opacity="0.75">
            (Kale Fortress & MoCA)
          </text>

          {/* Old Bazaar (Стара Скопска Чаршија) */}
          <path
            d="M 540 180 C 640 170, 750 200, 770 290 C 760 360, 680 390, 580 370 C 530 340, 510 250, 540 180 Z"
            fill="url(#carsijaGradient)"
            stroke="#EA580C"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text x="595" y="275" fill="#C2410C" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.85">
            Стара Скопска Чаршија
          </text>
          <text x="610" y="292" fill="#EA580C" fontSize="9" fontFamily="monospace" opacity="0.75">
            (Old Bazaar Heritage Quarter)
          </text>

          {/* Modernist City Center (Центар) */}
          <path
            d="M 370 340 C 480 330, 600 350, 650 440 C 640 540, 510 570, 390 540 C 330 500, 320 410, 370 340 Z"
            fill="url(#centarGradient)"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text x="450" y="475" fill="#4338CA" fontSize="12" fontFamily="serif" fontWeight="bold" opacity="0.85">
            Плоштад & Центар
          </text>
          <text x="435" y="492" fill="#6366F1" fontSize="9" fontFamily="monospace" opacity="0.75">
            (Macedonia Square & Modernist Axis)
          </text>

          {/* 4. River Vardar Flow (Hydrography) */}
          {/* Main river body with organic width */}
          <path
            d="M 20 160 C 130 180, 240 190, 330 240 C 420 290, 480 320, 560 330 C 660 340, 760 320, 890 350"
            fill="none"
            stroke="#93C5FD"
            strokeWidth="28"
            strokeLinecap="round"
          />
          <path
            d="M 20 160 C 130 180, 240 190, 330 240 C 420 290, 480 320, 560 330 C 660 340, 760 320, 890 350"
            fill="none"
            stroke="url(#riverGradient)"
            strokeWidth="22"
            strokeLinecap="round"
          />

          {/* River Label */}
          <text x="140" y="195" fill="#0369A1" fontSize="10" fontFamily="serif" fontStyle="italic" fontWeight="bold" opacity="0.7">
            Река Вардар (Vardar River)
          </text>

          {/* 5. Bridges Across Vardar */}
          {/* Goce Delchev Bridge */}
          <line x1="435" y1="295" x2="445" y2="315" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
          <text x="405" y="285" fill="#334155" fontSize="8" fontFamily="monospace">
            Мост Гоце Делчев
          </text>

          {/* Stone Bridge (Камен Мост - Historic Icon) */}
          <g>
            <line x1="505" y1="315" x2="520" y2="335" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
            <line x1="505" y1="315" x2="520" y2="335" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 3" />
            <text x="475" y="348" fill="#78350F" fontSize="9" fontFamily="serif" fontWeight="bold">
              Камен Мост (Stone Bridge)
            </text>
          </g>

          {/* Bridge of Art / Eye Bridge */}
          <line x1="565" y1="325" x2="575" y2="345" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />

          {/* 6. Major Urban Boulevards */}
          <g stroke="#CBD5E1" strokeWidth="2.5" fill="none" opacity="0.8">
            {/* Blvd Partizanski Odredi into Center */}
            <path d="M 20 330 L 330 330 L 460 370 L 680 390 L 880 410" />
            {/* Blvd Ilinden through Debar Maalo & Park */}
            <path d="M 20 220 L 300 220 L 430 270" />
            {/* Blvd Krste Petkov Misirkov east of Bazaar */}
            <path d="M 680 120 L 700 280 L 720 480" />
            {/* Blvd Dame Gruev southern loop */}
            <path d="M 360 440 L 480 460 L 600 450" />
          </g>

          {/* 7. Projected Venue Markers */}
          {filteredVenues.map((venue) => {
            const { x, y } = projectCoords(venue.coordinates[0], venue.coordinates[1]);
            const isSelected = selectedVenue?.id === venue.id;
            const isHovered = hoveredVenue?.id === venue.id;
            const isNightlife = venue.category === 'nightlife' || venue.category === 'theme_night';
            const isWorkshop = venue.category === 'workshop' || venue.category === 'independent_space';

            // Pin styling
            let pinColor = '#1E3A8A'; // Blue 900 default (Museum / Gallery)
            if (isNightlife) pinColor = '#B45309'; // Amber 700 (Evening / Bars)
            if (isWorkshop) pinColor = '#047857'; // Emerald 700 (Crafts / Indie)

            if (isSelected) pinColor = '#2563EB'; // Bright blue active

            return (
              <g
                key={venue.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => handlePinClick(venue)}
                onMouseEnter={() => setHoveredVenue(venue)}
                onMouseLeave={() => setHoveredVenue(null)}
                style={{
                  transform: isSelected || isHovered ? `translate(${x}px, ${y}px) scale(1.25)` : `translate(${x}px, ${y}px)`,
                  transformOrigin: '0 0',
                }}
              >
                {/* Pin Pulsing Ring if selected */}
                {(isSelected || isHovered) && (
                  <circle cx="0" cy="-14" r="16" fill={pinColor} opacity="0.25" className="animate-ping" />
                )}

                {/* SVG Pin Marker */}
                <path
                  d="M 0 0 C -7 -10, -10 -15, -10 -22 C -10 -28, -5 -33, 0 -33 C 5 -33, 10 -28, 10 -22 C 10 -15, 7 -10, 0 0 Z"
                  fill={pinColor}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="url(#pinShadow)"
                />

                {/* Inner White Dot or Icon Indicator */}
                <circle cx="0" cy="-22" r="3.5" fill="#FFFFFF" />

                {/* Venue Name Label on hover or selected */}
                {(isSelected || isHovered) && (
                  <g transform="translate(0, -40)">
                    <rect
                      x="-70"
                      y="-18"
                      width="140"
                      height="22"
                      rx="4"
                      fill="#1C1917"
                      fillOpacity="0.92"
                    />
                    <text
                      x="0"
                      y="-4"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {venue.name.mk.length > 20 ? venue.name.mk.slice(0, 18) + '…' : venue.name.mk}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Detail Overlay Card (When Pin is selected or hovered) */}
        {activeOrHovered && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30 bg-white/95 backdrop-blur-md border border-stone-300 rounded-xl p-4 shadow-xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
                  <span className="font-semibold text-blue-900">{activeOrHovered.neighborhood}</span>
                  <span aria-hidden="true">·</span>
                  <VerificationBadge status={activeOrHovered.verificationStatus} />
                </div>
                <h4 className="text-sm font-serif font-bold text-stone-900 leading-snug">
                  {t(activeOrHovered.name.mk, activeOrHovered.name.en)}
                </h4>
              </div>
              <button
                onClick={() => {
                  setSelectedVenue(null);
                  setHoveredVenue(null);
                }}
                className="text-stone-400 hover:text-stone-700 text-xs p-1"
                aria-label="Close venue card"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Thumbnail and short metadata */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                <img
                  src={activeOrHovered.image}
                  alt={activeOrHovered.name.mk}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-stone-600 space-y-1">
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  <span className="line-clamp-1">{activeOrHovered.address}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-stone-900 font-bold">
                    {activeOrHovered.admissionPriceMKD === 0
                      ? t('Бесплатен влез', 'Free admission')
                      : `${activeOrHovered.admissionPriceMKD} МКД`}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
              {t(activeOrHovered.description.mk, activeOrHovered.description.en)}
            </p>

            {/* Actions */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${activeOrHovered.coordinates[0]},${activeOrHovered.coordinates[1]}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-900 hover:underline font-medium text-[11px]"
              >
                <Navigation className="w-3 h-3" />
                <span>{t('Навигација (Google Maps)', 'Open in Google Maps')}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>

              {onSelectVenue && (
                <button
                  onClick={() => onSelectVenue(activeOrHovered)}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded text-[11px] cursor-pointer"
                >
                  {t('Избери локал', 'Select Venue')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Static Map Compass & Scale Indicator */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none flex flex-col items-end gap-1">
          <div className="bg-white/90 backdrop-blur-xs border border-stone-300 rounded-lg p-2 shadow-xs flex items-center gap-2 text-[10px] font-mono text-stone-700">
            <Compass className="w-4 h-4 text-stone-700 animate-spin-slow" />
            <div className="text-right">
              <div className="font-bold">СКОПЈЕ · SKOPJE</div>
              <div className="text-stone-500">41.99° N · 21.43° E</div>
            </div>
          </div>
          <div className="bg-white/80 border border-stone-200 rounded px-2 py-0.5 text-[9px] font-mono text-stone-500">
            Статична векторска мапа · Без API клуч
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-3 bg-white/90 backdrop-blur-xs border border-stone-300 rounded-lg px-3 py-1.5 text-[10px] font-mono shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
            <span className="text-stone-700">{t('Музеи & Уметност', 'Art & Museums')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
            <span className="text-stone-700">{t('Вечерва & Ноќен живот', 'Nightlife & Pubs')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
            <span className="text-stone-700">{t('Занаети & Независни', 'Indie & Crafts')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
