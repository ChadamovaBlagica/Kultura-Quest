import { CulturalEvent } from '../types';

export const isNightlifeEvent = (event: CulturalEvent): boolean =>
  event.category === 'nightlife' ||
  event.category === 'theme_night' ||
  event.category === 'theatre' ||
  event.category === 'festival' ||
  (!!event.startTime && event.startTime >= '18:00');

export const hasConfirmedEventPrice = (event: CulturalEvent): boolean =>
  event.isPriceConfirmed !== false && event.priceType !== 'unconfirmed';

export const getEventPriceLabel = (
  event: CulturalEvent,
  translate: (mk: string, en: string) => string
): string => {
  if (!hasConfirmedEventPrice(event)) {
    return event.priceMKD > 0
      ? translate(
          `Околу ${event.priceMKD} МКД (непотврдена проценка)`,
          `Approx. ${event.priceMKD} MKD (unconfirmed estimate)`
        )
      : translate('Цена непотврдена', 'Price unconfirmed');
  }

  if (event.priceMKD === 0 || event.priceType === 'free') {
    return translate('Бесплатен влез', 'Free entry');
  }

  return `${event.priceMKD} МКД`;
};

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getNightDateRange = (now = new Date()) => {
  const today = toDateKey(now);
  const tomorrow = toDateKey(addDays(now, 1));
  const dayOfWeek = now.getDay();

  const weekend =
    dayOfWeek === 0
      ? [today]
      : dayOfWeek === 6
        ? [today, tomorrow]
        : [toDateKey(addDays(now, 6 - dayOfWeek)), toDateKey(addDays(now, 7 - dayOfWeek))];

  return { today, tomorrow, weekend };
};
