'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getLandingNavItems } from '@/app/commonComponents/navbarComponents/navItems';
import translationData from '@/app/commonComponents/translation';
import { LandingNavItem } from '@/app/commonComponents/utils/Types/navbar';

interface LandingNavbarProps {
  language: 'en' | 'ceb';
  setLanguage: (lang: 'en' | 'ceb') => void;
  onLogoClick?: () => void;
  isLoginOpen?: boolean;
  setIsLoginOpen?: (open: boolean) => void;
  isCalculationOpen?: boolean;
  setIsCalculationOpen?: (open: boolean) => void;
  isBlurred?: boolean;
}

export default function LandingNavbar({ 
  language, 
  setLanguage, 
  onLogoClick,
  isLoginOpen: parentIsLoginOpen,
  setIsLoginOpen: parentSetIsLoginOpen,
  isCalculationOpen: parentIsCalculationOpen,
  setIsCalculationOpen: parentSetIsCalculationOpen,
  isBlurred = false
}: LandingNavbarProps) {

  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // State wiring: prefer parent state when provided, fallback to local
  const [localIsCalculationOpen, setLocalIsCalculationOpen] = useState(false);
  const [localIsLoginOpen, setLocalIsLoginOpen] = useState(false);
  
  const isCalculationOpen = parentIsCalculationOpen !== undefined ? parentIsCalculationOpen : localIsCalculationOpen;
  const setIsCalculationOpen = parentSetIsCalculationOpen || setLocalIsCalculationOpen;
  const isLoginOpen = parentIsLoginOpen !== undefined ? parentIsLoginOpen : localIsLoginOpen;
  const setIsLoginOpen = parentSetIsLoginOpen || setLocalIsLoginOpen;

  // Paths that only show language toggle + login button + loan simulator
  const minimalPaths = ['/userPage/publicPage/applyLoan'];
  const isMinimalNavbar = minimalPaths.some(path => pathname.startsWith(path));

  // Smooth scroll (used for full nav)
  const smoothScrollTo = (elementId: string) => {
    if (typeof window === 'undefined') return; 
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };  

  const navItems: LandingNavItem[] = getLandingNavItems(language, smoothScrollTo, setIsCalculationOpen);
  const pub = translationData.publicTranslation[language];

  return (
    <header className={`w-full bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-md sticky top-0 z-50 ${isBlurred ? 'blur-sm' : ''} transition-all duration-150`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2">
            <Image
              src="/logo/VistulaLogo.png"
              alt="Vistula Logo"
              width={30}
              height={20}
              priority
              className="object-contain"
            />
            <span className="text-sm font-semibold text-gray-700 tracking-tight">
              VLSystem
            </span>
          </Link>

          

          {/* ✅ Minimal navbar (userPage, publicPage, applyLoan) */}
          {isMinimalNavbar ? (
            <>
              {/* Desktop minimal nav */}
              <div className="hidden sm:flex items-center gap-6">
                {/* Loan Simulator button */}
                <button
                  onClick={() => setIsCalculationOpen(true)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  {language === 'en' ? 'Loan Simulation' : 'Simulasyon sa Pahulam'}
                </button>

                {/* Language toggle */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={language === 'ceb'}
                    onChange={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
                  />
                  <div className="relative w-12 h-6 bg-gray-300 rounded-full transition-all">
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${language === 'ceb' ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {language === 'en' ? pub.english : pub.cebuano}
                  </span>
                </label>

                {/* Login button */}
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {pub.login}
                </button>
              </div>

              {/* 📱 Mobile menu button for minimal navbar */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              >
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* 🌐 Full desktop nav */}
              <nav className="hidden sm:flex items-center gap-9">
                {/* Language toggle */}
                <label className="flex items-center cursor-pointer mr-2">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={language === 'ceb'}
                    onChange={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
                  />
                  <div className="relative w-12 h-6 bg-gray-300 rounded-full transition-all">
                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${language === 'ceb' ? 'translate-x-6' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {language === 'en' ? pub.english : pub.cebuano}
                  </span>
                </label>

                {/* Loan simulator */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navItems[0].onClick && navItems[0].onClick();
                  }}
                  className="text-sm font-medium text-black hover:text-gray-900 transition"
                >
                  {navItems[0].name}
                </button>

                {/* Section links */}
                {navItems.slice(1).map((item) => (
                  <button
                    key={item.name}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.onClick) item.onClick();
                    }}
                    className="text-sm font-medium text-black hover:text-gray-900 transition"
                  >
                    {item.name}
                  </button>
                ))}

                {/* Login button */}
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  {pub.login}
                </button>
              </nav>

              {/* 📱 Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              >
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* 📱 Mobile menu for minimal navbar (apply loan pages) */}
        {isMinimalNavbar && isMenuOpen && (
          <div className="sm:hidden mt-4 pb-3 border-t border-gray-200">
            <div className="pt-4 flex flex-col gap-4">
              {/* Loan Simulator button */}
              <button
                onClick={() => {
                  setIsCalculationOpen(true);
                  setIsMenuOpen(false);
                }}
                className="text-left text-base font-medium text-gray-900 hover:text-gray-700 py-2"
              >
                {language === 'en' ? 'Loan Simulation' : 'Simulasyon sa Pahulam'}
              </button>

              {/* Language toggle */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={language === 'ceb'}
                  onChange={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
                />
                <div className="relative w-12 h-6 bg-gray-300 rounded-full transition-all">
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${language === 'ceb' ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {language === 'en' ? pub.english : pub.cebuano}
                </span>
              </label>

              {/* Login button */}
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition text-center"
              >
                {pub.login}
              </button>
            </div>
          </div>
        )}

        {/* 📱 Mobile menu (shown only when not minimal) */}
        {!isMinimalNavbar && (
          <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'} mt-4`}>
            <div className="flex flex-col gap-4">
              {/* Language toggle */}
              <label className="flex items-center cursor-pointer mb-2">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={language === 'ceb'}
                  onChange={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
                />
                <div className="relative w-12 h-6 bg-gray-300 rounded-full transition-all">
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all ${language === 'ceb' ? 'translate-x-6' : ''}`}></div>
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900">
                  {language === 'en' ? pub.english : pub.cebuano}
                </span>
              </label>

              {/* Loan simulator */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navItems[0].onClick && navItems[0].onClick();
                  setIsMenuOpen(false);
                }}
                className="text-base font-medium text-gray-900 hover:text-gray-700 text-left"
              >
                {navItems[0].name}
              </button>

              {/* Section links */}
              {navItems.slice(1).map((item) => (
                <button
                  key={item.name + '-mobile'}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className="text-base font-medium text-gray-900 hover:text-gray-700 text-left"
                >
                  {item.name}
                </button>
              ))}

              {/* Login button */}
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setIsMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition w-full"
              >
                {pub.login}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
