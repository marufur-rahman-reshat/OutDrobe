import React, { useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { TourStep } from '../../types/tour';
import { useLanguage } from '../../context/LanguageContext';

interface DemoTourControlsProps {
  currentStep: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
  onRestart?: () => void;
  onGoToStep?: (index: number) => void;
}

export const DemoTourControls: React.FC<DemoTourControlsProps> = ({
  currentStep,
  currentStepIndex,
  totalSteps,
  isFirstStep,
  isLastStep,
  onPrev,
  onNext,
  onSkip,
  onFinish,
  onRestart,
  onGoToStep,
}) => {
  const { t } = useLanguage();

  // Keyboard-friendly interactions: Left/Right arrows and Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input or textarea is active
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (isLastStep) {
          onFinish();
        } else {
          onNext();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!isFirstStep) {
          onPrev();
        }
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFirstStep, isLastStep, onNext, onPrev, onFinish, onSkip]);

  const stepNumber = currentStepIndex + 1;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  // Localized title, badge, description
  const localizedBadge = t(`tour.stepBadge${stepNumber}`, currentStep.badge);
  const localizedTitle = t(`tour.stepTitle${stepNumber}`, currentStep.title);
  const localizedDesc = t(`tour.stepDesc${stepNumber}`, currentStep.description);

  return (
    <aside
      role="region"
      aria-label="Guided Product Tour Navigation"
      className="fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] sm:w-[500px] max-w-[500px] animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl shadow-xl p-3.5 sm:p-4 text-[#1C1D1A]">
        {/* Top Header: Badge, Step Counter, Restart & Skip */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[#E5E0D8]/80">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold bg-[#EBF0EC] text-[#354938] border border-[#CBD8CD] shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-[#526B56]" />
              <span className="truncate max-w-[120px]">{localizedBadge}</span>
            </span>
            <span className="font-mono text-[11px] text-[#73766E] whitespace-nowrap">
              {t('tour.stepCounter', 'Step')}{' '}
              <span className="font-semibold text-[#1C1D1A]">{stepNumber}</span>{' '}
              {t('tour.stepOf', 'of')} {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {onRestart && (
              <button
                type="button"
                onClick={onRestart}
                className="p-1 rounded text-[#73766E] hover:text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                title={t('tour.restartTour', 'Restart Tour from Step 1')}
                aria-label={t('tour.restartTour', 'Restart Tour from Step 1')}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={onSkip}
              className="text-[11px] font-medium text-[#73766E] hover:text-[#1C1D1A] px-1.5 py-0.5 rounded hover:bg-[#F2EFE9] transition-colors cursor-pointer whitespace-nowrap"
              aria-label={t('tour.skipTour', 'Skip guided product tour')}
            >
              {t('tour.skipTour', 'Skip Tour')}
            </button>
          </div>
        </div>

        {/* Step Progress Line / Indicator */}
        <div className="w-full bg-[#E5E0D8] h-[2.5px] rounded-full overflow-hidden mb-2.5">
          <div
            className="bg-[#526B56] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={stepNumber}
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-label={`Tour progress: step ${stepNumber} of ${totalSteps}`}
          />
        </div>

        {/* Step Content Preview & Navigation Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 py-0.5">
          <div className="min-w-0 flex-1 pr-1">
            <h3 className="font-editorial text-base sm:text-[17px] font-semibold tracking-tight text-[#1C1D1A] leading-tight truncate">
              {localizedTitle}
            </h3>
            <p className="text-[11px] text-[#5C5E58] mt-0.5 line-clamp-2 leading-relaxed">
              {localizedDesc}
            </p>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            {/* Previous Button */}
            <button
              type="button"
              onClick={onPrev}
              disabled={isFirstStep}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                isFirstStep
                  ? 'bg-transparent text-[#A3A69D] cursor-not-allowed border border-transparent'
                  : 'bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9]'
              }`}
              aria-label="Previous tour step"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>{t('common.prev', 'Prev')}</span>
            </button>

            {/* Next or Finish Button */}
            {isLastStep ? (
              <button
                type="button"
                onClick={onFinish}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                aria-label="Finish guided tour"
              >
                <Check className="w-3 h-3" />
                <span>{t('tour.finishTour', 'Finish')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                aria-label="Next tour step"
              >
                <span>{t('common.next', 'Next')}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Step dots navigation for direct access */}
        {onGoToStep && (
          <div className="flex items-center justify-center gap-1.5 pt-1.5 mt-1.5 border-t border-[#E5E0D8]/60">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onGoToStep(idx)}
                className={`h-1 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === currentStepIndex
                    ? 'w-4 bg-[#526B56]'
                    : idx < currentStepIndex
                    ? 'w-1.5 bg-[#7A8F7C]'
                    : 'w-1.5 bg-[#E5E0D8] hover:bg-[#C2BEB5]'
                }`}
                aria-label={`Jump to step ${idx + 1}`}
                aria-current={idx === currentStepIndex ? 'step' : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
