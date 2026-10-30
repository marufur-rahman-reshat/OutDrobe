import React, { useEffect, useMemo, useState } from 'react';
import { BookmarkPlus, RefreshCw } from 'lucide-react';
import type {
  ClothingItem,
  OccasionTag,
  Outfit,
  OutfitSuggestion,
} from '../../types/outdrobe';
import { outdrobeApi } from '../../services/api';
import { GarmentImage } from '../common/GarmentImage';

interface SuggestionsViewProps {
  wardrobe: ClothingItem[];
  onSaveOutfit: (payload: Partial<Outfit>) => Promise<void>;
}

const CLIMATES = ['Cool (8–13°C)', 'Mild (14–20°C)', 'Warm (21–28°C)'];
const OCCASION_OPTIONS: ('All' | OccasionTag)[] = [
  'All',
  'Daily Studio',
  'Professional',
  'Campus',
  'Weekend',
];

export const SuggestionsView: React.FC<SuggestionsViewProps> = ({
  wardrobe,
  onSaveOutfit,
}) => {
  const [occasion, setOccasion] = useState<'All' | OccasionTag>('All');
  const [climate, setClimate] = useState('Mild (14–20°C)');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];

  const wardrobeMap = useMemo(
    () => new Map<string, ClothingItem>(safeWardrobe.map((g) => [g.id, g])),
    [safeWardrobe]
  );

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const res = await outdrobeApi.getSuggestions(occasion, climate);
      setSuggestions(res.suggestions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [occasion, climate, wardrobe.length]);

  const handleSaveSuggested = async (sug: OutfitSuggestion) => {
    await onSaveOutfit({
      name: sug.title,
      occasion: sug.occasion,
      season: sug.season,
      itemIds: sug.itemIds,
      isFavorite: true,
      notes: sug.rationale,
    });
    setSavedNotice(`Saved "${sug.title}" to your Lookbook.`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <p className="text-xs font-medium text-[#526B56] mb-1">Rotation & Climate Pairings</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
            Outfit Suggestions
          </h1>
          <p className="mt-1 text-sm text-[#5C5E58]">
            Rule-based combinations prioritizing your least-worn garments and balanced neutral tones.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSuggestions}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Ideas
        </button>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-xl bg-[#EBF0EC] border border-[#CBD8CD] flex items-center justify-between gap-4 text-sm text-[#2D4030]">
          <span>{savedNotice}</span>
          <button
            type="button"
            onClick={() => setSavedNotice(null)}
            className="text-xs font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Context Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg overflow-x-auto w-fit max-w-full">
          {OCCASION_OPTIONS.map((occ) => (
            <button
              key={occ}
              type="button"
              onClick={() => setOccasion(occ)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                occasion === occ
                  ? 'bg-white text-[#1C1D1A] shadow-xs'
                  : 'text-[#5C5E58] hover:text-[#1C1D1A]'
              }`}
            >
              {occ === 'All' ? 'Any Occasion' : occ}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg overflow-x-auto w-fit max-w-full">
          {CLIMATES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setClimate(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                climate === c
                  ? 'bg-white text-[#1C1D1A] shadow-xs'
                  : 'text-[#5C5E58] hover:text-[#1C1D1A]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-96 rounded-xl bg-white border border-[#E5E0D8] p-6 animate-pulse"
            />
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {suggestions.map((sug) => {
            const pieces = sug.itemIds
              .map((id) => wardrobeMap.get(id))
              .filter((g): g is ClothingItem => Boolean(g));
            return (
              <article
                key={sug.id}
                className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#F2EFE9] p-3 grid grid-cols-2 grid-rows-2 gap-2">
                    {pieces.slice(0, 4).map((piece) => (
                      <div
                        key={piece.id}
                        className="rounded-lg overflow-hidden bg-white border border-[#E5E0D8]/60"
                      >
                        <GarmentImage
                          imageKey={piece.imageKey}
                          customImageUrl={piece.customImageUrl}
                          alt={piece.name}
                          colorHex={piece.colorHex}
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-[#73766E] mb-1">
                      <span>{sug.occasion}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{sug.temperatureLabel}</span>
                    </div>

                    <h3 className="font-sans text-lg font-semibold text-[#1C1D1A]">
                      {sug.title}
                    </h3>
                    <p className="mt-2 text-sm text-[#5C5E58] leading-relaxed">
                      {sug.rationale}
                    </p>

                    <p className="mt-3 text-xs text-[#526B56] font-medium">
                      {sug.rotationBenefit} · {sug.harmonyLabel}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#EFECE6]">
                  <button
                    type="button"
                    onClick={() => handleSaveSuggested(sug)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    Save to My Outfits
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-xl py-16 px-6 text-center">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
            Add at least one Top and one Bottom for suggestions
          </h2>
          <p className="mt-1.5 text-sm text-[#5C5E58]">
            Once your wardrobe has core upper and lower pieces, rotation pairings appear here.
          </p>
        </div>
      )}
    </div>
  );
};
