import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { CulturalCategory } from '../types';
import {
  FilePlus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SubmitEventProps {
  navigate: (route: string) => void;
}

export const SubmitEventPage: React.FC<SubmitEventProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const { submitEvent } = useCulturalData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('21:00');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<CulturalCategory>('gallery');
  const [priceMKD, setPriceMKD] = useState('0');
  const [sourceUrl, setSourceUrl] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !venue.trim() || !organizerName.trim()) {
      setValidationError(
        t('Ве молиме пополнете ги сите задолжителни полиња (наслов, датум, локација, организатор).',
          'Please fill all required fields (title, date, venue, organizer).')
      );
      return;
    }

    submitEvent({
      title,
      description,
      date,
      startTime,
      endTime,
      venue,
      address: address || 'Скопје',
      category,
      priceMKD: parseInt(priceMKD, 10) || 0,
      sourceUrl: sourceUrl || 'https://kulturaquest.mk',
      organizerName,
      organizerEmail: organizerEmail || 'info@kulturaquest.mk',
    });

    setIsSubmitted(true);
    setValidationError('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-stone-200 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-stone-500 font-semibold">
          <FilePlus className="w-4 h-4 text-blue-900" />
          <span>{t('ЗА НЕЗАВИСНИ УМЕТНИЦИ & ОРГАНИЗАТОРИ', 'FOR ARTISTS & CURATORS')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          {t('Предложи културен настан во Скопје', 'Submit a Cultural Event in Skopje')}
        </h1>
        <p className="text-xs text-stone-600 leading-relaxed">
          {t(
            'KULTURA QUEST е отворена платформа за независни галерии, театри и автори. Сите поднесоци се разгледуваат од тимот пред верификација.',
            'KULTURA QUEST promotes grassroots cultural spaces. All submissions enter verification review before public broadcast.'
          )}
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-emerald-950">
              {t('Настанот е успешно поднесен за преглед!', 'Event Submitted for Verification!')}
            </h2>
            <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
              {t(
                'Твојот настан влезе во администраторскиот панел со статус „Во очекување на преглед“. Можеш да го провериш во Администрација.',
                'Your event has been recorded with "Pending Review" status. You can review it inside the Admin panel.'
              )}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('admin')}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
            >
              {t('Отвори Администрација →', 'Open Admin Review →')}
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setTitle('');
                setDescription('');
              }}
              className="px-4 py-2 bg-white border border-stone-300 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-50 cursor-pointer"
            >
              {t('Поднеси нов настан', 'Submit Another')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-xl p-6 space-y-5 text-xs shadow-xs">
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 uppercase tracking-wider block">
              {t('Наслов на настан / изложба *', 'Event / Exhibition Title *')}
            </label>
            <input
              type="text"
              required
              placeholder={t('на пр. Акустична поетска вечер во Дебар Маало', 'e.g. Acoustic Poetry Night')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-md font-serif text-sm font-bold text-stone-900 focus:outline-none focus:border-blue-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Категорија *', 'Category *')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2 border border-stone-300 rounded-md bg-stone-50 text-stone-900 cursor-pointer"
              >
                <option value="theme_night">{t('Вечерва & Тематска вечер', 'Tonight & Theme Night')}</option>
                <option value="nightlife">{t('Ноќен живот & Свирка', 'Nightlife & Live Gig')}</option>
                <option value="gallery">{t('Галерија & Изложба', 'Gallery & Exhibition')}</option>
                <option value="museum">{t('Музеј', 'Museum')}</option>
                <option value="theatre">{t('Театар & Современ танц', 'Theatre & Dance')}</option>
                <option value="workshop">{t('Работилница & Занаети', 'Workshop & Craft')}</option>
                <option value="independent_space">{t('Независен простор', 'Indie Space')}</option>
                <option value="literary">{t('Книжевност & Поезија', 'Literature & Poetry')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Влезна цена во МКД (0 = бесплатно) *', 'Admission in MKD (0 = Free) *')}
              </label>
              <input
                type="number"
                min="0"
                value={priceMKD}
                onChange={(e) => setPriceMKD(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md font-mono text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Датум на настан *', 'Date *')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md font-mono text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Почеток *', 'Start Time *')}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md font-mono text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Крај (опционално)', 'End Time (optional)')}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md font-mono text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Локација / Уметнички простор *', 'Venue Name *')}
              </label>
              <input
                type="text"
                required
                placeholder={t('на пр. Галерија Прима, Дебар Маало', 'e.g. Prima Gallery')}
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Точна адреса во Скопје', 'Address in Skopje')}
              </label>
              <input
                type="text"
                placeholder={t('на пр. ул. Орце Николов 108', 'e.g. Orce Nikolov 108')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md text-stone-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 uppercase tracking-wider block">
              {t('Опис на настанот и зошто вреди да се доживее *', 'Description & Significance *')}
            </label>
            <textarea
              rows={3}
              required
              placeholder={t('Краток опис за кураторскиот концепт, изведувачите или програмата...', 'Summary of the curators, artists, or programme...')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-stone-300 rounded-md text-stone-900 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Име на организатор / колектив *', 'Organizer Name *')}
              </label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md text-stone-900"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 uppercase tracking-wider block">
                {t('Контакт е-пошта *', 'Contact Email *')}
              </label>
              <input
                type="email"
                required
                value={organizerEmail}
                onChange={(e) => setOrganizerEmail(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-md text-stone-900"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <span className="text-[11px] font-mono text-stone-500">
              {t('Новите поднесоци добиваат статус „Во очекување на преглед“', 'Submissions enter pending review')}
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
            >
              {t('Поднеси настан за преглед', 'Submit Event')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
