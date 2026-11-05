import React from 'react';
import { Heart, Pencil, Trash2 } from 'lucide-react';
import type { ClothingItem } from '../../types/outdrobe';
import { GarmentImage } from './GarmentImage';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

  const wearsText = t('clothingCard.wearsUnit', 'wears');
  const unwornText = t('clothingCard.unworn', 'Unworn');
  const perWearText = t('clothingCard.perWear', '/ wear');

  const costPerWear =
    item.purchasePrice > 0
      ? item.wearCount > 0
        ? `$${(item.purchasePrice / item.wearCount).toFixed(2)} ${perWearText}`
        : `$${item.purchasePrice.toFixed(0)} · ${unwornText}`
      : `${item.wearCount} ${wearsText}`;

  const viewDetailsLabel = t('clothingCard.viewDetails', 'View details for {name}').replace(
    '{name}',
    item.name
  );
  const favoriteLabel = item.isFavorite
    ? t('clothingCard.removeFavorite', 'Remove {name} from favorites').replace('{name}', item.name)
    : t('clothingCard.saveFavorite', 'Save {name} to favorites').replace('{name}', item.name);
  const editLabel = t('clothingCard.editGarment', 'Edit {name}').replace('{name}', item.name);
  const deleteLabel = t('clothingCard.deleteGarment', 'Delete {name}').replace('{name}', item.name);

  const categoryLabel = t(`categories.${item.category.toLowerCase()}`, item.category);

  return (
    <article className="group bg-white border border-[#E5E0D8] rounded-xl overflow-hidden transition-transform duration-150 ease-out hover:-translate-y-0.5 flex flex-col">
      <div
        className="relative aspect-[3/4] w-full cursor-pointer"
        onClick={() => onEdit(item)}
        title={viewDetailsLabel}
      >
        <GarmentImage
          imageKey={item.imageKey}
          customImageUrl={item.customImageUrl}
          alt={`${item.name} in ${item.color}`}
          colorHex={item.colorHex}
          className="w-full h-full"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item);
          }}
          aria-label={favoriteLabel}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#FAF8F5]/90 backdrop-blur-xs border border-[#E5E0D8] flex items-center justify-center text-[#1C1D1A] hover:bg-white transition-colors focus-visible:outline-2 focus-visible:outline-[#526B56] cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              item.isFavorite ? 'fill-[#526B56] text-[#526B56]' : 'text-[#5C5E58]'
            }`}
          />
        </button>
      </div>

      <div
        className="p-4 flex-1 flex flex-col justify-between gap-3 cursor-pointer"
        onClick={() => onEdit(item)}
      >
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#73766E] mb-1">
            <span>{categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span>{item.brand}</span>
          </div>

          <h3 className="font-sans text-base font-semibold text-[#1C1D1A] leading-snug line-clamp-1 group-hover:text-[#526B56] transition-colors">
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
            <span>
              {item.wearCount} {wearsText}
            </span>
            <span className="mx-1.5 text-[#C7C2B8]" aria-hidden="true">
              ·
            </span>
            <span className="text-[#1C1D1A] font-medium">{costPerWear}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              aria-label={editLabel}
              className="p-2 rounded-lg text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors focus-visible:outline-2 focus-visible:outline-[#526B56] cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              aria-label={deleteLabel}
              className="p-2 rounded-lg text-[#5C5E58] hover:text-[#B93829] hover:bg-[#FDF2F0] transition-colors focus-visible:outline-2 focus-visible:outline-[#526B56] cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
