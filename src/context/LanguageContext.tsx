import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type Language,
  SUPPORTED_LANGUAGES,
  translations,
  type LanguageOption,
} from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  supportedLanguages: LanguageOption[];
  t: (path: string, fallback?: string) => string;
}

const LANGUAGE_STORAGE_KEY = 'outdrobe_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'en' || saved === 'bn' || saved === 'hi') {
        return saved;
      }
    } catch {
      // Ignore storage errors in restricted frames
    }
    return 'en';
  });

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // noop
    }
  }, [language]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // Ignore storage quota errors
    }
  };

  /**
   * Resolves nested dot-notation translation strings with graceful fallbacks.
   * e.g. t('nav.wardrobe') or t('dashboard.greeting')
   */
  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    // Fallback to English if translation is missing in the chosen language
    if (language !== 'en') {
      let enFallback: any = translations.en;
      for (const key of keys) {
        if (enFallback && typeof enFallback === 'object' && key in enFallback) {
          enFallback = enFallback[key];
        } else {
          enFallback = undefined;
          break;
        }
      }
      if (typeof enFallback === 'string') {
        return enFallback;
      }
    }

    return fallback || path;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
