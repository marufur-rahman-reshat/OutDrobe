import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export interface GuidancePoint {
  label: string;
  text: string;
}

interface TourSpotlightCalloutProps {
  stepNumber: number;
  stepTitle: string;
  stepBadge: string;
  headline: string;
  description: string;
  guidancePoints: GuidancePoint[];
  interactiveTip?: string;
  onNext?: () => void;
  nextLabel?: string;
  className?: string;
}

export const TourSpotlightCallout: React.FC<TourSpotlightCalloutProps> = ({
  stepNumber,
  stepTitle,
  stepBadge,
  headline,
  description,
  guidancePoints,
  interactiveTip,
  onNext,
  nextLabel = 'Next Step',
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label={`Tour Guide: ${stepTitle}`}
      className={`bg-white border-2 border-[#526B56] rounded-xl p-4 sm:p-5 shadow-sm transition-all duration-300 relative overflow-hidden ${className}`}
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#526B56] via-[#7A8F7C] to-[#526B56]" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2.5 flex-1">
          {/* Badge & Step indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#EBF0EC] text-[#354938] border border-[#CBD8CD]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#526B56] animate-pulse" />
              Tour Step {stepNumber} · {stepBadge}
            </span>
            <span className="text-xs text-[#73766E] font-medium">{stepTitle}</span>
          </div>

          {/* Headline & Description */}
          <div>
            <h3 className="font-editorial text-xl sm:text-2xl font-medium tracking-tight text-[#1C1D1A]">
              {headline}
            </h3>
            <p className="mt-0.5 text-xs sm:text-sm text-[#5C5E58] leading-relaxed max-w-3xl">
              {description}
            </p>
          </div>

          {/* Guidance Points Grid */}
          {guidancePoints.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {guidancePoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5E0D8] space-y-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-[#526B56] shrink-0" />
                    <span className="text-xs font-semibold text-[#1C1D1A]">{point.label}</span>
                  </div>
                  <p className="text-[11px] text-[#5C5E58] leading-snug pl-4.5">{point.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Interactive Tip */}
          {interactiveTip && (
            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[#F2EFE9] border border-[#D8D3C8] text-xs text-[#1C1D1A]">
              <Sparkles className="w-3.5 h-3.5 text-[#526B56] shrink-0" />
              <span className="font-medium text-[#526B56]">Interactive Exploration:</span>
              <span className="text-[#5C5E58]">{interactiveTip}</span>
            </div>
          )}
        </div>

        {/* Next step button */}
        {onNext && (
          <div className="shrink-0 self-end lg:self-center">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              <span>{nextLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
