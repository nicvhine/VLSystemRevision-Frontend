import { useState, useEffect} from "react";
import translations from "@/app/commonComponents/translation";

export const useTranslation = () => {
    const [language, setLanguage] = useState<"en" | "ceb">("en");
  
    useEffect(() => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
      if (saved === 'en' || saved === 'ceb') setLanguage(saved);
      const onLang = (e: Event) => {
        try {
          const ev = e as CustomEvent;
          const lang = ev.detail?.language;
          if (lang === 'en' || lang === 'ceb') setLanguage(lang);
        } catch {}
      };
      const onStorage = () => {
        const l = localStorage.getItem('language');
        if (l === 'en' || l === 'ceb') setLanguage(l);
      };
      window.addEventListener('languageChange', onLang as EventListener);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener('languageChange', onLang as EventListener);
        window.removeEventListener('storage', onStorage);
      };
    }, []);

      const s = translations.sysadTranslation[language];

    return{
        s,
        language
    }
}