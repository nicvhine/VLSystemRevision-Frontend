'use client';

import React from 'react';
import { motion } from 'framer-motion';
import translations from '@/app/commonComponents/translation'; 

// Props interface for feature section component
export interface FeatureSectionProps {
  language: 'en' | 'ceb';
}

/**
 * Feature section component displaying company features and benefits
 * Features animated cards with icons and bilingual content
 * @param language - Language preference for content display
 * @returns JSX element containing the feature section
 */
const FeatureSection: React.FC<FeatureSectionProps> = ({ language }) => {
  // Get translations for current language
  const t = translations.landingPageTranslation[language];

  // Feature data array with translations
  const features = [
    {
      title: t.f1Title,
      description: t.f1Description,
      icon: '⚡',
    },
    {
      title: t.f2Title,
      description: t.f2Description,
      icon: '🔒',
    },
    {
      title: t.f3Title,
      description: t.f3Description,
      icon: '📍',
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-white to-gray-100">
      <div className="mx-auto px-6">
        {/* Animated Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl font-bold text-center text-gray-800 mb-16"
        >
          {language === 'en'
            ? 'Why Choose Vistula Lending Corporation?'
            : 'Ngano nga Pilion ang Vistula Lending Corporation?'}
        </motion.h2>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2 duration-300"
            >
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-5xl mb-4 text-red-600 inline-block"
              >
                {feature.icon}
              </motion.div>

              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
