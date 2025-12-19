'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import translations from '@/app/commonComponents/translation'; 

// Props interface for hero section component
interface HeroSectionProps {
  language?: 'en' | 'ceb';
  isTrackOpen?: boolean;
  setIsTrackOpen?: (open: boolean) => void;
}

/**
 * Hero section component with image carousel and call-to-action content
 * Features a Swiper carousel with company images and bilingual support
 * @param language - Language preference for content display
 * @param isTrackOpen - Parent state for track modal visibility
 * @param setIsTrackOpen - Parent function to control track modal visibility
 * @returns JSX element containing the hero section with carousel
 */
export default function HeroSection({ 
  language = 'en', 
  isTrackOpen: parentIsTrackOpen, 
  setIsTrackOpen: parentSetIsTrackOpen 
}: HeroSectionProps) {

  // Track applications modal state management
  const [localIsTrackOpen, setLocalIsTrackOpen] = useState(false);
  const isTrackOpen = parentIsTrackOpen !== undefined ? parentIsTrackOpen : localIsTrackOpen;
  const setIsTrackOpen = parentSetIsTrackOpen || setLocalIsTrackOpen;

  // Get translations for current language
  const t = translations.landingPageTranslation[language];

  // Image slides data for the carousel
  const slides = [
    { img: '../landingPagePics/image1.jpg', alt: 'Slide 1' },
    { img: '../landingPagePics/eq2.jpg', alt: 'Slide 2' },
    { img: '../landingPagePics/eq1.jpg', alt: 'Slide 3' },
    { img: '../landingPagePics/eq3.jpg', alt: 'Slide 4' },
    { img: '../landingPagePics/eq4.jpg', alt: 'Slide 5' },
    { img: '../landingPagePics/image2.jpg', alt: 'Slide 6' },
    { img: '../landingPagePics/eq5.jpg', alt: 'Slide 7' },
    { img: '../landingPagePics/image3.jpg', alt: 'Slide 8' },
    { img: '../landingPagePics/eq6.jpg', alt: 'Slide 9' },
  ];

  return (
    <section className="text-black relative">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 mt-20 flex flex-col md:flex-row items-center md:items-start gap-8 overflow-hidden">
        
        {/* LEFT CONTENT */}
        <div className="w-full md:w-1/2 md:text-left px-6 md:px-12">
          <p className="text-xl mb-2 select-none flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="text-3xl"
            >
              👋
            </motion.span>
            <span className="text-red-600 font-semibold">
              {t.topHeader}
            </span>            
          </p>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4 select-none">
            {t.header}
          </h1>

          <p className="text-xl text-gray-700 select-none">
            {t.subheader}
          </p>

          <div className="flex flex-col mt-10 sm:flex-row items-center justify-center md:justify-start gap-4">
            <Link
              href="/userPage/publicPage/applyLoan"
              className="bg-red-600 text-white px-6 py-3 rounded-full font-medium hover:bg-red-700 transition focus:outline-none active:bg-red-600"
            >
              {t.applyBtn}
            </Link>

            <button
              onClick={() => setIsTrackOpen(true)}
              className="bg-gray-600 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-700 transition focus:outline-none active:bg-gray-800"
            >
              {t.trackBtn}
            </button>
          </div>
        </div>

        {/* IMAGE SLIDER */}
        <div className="w-full md:w-3/6 relative">
          <div className="relative w-full h-64 sm:h-80 md:h-[400px] lg:h-[450px]">
            <Swiper
              modules={[Navigation, Autoplay, EffectFade]}
              effect="fade"
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              loop
              navigation={{
                nextEl: '.custom-next',
                prevEl: '.custom-prev',
              }}
              className="w-full rounded-2xl shadow-2xl overflow-hidden"
            >
              {slides.map((slide, index) => (
                <SwiperSlide key={index} className="relative">
                  <img
                    src={slide.img}
                    alt={slide.alt}
                    className="w-full h-64 sm:h-80 md:h-96 lg:h-[400px] object-cover select-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* GLASSMORPHIC ARROWS */}
            <div className="custom-prev absolute top-1/2 left-3 -translate-y-1/2 z-10 cursor-pointer backdrop-blur-md bg-white/40 hover:bg-white/60 p-3 rounded-full shadow-lg transition">
              ◀
            </div>
            <div className="custom-next absolute top-1/2 right-3 -translate-y-1/2 z-10 cursor-pointer backdrop-blur-md bg-white/40 hover:bg-white/60 p-3 rounded-full shadow-lg transition">
              ▶
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
