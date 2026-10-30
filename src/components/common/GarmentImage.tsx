import React, { useState } from 'react';
import { GARMENT_PRESET_ASSETS } from '../../data/garmentAssets';

interface GarmentImageProps {
  imageKey: string;
  customImageUrl?: string;
  alt: string;
  colorHex?: string;
  className?: string;
}

export const GarmentImage: React.FC<GarmentImageProps> = ({
  imageKey,
  customImageUrl,
  alt,
  colorHex = '#7A8F7C',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const preset = GARMENT_PRESET_ASSETS[imageKey];
  const resolvedSrc = !hasError ? customImageUrl || preset?.src : undefined;
  const backdrop = preset?.backdropHex || '#EFECE6';

  if (resolvedSrc) {
    return (
      <div
        className={`relative overflow-hidden select-none ${className}`}
        style={{ backgroundColor: backdrop }}
      >
        <img
          src={resolvedSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.02]"
        />
      </div>
    );
  }

  // Bespoke Editorial Architectural Flat-Lay SVG Illustrations & Resilient Fallback
  const variant = preset?.svgIllustration;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden select-none p-6 ${className}`}
      style={{ backgroundColor: backdrop }}
      role="img"
      aria-label={alt}
    >
      {variant === 'poplin_shirt' && (
        <svg viewBox="0 0 200 240" className="w-4/5 h-4/5 drop-shadow-xs" fill="none">
          <path
            d="M66 38 L85 28 L100 42 L115 28 L134 38 L172 62 L156 105 L138 95 L138 206 L62 206 L62 95 L44 105 L28 62 Z"
            fill="#F9F8F4"
            stroke="#2C2E2B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M85 28 L100 54 L115 28" stroke="#2C2E2B" strokeWidth="1.75" fill="#EFECE4" />
          <line x1="100" y1="54" x2="100" y2="206" stroke="#D5D0C5" strokeWidth="1.5" />
          {[74, 102, 130, 158, 184].map((cy) => (
            <circle key={cy} cx="100" cy={cy} r="2.2" fill="#8C8A82" />
          ))}
          <rect x="112" y="88" width="18" height="22" stroke="#D5D0C5" strokeWidth="1.4" />
        </svg>
      )}

      {variant === 'ecru_denim' && (
        <svg viewBox="0 0 200 240" className="w-4/5 h-4/5 drop-shadow-xs" fill="none">
          <path
            d="M64 26 L136 26 L148 214 L108 214 L100 96 L92 214 L52 214 Z"
            fill="#E6DFCE"
            stroke="#2C2E2B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line x1="63" y1="42" x2="137" y2="42" stroke="#2C2E2B" strokeWidth="1.6" />
          <line x1="100" y1="42" x2="100" y2="96" stroke="#B6AD99" strokeWidth="1.5" />
          <path d="M64 56 Q80 62 82 42" stroke="#B6AD99" strokeWidth="1.4" fill="none" />
          <path d="M136 56 Q120 62 118 42" stroke="#B6AD99" strokeWidth="1.4" fill="none" />
          <circle cx="100" cy="34" r="2.6" fill="#5C5E58" />
        </svg>
      )}

      {variant === 'leather_tote' && (
        <svg viewBox="0 0 200 240" className="w-4/5 h-4/5 drop-shadow-xs" fill="none">
          <path
            d="M74 84 C74 36, 126 36, 126 84"
            stroke="#3B3F34"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M48 82 L152 82 L144 202 L56 202 Z"
            fill="#4A4F41"
            stroke="#252820"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <line x1="56" y1="98" x2="144" y2="98" stroke="#636958" strokeWidth="1.2" strokeDasharray="3 3" />
          <rect x="88" y="114" width="24" height="14" rx="2" fill="#3B3F34" stroke="#636958" strokeWidth="1" />
        </svg>
      )}

      {variant === 'moss_tee' && (
        <svg viewBox="0 0 200 240" className="w-4/5 h-4/5 drop-shadow-xs" fill="none">
          <path
            d="M76 34 L124 34 L132 46 L168 66 L152 104 L134 94 L134 198 L66 198 L66 94 L48 104 L32 66 L68 46 Z"
            fill="#596A5B"
            stroke="#2C352D"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <rect x="78" y="26" width="44" height="12" rx="2" fill="#4E5E50" stroke="#2C352D" strokeWidth="1.6" />
          {[78, 90, 102, 114, 122].map((x) => (
            <line key={x} x1={x} y1="44" x2={x} y2="196" stroke="#4D5C4F" strokeWidth="1" />
          ))}
        </svg>
      )}

      {!variant && (
        <svg viewBox="0 0 200 240" className="w-3/4 h-3/4" fill="none">
          <path
            d="M92 48 C92 36, 108 36, 108 46 C108 54, 100 56, 100 64 M42 96 L100 64 L158 96 Z"
            stroke="#5C5E58"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="54"
            y="96"
            width="92"
            height="104"
            rx="4"
            fill={colorHex}
            fillOpacity="0.82"
            stroke="#2C2E2B"
            strokeWidth="1.8"
          />
        </svg>
      )}
    </div>
  );
};
