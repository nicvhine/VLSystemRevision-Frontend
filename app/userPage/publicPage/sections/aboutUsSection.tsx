import translationData from '@/app/commonComponents/translation';

export interface AboutSectionProps {
  language: 'en' | 'ceb';
}

/**
 * About section component displaying company information, vision, and mission
 * Features bilingual content with responsive design
 * @param language - Language preference for content display
 * @returns JSX element containing the about section
 */
const AboutSection: React.FC<AboutSectionProps> = ({ language }) => {
  const pub = translationData.publicTranslation[language];

  return (
    <section id="about" className="py-24 bg-gray-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
          {pub.aboutUs}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-12">
          {pub.aboutUsDescription}
        </p>

        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            {pub.ourVision}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-12">
            {pub.ourVisionDescription}
          </p>

          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            {pub.ourMission}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {pub.ourMissionDescription}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
