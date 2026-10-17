import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCulturalData } from '../context/CulturalContext';
import { Menu, X, Globe, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { passport } = useCulturalData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'mk' ? 'en' : 'mk');
  };

  const navLinks = [
    { route: 'vecerva', labelMK: 'Вечерва', labelEN: 'Tonight' },
    { route: 'otkrij', labelMK: 'Откриј (OTKRIJ)', labelEN: 'OTKRIJ Planner' },
    { route: 'discover', labelMK: 'Истражи', labelEN: 'Discover' },
    { route: 'map', labelMK: 'Карта', labelEN: 'Map' },
    { route: 'scan', labelMK: 'Скенирај', labelEN: 'Scan Poster' },
    { route: 'quests', labelMK: 'Мисии', labelEN: 'Quests' },
    { route: 'passport', labelMK: `Пасош (${passport.xp} XP)`, labelEN: `Passport (${passport.xp} XP)` },
  ];

  const handleNavClick = (route: string) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-xl font-bold tracking-tight text-stone-900 font-serif whitespace-nowrap shrink-0 group-hover:text-blue-900 transition-colors">
            KULTURA QUEST
          </span>
        </button>

        {/* Zone 2: 4-6 Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleNavClick(link.route)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer text-sm font-medium ${
                  isActive
                    ? 'text-blue-900 font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {language === 'mk' ? link.labelMK : link.labelEN}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action & Language Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors whitespace-nowrap cursor-pointer"
            title={t('Смени јазик', 'Switch language')}
          >
            <Globe className="w-3.5 h-3.5 text-stone-600" aria-hidden="true" />
            <span className="font-mono uppercase">{language === 'mk' ? 'EN' : 'МК'}</span>
          </button>

          <button
            onClick={() => handleNavClick('otkrij')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 rounded transition-colors whitespace-nowrap cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t('Нова авантура', 'New Quest')}</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-700 hover:text-stone-900 rounded transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF8F5] px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.route}
              onClick={() => handleNavClick(link.route)}
              className={`block w-full text-left py-2 px-3 text-sm rounded cursor-pointer ${
                currentRoute === link.route
                  ? 'bg-blue-50 text-blue-950 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {language === 'mk' ? link.labelMK : link.labelEN}
            </button>
          ))}
          <div className="pt-2 border-t border-stone-200 flex flex-col gap-2">
            <button
              onClick={() => handleNavClick('guide')}
              className="text-left py-2 px-3 text-sm text-stone-700 hover:bg-stone-100 rounded"
            >
              {t('AI Културен Водич', 'AI Cultural Guide')}
            </button>
            <button
              onClick={() => handleNavClick('hidden-culture')}
              className="text-left py-2 px-3 text-sm text-stone-700 hover:bg-stone-100 rounded"
            >
              {t('Скриена Култура', 'Hidden Culture')}
            </button>
            <button
              onClick={() => handleNavClick('submit-event')}
              className="text-left py-2 px-3 text-sm text-stone-700 hover:bg-stone-100 rounded"
            >
              {t('Предложи настан', 'Submit Event')}
            </button>
            <button
              onClick={() => handleNavClick('admin')}
              className="text-left py-2 px-3 text-sm text-stone-700 hover:bg-stone-100 rounded"
            >
              {t('Администрација', 'Admin')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
