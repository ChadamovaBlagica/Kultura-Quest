import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { CulturalProvider } from './context/CulturalContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HackathonTourBanner } from './components/HackathonTourBanner';

import { LandingPage } from './pages/LandingPage';
import { VecervaPage } from './pages/VecervaPage';
import { OtkrijPage } from './pages/OtkrijPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MapPage } from './pages/MapPage';
import { ScanPage } from './pages/ScanPage';
import { QuestsPage } from './pages/QuestsPage';
import { PassportPage } from './pages/PassportPage';
import { HiddenCulturePage } from './pages/HiddenCulturePage';
import { GuidePage } from './pages/GuidePage';
import { SubmitEventPage } from './pages/SubmitEventPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      setCurrentRoute(hash || 'home');
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route: string) => {
    window.location.hash = route === 'home' ? '' : route;
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'vecerva':
        return <VecervaPage navigate={navigate} />;
      case 'otkrij':
        return <OtkrijPage navigate={navigate} />;
      case 'discover':
        return <DiscoverPage navigate={navigate} />;
      case 'map':
        return <MapPage navigate={navigate} />;
      case 'scan':
        return <ScanPage navigate={navigate} />;
      case 'quests':
        return <QuestsPage navigate={navigate} />;
      case 'passport':
        return <PassportPage navigate={navigate} />;
      case 'hidden-culture':
        return <HiddenCulturePage navigate={navigate} />;
      case 'guide':
        return <GuidePage navigate={navigate} />;
      case 'submit-event':
        return <SubmitEventPage navigate={navigate} />;
      case 'admin':
        return <AdminPage navigate={navigate} />;
      case 'settings':
        return <SettingsPage navigate={navigate} />;
      case 'home':
      default:
        return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <LanguageProvider>
      <CulturalProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1917] selection:bg-[#1E40AF] selection:text-white">
          {/* Hackathon 90-Second Walkthrough Navigator */}
          <HackathonTourBanner navigate={navigate} />

          {/* Top Bar adhering strictly to Top Bar Contract */}
          <Navbar currentRoute={currentRoute} navigate={navigate} />

          {/* Main Content Area */}
          <main className="flex-1">
            {renderCurrentPage()}
          </main>

          {/* Footer with Unboxed Metadata */}
          <Footer navigate={navigate} />
        </div>
      </CulturalProvider>
    </LanguageProvider>
  );
}
