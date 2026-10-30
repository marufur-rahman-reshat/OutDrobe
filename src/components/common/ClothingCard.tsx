import React from 'react';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import type { ClothingItem } from '../../types/outdrobe';
import { GarmentImage } from './GarmentImage';

interface ClothingCardProps {
  item: ClothingItem;
  onToggleFavorite: (item: ClothingItem) => void;
  onEdit: (item: ClothingItem) => void;
  onDelete: (item: ClothingItem) => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  onToggleFavorite,
  onEdit,
  onDelete,
}) => {
  const costPerWear =
    item.purchasePrice > 0
      ? item.wearCount > 0
        ? `$${(item.purchasePrice / item.wearCount).toFixed(2)} / wear`
        : `$${item.purchasePrice.toFixed(0)} · Unworn`
      : `${item.wearCount} wears`;

  return (
    <article className="group bg-white border border-[#E5E0D8] rounded-xl overflow-hidden transition-transform duration-150 ease-out hover:-translate-y-0.5 flex flex-col">
      <div className="relative aspect-[3/4] w-full">
        <GarmentImage
          imageKey={item.imageKey}
          customImageUrl={item.customImageUrl}
          alt={`${item.name} in ${item.color}`}
          colorHex={item.colorHex}
          className="w-full h-full"
        />

        <button
          type="button"
          onClick={() => onToggleFavorite(item)}
          aria-label={item.isFavorite ? `Remove ${item.name} from favorites` : `Save ${item.name} to favorites`}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#FAF8F5]/90 backdrop-blur-xs border border-[#E5E0D8] flex items-center justify-center text-[#1C1D1A] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#526B56]"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              item.isFavorite ? 'fill-[#526B56] text-[#526B56]' : 'text-[#5C5E58]'
            }`}
          />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#73766E] mb-1">
            <span>{item.category}</span>
            <span aria-hidden="true">·</span>
            <span>{item.brand}</span>
          </div>

          <h3 className="font-sans text-base font-semibold text-[#1C1D1A] leading-snug line-clamp-1">
            {item.name}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#5C5E58] flex-wrap">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border border-black/15 shrink-0"
              style={{ backgroundColor: item.colorHex }}
              aria-hidden="true"
            />
            <span>{item.color}</span>
            <span aria-hidden="true">·</span>
            <span>{item.season}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between gap-2">
          <div className="font-mono-tabular text-xs text-[#5C5E58]">
            <span>{item.wearCount} wears</span>
            <span className="mx-1.5 text-[#C7C2B8]" aria-hidden="true">·</span>
            <span className="text-[#1C1D1A] font-medium">{costPerWear}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.name}`}
              className="p-2 rounded-lg text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors focus-visible:outline-2 focus-visible:outline-[#526B56]"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${item.name}`}
              className="p-2 rounded-lg text-[#5C5E58] hover:text-[#B93829] hover:bg-[#FDF2F0] transition-colors focus-visible:outline-2 focus-visible:outline-[#526B56]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
