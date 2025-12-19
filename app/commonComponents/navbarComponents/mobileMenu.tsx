'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import navbarTranslation from '../translation/navbarTranslation';
import { MobileMenuProps } from '../utils/Types/navbar';

const roleLabels: Record<string, string> = {
  borrower: 'Borrower',
  head: 'Head',
  manager: 'Manager',
  'loan officer': 'Loan Officer',
  'loanofficer': 'Loan Officer',
  'loan-officer': 'Loan Officer',
  collector: 'Collector',
  sysad: 'SysAd',
};

export default function MobileMenu({
  navItems,
  language,
  setLanguage,
  user,
  onOpenProfileSettings,
  onLogout,
}: MobileMenuProps) {
  const pathname = usePathname();
  const t = navbarTranslation[language];
  const initials = user?.name?.trim().charAt(0).toUpperCase() || 'U';
  const roleKey = (user?.role || '').toLowerCase();
  const roleLabel = roleLabels[roleKey] || user?.role || '';

  return (
    <div className="md:hidden mt-4 space-y-4">
      <div className="space-y-2">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center space-x-3 px-4">
          <label className="flex items-center cursor-pointer w-full justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="sr-only"
                checked={language === 'ceb'}
                onChange={() => setLanguage(language === 'en' ? 'ceb' : 'en')}
              />
              <div className="relative w-12 h-6 bg-gray-300 rounded-full transition">
                <div
                  className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition ${
                    language === 'ceb' ? 'translate-x-6' : ''
                  }`}
                />
              </div>
            </div>
            <span className="text-gray-900 ml-3 text-sm font-medium">
              {language === 'en' ? 'English' : 'Cebuano'}
            </span>
          </label>
        </div>
      </div>


    </div>
  );
}