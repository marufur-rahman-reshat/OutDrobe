import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme, type Theme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const ThemeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();
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

  const options: { value: Theme; label: string; icon: React.FC<{ className?: string }> }[] = [
    { value: 'light', label: t('common.themeLight', 'Light'), icon: Sun },
    { value: 'dark', label: t('common.themeDark', 'Dark'), icon: Moon },
    { value: 'system', label: t('common.themeSystem', 'System'), icon: Monitor },
  ];

  const currentIcon =
    theme === 'system' ? (
      <Monitor className="w-3.5 h-3.5" />
    ) : resolvedTheme === 'dark' ? (
      <Moon className="w-3.5 h-3.5 text-[#88A88E]" />
    ) : (
      <Sun className="w-3.5 h-3.5 text-[#526B56]" />
    );

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-[#1E201C] border border-[#E5E0D8] dark:border-[#2E312A] text-[#1C1D1A] dark:text-[#F4F2ED] hover:bg-[#FAF8F5] dark:hover:bg-[#252822] transition-colors cursor-pointer shadow-2xs"
        aria-label="Select color theme"
        aria-expanded={isOpen}
      >
        {currentIcon}
        <span className="hidden sm:inline capitalize text-[11px] text-[#5C5E58] dark:text-[#A3A69D]">
          {theme === 'system'
            ? t('common.themeSystem', 'Auto')
            : theme === 'dark'
            ? t('common.themeDark', 'Dark')
            : t('common.themeLight', 'Light')}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-32 rounded-xl bg-white dark:bg-[#1E201C] border border-[#E5E0D8] dark:border-[#2E312A] shadow-xl p-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          {options.map(({ value, label, icon: Icon }) => {
            const isSelected = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#EBF0EC] dark:bg-[#242C26] text-[#2F4432] dark:text-[#88A88E] font-medium'
                    : 'text-[#5C5E58] dark:text-[#A3A69D] hover:bg-[#FAF8F5] dark:hover:bg-[#252822] hover:text-[#1C1D1A] dark:hover:text-[#F4F2ED]'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#526B56] dark:text-[#88A88E]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
