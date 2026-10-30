import React from 'react';
import { CalendarPlus, CheckCircle2, Heart, Trash2 } from 'lucide-react';
import type { ClothingItem, Outfit } from '../../types/outdrobe';
import { GarmentImage } from './GarmentImage';

interface OutfitCardProps {
  outfit: Outfit;
  wardrobeMap: Map<string, ClothingItem>;
  onToggleFavorite: (outfit: Outfit) => void;
  onSchedule: (outfit: Outfit) => void;
  onLogWearToday: (outfit: Outfit) => void;
  onDelete: (outfit: Outfit) => void;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  wardrobeMap,
  onToggleFavorite,
  onSchedule,
  onLogWearToday,
  onDelete,
}) => {
  const pieces = outfit.itemIds
    .map((id) => wardrobeMap.get(id))
    .filter((item): item is ClothingItem => Boolean(item));

  const previewPieces = pieces.slice(0, 4);

  return (
    <article className="group bg-white border border-[#E5E0D8] rounded-xl overflow-hidden flex flex-col transition-transform duration-150 ease-out hover:-translate-y-0.5">
      <div className="relative aspect-[4/3] bg-[#F2EFE9] p-3 grid grid-cols-2 grid-rows-2 gap-2">
        {previewPieces.map((piece) => (
          <div key={piece.id} className="rounded-lg overflow-hidden bg-white border border-[#E5E0D8]/60">
            <GarmentImage
              imageKey={piece.imageKey}
              customImageUrl={piece.customImageUrl}
              alt={piece.name}
              colorHex={piece.colorHex}
              className="w-full h-full"
            />
          </div>
        ))}
        {previewPieces.length < 4 &&
          Array.from({ length: 4 - previewPieces.length }).map((_, idx) => (
            <div
              key={`slot_${idx}`}
              className="rounded-lg bg-[#FAF8F5]/70 border border-dashed border-[#D8D3C8] flex items-center justify-center text-[11px] text-[#8A8D84]"
            >
              Open Layer
            </div>
          ))}

        <button
          type="button"
          onClick={() => onToggleFavorite(outfit)}
          aria-label={outfit.isFavorite ? `Remove ${outfit.name} from favorites` : `Favorite ${outfit.name}`}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#FAF8F5]/95 border border-[#E5E0D8] flex items-center justify-center text-[#1C1D1A] hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${
              outfit.isFavorite ? 'fill-[#526B56] text-[#526B56]' : 'text-[#5C5E58]'
            }`}
          />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#73766E] mb-1">
            <span>{outfit.occasion}</span>
            <span aria-hidden="true">·</span>
            <span>{outfit.season}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{pieces.length} pieces</span>
          </div>

          <h3 className="font-sans text-lg font-semibold text-[#1C1D1A] leading-snug">
            {outfit.name}
          </h3>

          {outfit.notes && (
            <p className="mt-1.5 text-sm text-[#5C5E58] line-clamp-2 leading-relaxed">
              {outfit.notes}
            </p>
          )}

          <div className="mt-3 text-xs text-[#73766E] font-mono-tabular">
            <span>Worn {outfit.wearCount} times</span>
            {outfit.lastWornDate && (
              <>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>Last worn {outfit.lastWornDate}</span>
              </>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLogWearToday(outfit)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Log Wear
            </button>
            <button
              type="button"
              onClick={() => onSchedule(outfit)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1D1A] hover:bg-[#E6E1D7] transition-colors whitespace-nowrap shrink-0"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Schedule
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDelete(outfit)}
            aria-label={`Delete outfit ${outfit.name}`}
            className="p-2 rounded-lg text-[#73766E] hover:text-[#B93829] hover:bg-[#FDF2F0] transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
