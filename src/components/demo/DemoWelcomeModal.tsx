import React, { useEffect, useRef } from 'react';
import { ArrowRight, Compass, Sparkles, X, Layers, Calendar, Shirt } from 'lucide-react';
import { DEMO_USER_PROFILE } from '../../data/demoWardrobeData';
import { useLanguage } from '../../context/LanguageContext';

interface DemoWelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onExploreOnOwn: () => void;
  onExitDemo: () => void;
}

export const DemoWelcomeModal: React.FC<DemoWelcomeModalProps> = ({
  isOpen,
  onStartTour,
  onExploreOnOwn,
  onExitDemo,
}) => {
  const { t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExploreOnOwn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onExploreOnOwn]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-welcome-title"
      aria-describedby="demo-welcome-desc"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1C1D1A]/55 backdrop-blur-xs transition-opacity"
        onClick={onExploreOnOwn}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className="relative bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl shadow-2xl max-w-xl w-full p-7 sm:p-9 text-[#1C1D1A] z-10 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle Close to Explore button */}
        <button
          type="button"
          onClick={onExploreOnOwn}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#73766E] hover:text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
          aria-label={t('tour.exploreOnOwnBtn', 'Explore on My Own')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Eyebrow Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-semibold bg-[#EBF0EC] text-[#354938] border border-[#CBD8CD]">
            <Sparkles className="w-3 h-3 text-[#526B56]" />
            {t('common.demoMode', 'Live Demo Experience')}
          </span>
          <span className="text-xs text-[#73766E]">{t('common.readOnlyDemo', 'Interactive Preview')}</span>
        </div>

        {/* Welcome Headline */}
        <h2
          id="demo-welcome-title"
          className="font-editorial text-3xl sm:text-4xl font-medium tracking-tight text-[#1C1D1A]"
        >
          {t('tour.welcomeTitle', 'Welcome to OutDrobe')}
        </h2>

        {/* Supporting Text */}
        <p className="mt-1 text-base font-medium text-[#526B56]">
          {t('tour.welcomeSubtitle', 'Discover how your digital wardrobe works.')}
        </p>

        {/* Short Description */}
        <p id="demo-welcome-desc" className="mt-3 text-sm text-[#5C5E58] leading-relaxed">
          {t(
            'tour.welcomeDesc',
            'You are exploring a pre-populated interactive demo wardrobe curated for Claire Vance. Follow the quick guided tour to see how garments, outfits, and calendar scheduling flow together seamlessly.'
          )}
        </p>

        {/* Capsule Profile Preview Card */}
        <div className="mt-5 p-4 rounded-xl bg-[#F2EFE9] border border-[#E5E0D8] space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#526B56] text-white flex items-center justify-center font-editorial text-base font-semibold">
                {DEMO_USER_PROFILE.displayName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#1C1D1A]">
                  {DEMO_USER_PROFILE.displayName}
                </p>
                <p className="text-[11px] text-[#73766E]">{DEMO_USER_PROFILE.styleNote}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#526B56] border border-[#D8D3C8] shrink-0">
              Demo Closet
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E5E0D8] text-center">
            <div className="p-2 rounded bg-white border border-[#E5E0D8]/60">
              <div className="flex items-center justify-center gap-1 text-[#73766E] mb-0.5">
                <Shirt className="w-3 h-3 text-[#526B56]" />
                <span className="text-[10px] uppercase font-mono tracking-wider">{t('nav.wardrobe', 'Garments')}</span>
              </div>
              <p className="font-mono text-sm font-semibold text-[#1C1D1A]">9 Pieces</p>
            </div>
            <div className="p-2 rounded bg-white border border-[#E5E0D8]/60">
              <div className="flex items-center justify-center gap-1 text-[#73766E] mb-0.5">
                <Layers className="w-3 h-3 text-[#526B56]" />
                <span className="text-[10px] uppercase font-mono tracking-wider">{t('nav.outfits', 'Outfits')}</span>
              </div>
              <p className="font-mono text-sm font-semibold text-[#1C1D1A]">4 Looks</p>
            </div>
            <div className="p-2 rounded bg-white border border-[#E5E0D8]/60">
              <div className="flex items-center justify-center gap-1 text-[#73766E] mb-0.5">
                <Calendar className="w-3 h-3 text-[#526B56]" />
                <span className="text-[10px] uppercase font-mono tracking-wider">{t('nav.calendar', 'Schedule')}</span>
              </div>
              <p className="font-mono text-sm font-semibold text-[#1C1D1A]">5 Plans</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={onStartTour}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors cursor-pointer shadow-xs"
          >
            <span>{t('tour.startTourBtn', 'Start Guided Tour')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onExploreOnOwn}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#73766E]" />
            <span>{t('tour.exploreOnOwnBtn', 'Explore on My Own')}</span>
          </button>
        </div>

        {/* Clear Exit Demo Action */}
        <div className="mt-4 pt-4 border-t border-[#E5E0D8] flex items-center justify-between text-xs text-[#73766E]">
          <span>{t('common.readOnlyDemo', 'Read-only preview · Zero login required')}</span>
          <button
            type="button"
            onClick={onExitDemo}
            className="font-medium text-[#73766E] hover:text-[#1C1D1A] underline underline-offset-2 transition-colors cursor-pointer"
          >
            {t('demo.exitPrompt', 'Exit Demo & Return to Home')}
          </button>
        </div>
      </div>
    </div>
  );
};
