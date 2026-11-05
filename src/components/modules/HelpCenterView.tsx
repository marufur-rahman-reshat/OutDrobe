import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  HelpCircle,
  Sparkles,
  BookOpen,
  Layers,
  Calendar,
  History,
  BarChart3,
  Settings,
  Shirt,
  RotateCcw,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { HELP_CATEGORIES, HELP_FAQS } from '../../data/helpCenterFaq';
import type { HelpCategory } from '../../types/help';
import type { AppSection } from '../../types/outdrobe';

interface HelpCenterViewProps {
  onNavigate?: (section: AppSection) => void;
  onStartTour?: () => void;
  isDemoMode?: boolean;
}

export const HelpCenterView: React.FC<HelpCenterViewProps> = ({
  onNavigate,
  onStartTour,
  isDemoMode,
}) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('all');
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(() => new Set(['what_is_outdrobe']));

  // Category Icon helper
  const getCategoryIcon = (categoryId: HelpCategory) => {
    switch (categoryId) {
      case 'getting_started':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'wardrobe':
        return <Shirt className="w-3.5 h-3.5" />;
      case 'builder':
        return <Layers className="w-3.5 h-3.5" />;
      case 'outfits':
        return <Compass className="w-3.5 h-3.5" />;
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'history':
        return <History className="w-3.5 h-3.5" />;
      case 'suggestions_stats':
        return <BarChart3 className="w-3.5 h-3.5" />;
      case 'settings':
        return <Settings className="w-3.5 h-3.5" />;
      case 'all':
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  // Filter FAQs based on active category and search query
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return HELP_FAQS.filter((faq) => {
      // Category match
      if (selectedCategory !== 'all' && faq.category !== selectedCategory) {
        return false;
      }

      // Query match (in active language and English fallback)
      if (!q) return true;

      const questionText = (faq.question[language] || faq.question.en || '').toLowerCase();
      const answerText = (faq.answer[language] || faq.answer.en || '').toLowerCase();
      const keywords = (faq.keywords[language] || faq.keywords.en || []).map((k) => k.toLowerCase());

      return (
        questionText.includes(q) ||
        answerText.includes(q) ||
        keywords.some((k) => k.includes(q) || q.includes(k))
      );
    });
  }, [searchQuery, selectedCategory, language]);

  // Toggle single FAQ accordion
  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand all visible FAQs
  const handleExpandAll = () => {
    setOpenFaqIds(new Set(filteredFaqs.map((f) => f.id)));
  };

  // Collapse all
  const handleCollapseAll = () => {
    setOpenFaqIds(new Set());
  };

  // Clear search and reset category
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Count helper for category badges
  const getCategoryCount = (categoryId: HelpCategory) => {
    if (categoryId === 'all') return HELP_FAQS.length;
    return HELP_FAQS.filter((f) => f.category === categoryId).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="border-b border-[#E5E0D8] dark:border-[#2E312A] pb-6 sm:pb-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#EBF0EC] dark:bg-[#252C26] text-[#354938] dark:text-[#88A88E] border border-[#CBD8CD] dark:border-[#38463B] mb-3">
            <BookOpen className="w-3 h-3 text-[#526B56] dark:text-[#88A88E]" />
            <span>{t('helpCenter.eyebrow', 'Knowledge Base & User Guide')}</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-medium tracking-tight text-[#1C1D1A] dark:text-[#F4F2ED] leading-tight">
            {t('helpCenter.heading', 'How can we help you?')}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#5C5E58] dark:text-[#A3A69D] leading-relaxed">
            {t(
              'helpCenter.description',
              'Explore step-by-step guides, feature tutorials, and answers to common questions about organizing your digital wardrobe.'
            )}
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="mt-6 relative max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#73766E] dark:text-[#8C8F87]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('helpCenter.searchPlaceholder', 'Search questions, features, or topics...')}
            aria-label={t('helpCenter.searchAriaLabel', 'Search Help Center questions')}
            className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm bg-white dark:bg-[#1E201C] border border-[#D8D3C8] dark:border-[#2E312A] text-[#1C1D1A] dark:text-[#F4F2ED] placeholder-[#8C8F87] dark:placeholder-[#73766E] focus:outline-none focus:ring-2 focus:ring-[#526B56] dark:focus:ring-[#88A88E] shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#73766E] hover:text-[#1C1D1A] dark:hover:text-white cursor-pointer"
              title={t('helpCenter.clearSearch', 'Clear search')}
              aria-label={t('helpCenter.clearSearch', 'Clear search')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Rack */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 max-w-full scrollbar-none">
            {HELP_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#1C1D1A] text-white dark:bg-[#526B56] dark:text-white shadow-2xs'
                      : 'bg-white dark:bg-[#1E201C] text-[#5C5E58] dark:text-[#A3A69D] border border-[#E5E0D8] dark:border-[#2E312A] hover:bg-[#FAF8F5] dark:hover:bg-[#252822] hover:text-[#1C1D1A] dark:hover:text-[#F4F2ED]'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{t(cat.translationKey, cat.defaultLabel)}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F2EFE9] dark:bg-[#2E312A] text-[#73766E] dark:text-[#8C8F87]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expand / Collapse Controls */}
          {filteredFaqs.length > 0 && (
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <button
                type="button"
                onClick={handleExpandAll}
                className="text-[#5C5E58] dark:text-[#A3A69D] hover:text-[#1C1D1A] dark:hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                {t('helpCenter.expandAll', 'Expand All')}
              </button>
              <span className="text-[#C2BEB5] dark:text-[#3D4038]">•</span>
              <button
                type="button"
                onClick={handleCollapseAll}
                className="text-[#5C5E58] dark:text-[#A3A69D] hover:text-[#1C1D1A] dark:hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                {t('helpCenter.collapseAll', 'Collapse All')}
              </button>
            </div>
          )}
        </div>

        {/* Results Count Banner */}
        <div className="text-xs text-[#73766E] dark:text-[#8C8F87] font-mono">
          {t('helpCenter.showingResults', 'Showing {count} of {total} questions')
            .replace('{count}', String(filteredFaqs.length))
            .replace('{total}', String(HELP_FAQS.length))}
        </div>
      </div>

      {/* Accordion FAQ List */}
      {filteredFaqs.length > 0 ? (
        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaqIds.has(faq.id);
            const question = faq.question[language] || faq.question.en;
            const answer = faq.answer[language] || faq.answer.en;
            const categoryMeta = HELP_CATEGORIES.find((c) => c.id === faq.category);

            return (
              <div
                key={faq.id}
                className="rounded-xl border border-[#E5E0D8] dark:border-[#2E312A] bg-white dark:bg-[#1E201C] overflow-hidden transition-all duration-150 shadow-2xs"
              >
                <h3>
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF8F5] dark:hover:bg-[#252822] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-md bg-[#FAF8F5] dark:bg-[#252822] border border-[#E5E0D8] dark:border-[#2E312A] flex items-center justify-center text-[#526B56] dark:text-[#88A88E] shrink-0 text-xs">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </span>
                      <span className="font-editorial text-base sm:text-lg font-medium text-[#1C1D1A] dark:text-[#F4F2ED] leading-snug">
                        {question}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {categoryMeta && (
                        <span className="hidden md:inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#F2EFE9] dark:bg-[#2E312A] text-[#73766E] dark:text-[#8C8F87]">
                          {t(categoryMeta.translationKey, categoryMeta.defaultLabel)}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-[#73766E] dark:text-[#8C8F87] transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    className="px-5 pb-5 pt-1 text-sm text-[#5C5E58] dark:text-[#D8D5CD] leading-relaxed border-t border-[#EFECE6] dark:border-[#282B24] animate-in fade-in duration-150"
                  >
                    <p className="whitespace-pre-line mt-2">{answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-6 rounded-2xl bg-white dark:bg-[#1E201C] border border-[#E5E0D8] dark:border-[#2E312A] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] dark:bg-[#252822] border border-[#E5E0D8] dark:border-[#2E312A] flex items-center justify-center mx-auto text-[#73766E] dark:text-[#8C8F87]">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-editorial text-xl font-medium text-[#1C1D1A] dark:text-[#F4F2ED]">
            {t('helpCenter.noResultsTitle', 'No questions match your search')}
          </h3>
          <p className="text-xs sm:text-sm text-[#73766E] dark:text-[#8C8F87] max-w-md mx-auto">
            {t(
              'helpCenter.noResultsDesc',
              'Try checking your spelling, using different keywords, or resetting your category filter.'
            )}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#526B56] hover:bg-[#435947] text-white transition-colors cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('helpCenter.resetFilters', 'Reset Search & Filters')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Guided Tour & Demo Mode Interactive Tip Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F2EFE9] dark:bg-[#242721] border border-[#E5E0D8] dark:border-[#2E312A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#526B56] dark:text-[#88A88E]" />
            <h4 className="font-editorial text-base sm:text-lg font-semibold text-[#1C1D1A] dark:text-[#F4F2ED]">
              {t('helpCenter.helpfulTipTitle', 'Need interactive guidance?')}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[#5C5E58] dark:text-[#A3A69D] leading-relaxed">
            {t(
              'helpCenter.helpfulTipDesc',
              'OutDrobe provides an interactive Guided Product Tour in Demo Mode to walk you through each core feature step by step.'
            )}
          </p>
        </div>

        {onStartTour && isDemoMode && (
          <button
            type="button"
            onClick={onStartTour}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#526B56] hover:bg-[#435947] text-white transition-colors shrink-0 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('helpCenter.exploreTourBtn', 'Explore Demo Mode & Tour')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
