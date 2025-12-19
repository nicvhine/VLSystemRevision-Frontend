'use client';

import { useState, useEffect } from 'react';

// Section components
import HeroSection from './sections/heroSection';
import AboutUsSection from './sections/aboutUsSection';
import FeatureSection from './sections/featuresection';
import TestimonialSection from './sections/testimonialSection';
import TeamSection from './sections/teamSection';
import Footer from './sections/footer';

// Navigation component
import LandingNavbar from './navbar/landingNavbar';

// Modal components
import LoginModal from './loginForm/loginModal';
import SimulatorModal from './loanSimulator/loanSimulatorModal';
import TrackModal from './applicationTracker/trackModal';
import PrivacyContentModal from '@/app/commonComponents/modals/termsPrivacy/PrivacyContentModal';
import TermsContentModal from '@/app/commonComponents/modals/termsPrivacy/TermsContentModal';

export default function LandingPage() {
  // Language state for bilingual support
  const [language, setLanguage] = useState<'en' | 'ceb'>('en');
  
  // Page animation state
  const [pageLoaded, setPageLoaded] = useState(false);

  // Modal visibility states (exclusive)
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCalculationOpen, setIsCalculationOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Ensure only one modal is open at a time
  const openLogin = (open: boolean) => {
    setIsLoginOpen(open);
    if (open) {
      setIsCalculationOpen(false);
      setIsTrackOpen(false);
    }
  };
  const openCalculation = (open: boolean) => {
    setIsCalculationOpen(open);
    if (open) {
      setIsLoginOpen(false);
      setIsTrackOpen(false);
    }
  };
  const openTrack = (open: boolean) => {
    setIsTrackOpen(open);
    if (open) {
      setIsLoginOpen(false);
      setIsCalculationOpen(false);
    }
  };

  // Trigger page fade-in animation on component mount
  useEffect(() => {
    // Set default localStorage values if not already set
    if (!localStorage.getItem('role')) {
      localStorage.setItem('role', 'public');
    }
    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'en');
    }

    // Initialize language state from localStorage
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ceb';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }

    // Trigger page fade-in animation
    const timer = setTimeout(() => setPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle logo click - scrolls to top and triggers fade animation
   */
  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setPageLoaded(false);
    setTimeout(() => setPageLoaded(true), 100);
  };

  return (
    <>
      {/* Main Page Container */}
      <div
        className={`w-full bg-white transform transition-all duration-1000 ease-out ${
          pageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Navigation */}
        <LandingNavbar
          language={language}
          setLanguage={(lang) => {
            setLanguage(lang);
            localStorage.setItem('language', lang);
          }}
          onLogoClick={handleLogoClick}
          isLoginOpen={isLoginOpen}
          setIsLoginOpen={openLogin}
          isCalculationOpen={isCalculationOpen}
          setIsCalculationOpen={openCalculation}
        />

        {/* Main sections */}
        <HeroSection
          language={language}
          isTrackOpen={isTrackOpen}
          setIsTrackOpen={openTrack}
        />
        <FeatureSection language={language} />
        <TestimonialSection language={language} />

        <section id="team">
          <TeamSection language={language} />
        </section>

        <section id="about">
          <AboutUsSection language={language} />
        </section>

        <section id="footer">
          <Footer 
            language={language}
            onPrivacyClick={() => setIsPrivacyOpen(true)}
            onTermsClick={() => setIsTermsOpen(true)}
          />
        </section>
      </div>

      {/* Modals: login, simulator, tracker, privacy, terms */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => openLogin(false)}
        language={language}
      />
      <SimulatorModal
        isOpen={isCalculationOpen}
        onClose={() => openCalculation(false)}
        language={language}
      />
      <TrackModal
        isOpen={isTrackOpen}
        onClose={() => openTrack(false)}
        language={language}
      />
      {isPrivacyOpen && (
        <PrivacyContentModal
          language={language}
          onClose={() => setIsPrivacyOpen(false)}
        />
      )}
      {isTermsOpen && (
        <TermsContentModal
          language={language}
          onClose={() => setIsTermsOpen(false)}
        />
      )}
    </>
  );
}