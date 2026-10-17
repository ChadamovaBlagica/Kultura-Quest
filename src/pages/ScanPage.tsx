import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { VerificationBadge } from '../components/VerificationBadge';
import { PosterExtractionResult, CulturalCategory } from '../types';
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Bookmark,
  RefreshCw,
  FileText,
  Sliders,
} from 'lucide-react';

interface ScanPageProps {
  navigate: (route: string) => void;
}

export const ScanPage: React.FC<ScanPageProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { addNewEvent, saveEvent } = useCulturalData();

  const [posterImage, setPosterImage] = useState<string | null>(
    '/src/assets/images/poster_art_exhibition_1792095894931.jpg'
  );
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<PosterExtractionResult | null>(null);
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'extracted' | 'saved'>('idle');
  const [extractionMethod, setExtractionMethod] = useState<string>('');

  // Editable Form State
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [priceMKD, setPriceMKD] = useState('0');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CulturalCategory>('gallery');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [accessibilityInfo, setAccessibilityInfo] = useState('');

  const triggerScan = async (imageSrc: string) => {
    setIsScanning(true);
    setScanStep('scanning');

    try {
      const response = await fetch('/api/scan-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageSrc.startsWith('data:') ? imageSrc : null,
          sampleType: 'moca_contemporary_poster',
        }),
      });

      const resData = await response.json();
      if (resData && resData.data) {
        const d: PosterExtractionResult = resData.data;
        setExtractedData(d);
        setExtractionMethod(resData.method || 'kultura-ocr');

        // Populate editable inputs
        setTitle(d.title || '');
        setOrganizer(d.organizer || '');
        setDate(d.date || '2026-10-24');
        setStartTime(d.startTime || '19:00');
        setEndTime(d.endTime || '22:00');
        setVenue(d.venue || '');
        setAddress(d.address || '');
        setPriceMKD(d.priceMKD || '150');
        setDescription(d.description || '');
        setCategory(d.category || 'gallery');
        setRegistrationUrl(d.registrationUrl || '');
        setAccessibilityInfo(d.accessibilityInfo || '');

        setScanStep('extracted');
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPosterImage(base64);
      triggerScan(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = () => {
    const samplePath = '/src/assets/images/poster_art_exhibition_1792095894931.jpg';
    setPosterImage(samplePath);
    triggerScan(samplePath);
  };

  const handleSaveEvent = () => {
    const newId = `scanned_event_${Date.now()}`;
    addNewEvent({
      id: newId,
      title: { mk: title, en: title },
      venueId: 'msu_skopje',
      venueName: { mk: venue, en: venue },
      date: date || '2026-10-24',
      startTime: startTime || '19:00',
      endTime: endTime,
      category,
      priceMKD: parseInt(priceMKD, 10) || 0,
      description: { mk: description, en: description },
      organizer,
      sourceUrl: registrationUrl || '#',
      verificationStatus: 'organizer_submitted',
      image: posterImage || undefined,
      isFeatured: true,
    });

    saveEvent(newId);
    setScanStep('saved');
  };

  const getConfidenceBadge = (fieldKey: string) => {
    if (!extractedData || !extractedData.confidence) return null;
    const conf = extractedData.confidence[fieldKey] || 'medium';

    switch (conf) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{t('Висока сигурност', 'High Confidence')}</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>{t('Потребна потврда', 'Verify')}</span>
          </span>
        );
      case 'low':
      case 'missing':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-600">
            <HelpCircle className="w-3 h-3 text-stone-500" />
            <span>{t('Неодредено на постер', 'Uncertain / Missing')}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Editorial Title */}
      <div className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800 font-semibold">
          <Camera className="w-4 h-4" />
          <span>{t('СКЕНИРАЈ & ОТКРИЈ (POSTER-TO-EVENT AI)', 'SCAN & DISCOVER (POSTER-TO-EVENT AI)')}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          {t('Претвори уметнички постер во настан', 'Transform Any Poster into an Event')}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t(
            'Прикачи фотографија од постер за изложба, концерт или претстава. Системот извлекува наслов, куратор, датум и локација, овозможува рачно уредување и гради културна авантура околу него.',
            'Upload a photo of any exhibition, concert, or festival poster. Our vision OCR extracts the schedule, organizers, and price in MKD with editable fields.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Poster Preview & Upload Actions */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h2 className="text-sm font-serif font-bold text-stone-900">
              {t('Културен постер', 'Poster Image')}
            </h2>
            <button
              onClick={handleLoadSample}
              className="text-xs text-blue-900 hover:underline font-semibold cursor-pointer"
            >
              {t('Вчитај демо постер од Скопје', 'Load Sample Poster')}
            </button>
          </div>

          {/* Image Display */}
          <div className="relative rounded-lg overflow-hidden border border-stone-300 bg-stone-100 flex items-center justify-center min-h-[380px] max-h-[480px]">
            {posterImage ? (
              <img
                src={posterImage}
                alt="Cultural Event Poster"
                className="w-full h-full object-contain max-h-[480px]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center p-6 text-stone-400 space-y-2">
                <Camera className="w-10 h-10 mx-auto" />
                <p className="text-xs">{t('Нема избрано слика', 'No poster selected')}</p>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 p-4">
                <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold">{t('OCR & AI Анализа на текст...', 'Extracting Poster Typography...')}</p>
                  <p className="text-xs text-stone-300 font-mono">
                    {t('Препознавање на македонска кирилица и датуми', 'Reading Macedonian Cyrillic and schedule')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-300 hover:border-stone-400 rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors">
              <Upload className="w-5 h-5 text-stone-500 mb-1" />
              <span className="text-xs font-medium text-stone-700">
                {t('Прикачи своја фотографија од постер', 'Upload your own poster image')}
              </span>
              <span className="text-[10px] text-stone-600 font-mono">JPG, PNG, WebP (макс 10MB)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={() => triggerScan(posterImage || '')}
              disabled={isScanning || !posterImage}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 disabled:bg-stone-400 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('Скенирај го овој постер со OCR', 'Scan with Vision OCR')}</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): Extracted & Editable Fields */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">
                {t('Извлечени информации од постер', 'Extracted Event Fields')}
              </h2>
              <p className="text-xs text-stone-500">
                {t(
                  'Секое поле е целосно уредливо пред зачувување.',
                  'Every field is fully editable before saving.'
                )}
              </p>
            </div>
            {extractionMethod && (
              <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {extractionMethod}
              </span>
            )}
          </div>

          {scanStep === 'idle' ? (
            <div className="text-center py-12 space-y-3">
              <FileText className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {t(
                  'Притисни „Скенирај го овој постер“ на левата страна за да започне визуелната OCR екстракција.',
                  'Press "Scan with Vision OCR" to start extracting event metadata.'
                )}
              </p>
            </div>
          ) : scanStep === 'saved' ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-lg space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-emerald-950">
                  {t('Настанот е успешно зачуван!', 'Event Successfully Saved!')}
                </h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  {t(
                    'Сега овој настан е дел од твојата збирка и достапен во каталогот на Култура Квест.',
                    'The event is now stored in your passport and available for adventure generation.'
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('otkrij')}
                  className="px-5 py-2.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('Изгради авантура околу овој настан', 'Build Quest Around This Event')}</span>
                </button>
                <button
                  onClick={() => setScanStep('extracted')}
                  className="px-4 py-2.5 bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  {t('Уреди повторно', 'Edit Again')}
                </button>
              </div>
            </div>
          ) : (
            /* Editable Form */
            <div className="space-y-4 text-xs">
              {/* Event Title */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-stone-700 uppercase tracking-wider">
                    {t('Наслов на настан / Изложба', 'Event / Exhibition Title')}
                  </label>
                  {getConfidenceBadge('title')}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-md font-serif text-sm font-bold text-stone-900 focus:outline-none focus:border-blue-900"
                />
              </div>

              {/* Organizer & Venue in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-stone-700 uppercase tracking-wider">
                      {t('Организатор / Куратор', 'Organizer / Curator')}
                    </label>
                    {getConfidenceBadge('organizer')}
                  </div>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-md text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-stone-700 uppercase tracking-wider">
                      {t('Локација / Уметнички простор', 'Venue')}
                    </label>
                    {getConfidenceBadge('venue')}
                  </div>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-md text-stone-900"
                  />
                </div>
              </div>

              {/* Date & Times */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-stone-700 uppercase tracking-wider">
                      {t('Датум', 'Date')}
                    </label>
                    {getConfidenceBadge('date')}
                  </div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-md font-mono text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-stone-700 uppercase tracking-wider">
                      {t('Почеток', 'Start Time')}
                    </label>
                    {getConfidenceBadge('startTime')}
                  </div>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-md font-mono text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold text-stone-700 uppercase tracking-wider">
                      {t('Цена (МКД)', 'Price (MKD)')}
                    </label>
                    {getConfidenceBadge('priceMKD')}
                  </div>
                  <input
                    type="number"
                    value={priceMKD}
                    onChange={(e) => setPriceMKD(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-md font-mono text-stone-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase tracking-wider">
                  {t('Опис и културен контекст', 'Description & Cultural Context')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-md text-stone-900 leading-relaxed"
                />
              </div>

              {/* Accessibility info */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 uppercase tracking-wider">
                  {t('Информации за пристапност', 'Accessibility Notes')}
                </label>
                <input
                  type="text"
                  value={accessibilityInfo}
                  onChange={(e) => setAccessibilityInfo(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-md text-stone-900"
                />
              </div>

              {/* Save & Connect Actions */}
              <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <div className="text-stone-500 font-mono text-[11px]">
                  {t('Статус: Подготвено за верификација', 'Status: Ready for verification')}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEvent}
                    className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{t('Зачувај како верификуван настан', 'Save Verified Event')}</span>
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
