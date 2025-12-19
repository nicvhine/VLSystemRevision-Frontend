import translationData from '@/app/commonComponents/translation';

// Props interface for footer component
interface FooterProps {
  language: 'en' | 'ceb';
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
}

/**
 * Footer component displaying company information, legal links, and contact details
 * Features bilingual content with responsive grid layout
 * @param language - Language preference for content display
 * @param onPrivacyClick - Callback for privacy policy click
 * @param onTermsClick - Callback for terms of service click
 * @returns JSX element containing the footer section
 */
export default function Footer({ language, onPrivacyClick, onTermsClick }: FooterProps) {
  const pub = translationData.publicTranslation[language];

  return (
    <footer id="footer" className="bg-black text-white py-12">
      <div className="container-custom mx-auto text-center">
        <div className="grid md:grid-cols-3 gap-8 items-center justify-center">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">VLSystem</h3>
            <p className="text-gray-400">
              {pub.empoweringHeader}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">{pub.legal}</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={onPrivacyClick}
                  className="footer-link hover:text-red-500 transition-colors cursor-pointer"
                >
                  {pub.privacyPolicy}
                </button>
              </li>
              <li>
                <button 
                  onClick={onTermsClick}
                  className="footer-link hover:text-red-500 transition-colors cursor-pointer"
                >
                  {pub.termsOfService}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">{pub.connect}</h4>
            <div className="space-y-2">
              <p>📞 +63912023122</p>
              <p>📩 vistulalending@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}