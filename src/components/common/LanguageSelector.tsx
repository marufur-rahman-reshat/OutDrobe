import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../i18n/translations';

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-[#1E201C] border border-[#E5E0D8] dark:border-[#2E312A] text-[#1C1D1A] dark:text-[#F4F2ED] hover:bg-[#FAF8F5] dark:hover:bg-[#252822] transition-colors cursor-pointer shadow-2xs"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-[#526B56] dark:text-[#88A88E]" />
        <span className="text-[11px] font-medium text-[#1C1D1A] dark:text-[#F4F2ED]">
          {activeLang.nativeName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white dark:bg-[#1E201C] border border-[#E5E0D8] dark:border-[#2E312A] shadow-xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#EBF0EC] dark:bg-[#242C26] text-[#2F4432] dark:text-[#88A88E] font-medium'
                    : 'text-[#5C5E58] dark:text-[#A3A69D] hover:bg-[#FAF8F5] dark:hover:bg-[#252822] hover:text-[#1C1D1A] dark:hover:text-[#F4F2ED]'
                }`}
              >
                <div>
                  <div className="font-medium text-[#1C1D1A] dark:text-[#F4F2ED]">
                    {lang.nativeName}
                  </div>
                  <div className="text-[10px] text-[#73766E] dark:text-[#8C8F87]">
                    {lang.name}
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#526B56] dark:text-[#88A88E]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
