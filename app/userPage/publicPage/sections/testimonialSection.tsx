'use client';

import React from 'react';
import translations from '@/app/commonComponents/translation';

// Props interface for testimonial section component
export interface TestimonialSectionProps {
  language: 'en' | 'ceb';
}

/**
 * Testimonial section component displaying customer testimonials
 * Features bilingual content with hover animations
 * @param language - Language preference for content display
 * @returns JSX element containing the testimonial section
 */
const TestimonialSection: React.FC<TestimonialSectionProps> = ({ language }) => {
  // Get translations for current language
  const t = translations.landingPageTranslation[language];

  // Testimonial data array with translations
  const testimonials = [
    {
      quote: t.t1Quote, 
      author: 'John Smith',
      role: t.t1Role,
    },
    {
      quote: t.t2Quote, 
      author: 'Sarah Johnson',
      role: t.t2Role,
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Heading */}
        <h2 className="text-center mb-16 text-4xl font-bold text-gray-800">
          {t.testimonyHeader}
        </h2>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-8 relative transition-transform transform hover:-translate-y-2 duration-300"
            >
              {/* Accent Circle */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-red-100 rounded-full z-[-1]" />

              {/* Testimonial Quote */}
              <p className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                {testimonial.quote}
              </p>

              {/* Author Info */}
              <div className="font-semibold text-gray-900">{testimonial.author}</div>
              <div className="text-sm text-gray-500">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
