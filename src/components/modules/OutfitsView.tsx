import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type {
  AppSection,
  ClothingItem,
  OccasionTag,
  Outfit,
} from '../../types/outdrobe';
import { OutfitCard } from '../common/OutfitCard';
import { useLanguage } from '../../context/LanguageContext';

interface OutfitsViewProps {
  outfits: Outfit[];
  wardrobe: ClothingItem[];
  favoritesOnly?: boolean;
  onNavigate: (section: AppSection) => void;
  onToggleFavorite: (outfit: Outfit) => Promise<void>;
  onEditOutfit?: (outfit: Outfit) => void;
  onDeleteOutfit: (outfit: Outfit) => Promise<void>;
  onLogWearToday: (outfit: Outfit) => Promise<void>;
  onScheduleOutfit: (date: string, outfitId: string, occasionNote: string) => Promise<void>;
}

const OCCASION_FILTERS: ('All' | OccasionTag)[] = [
  'All',
  'Daily Studio',
  'Professional',
  'Campus',
  'Evening',
  'Weekend',
  'Travel',
];

export const OutfitsView: React.FC<OutfitsViewProps> = ({
  outfits,
  wardrobe,
  favoritesOnly = false,
  onNavigate,
  onToggleFavorite,
  onEditOutfit,
  onDeleteOutfit,
  onLogWearToday,
  onScheduleOutfit,
}) => {
  const { t } = useLanguage();
  const [selectedOccasion, setSelectedOccasion] = useState<'All' | OccasionTag>('All');
  const [schedulingOutfit, setSchedulingOutfit] = useState<Outfit | null>(null);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });
  const [scheduleNote, setScheduleNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];
  const safeOutfits = Array.isArray(outfits) ? outfits : [];

  const wardrobeMap = useMemo(
    () => new Map<string, ClothingItem>(safeWardrobe.map((g) => [g.id, g])),
    [safeWardrobe]
  );

  const visibleOutfits = useMemo(() => {
    return safeOutfits.filter((o) => {
      if (favoritesOnly && !o.isFavorite) return false;
      if (selectedOccasion !== 'All' && o.occasion !== selectedOccasion) return false;
      return true;
    });
  }, [safeOutfits, favoritesOnly, selectedOccasion]);

  const handleWearClick = async (outfit: Outfit) => {
    await onLogWearToday(outfit);
    setToast(
      t('outfits.wearLoggedToast', 'Logged wear for "{name}" and updated garment wear counts.').replace(
        '{name}',
        outfit.name
      )
    );
  };

  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingOutfit) return;
    await onScheduleOutfit(
      scheduleDate,
      schedulingOutfit.id,
      scheduleNote.trim() || schedulingOutfit.occasion
    );
    setToast(
      t('outfits.scheduledToast', 'Scheduled "{name}" for {date}.')
        .replace('{name}', schedulingOutfit.name)
        .replace('{date}', scheduleDate)
    );
    setSchedulingOutfit(null);
    setScheduleNote('');
  };

  const getOccasionLabel = (occ: 'All' | OccasionTag): string => {
    if (occ === 'All') return t('occasions.all', 'All');
    const keyMap: Record<OccasionTag, string> = {
      'Daily Studio': 'occasions.dailyStudio',
      Professional: 'occasions.professional',
      Campus: 'occasions.campus',
      Evening: 'occasions.evening',
      Weekend: 'occasions.weekend',
      Travel: 'occasions.travel',
    };
    return t(keyMap[occ] || occ, occ);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <p className="text-xs font-medium text-[#526B56] mb-1">
            {favoritesOnly
              ? t('outfits.curatedStaples', 'Curated Staples')
              : t('outfits.outfitManagement', 'Outfit Management')}
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
            {favoritesOnly
              ? t('outfits.favoriteOutfitsTitle', 'Favorite Outfits')
              : t('outfits.savedLookbookTitle', 'Saved Lookbook')}
          </h1>
          <p className="mt-1 text-sm text-[#5C5E58]">
            {favoritesOnly
              ? t(
                  'outfits.favoritesSubtitle',
                  'Your highest-confidence combinations ready for effortless scheduling.'
                )
              : t(
                  'outfits.outfitsSubtitle',
                  'Browse, log wears, or assign complete outfits onto your planning calendar.'
                )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('builder')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('outfits.newOutfit', 'New Outfit')}
        </button>
      </div>

      {toast && (
        <div className="p-4 rounded-xl bg-[#EBF0EC] border border-[#CBD8CD] flex items-center justify-between gap-4 text-sm text-[#2D4030]">
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-xs font-medium underline cursor-pointer"
          >
            {t('common.dismiss', 'Dismiss')}
          </button>
        </div>
      )}

      {/* Occasion Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg overflow-x-auto w-fit max-w-full">
        {OCCASION_FILTERS.map((occ) => (
          <button
            key={occ}
            type="button"
            onClick={() => setSelectedOccasion(occ)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedOccasion === occ
                ? 'bg-white text-[#1C1D1A] shadow-xs'
                : 'text-[#5C5E58] hover:text-[#1C1D1A]'
            }`}
          >
            {getOccasionLabel(occ)}
          </button>
        ))}
      </div>

      {visibleOutfits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleOutfits.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              wardrobeMap={wardrobeMap}
              onToggleFavorite={onToggleFavorite}
              onSchedule={(o) => setSchedulingOutfit(o)}
              onLogWearToday={handleWearClick}
              onEdit={onEditOutfit}
              onDelete={onDeleteOutfit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-xl py-16 px-6 text-center">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
            {favoritesOnly
              ? t('outfits.noFavoritesTitle', 'No favorite outfits saved yet')
              : t('outfits.noMatchTitle', 'No outfits match this filter')}
          </h2>
          <p className="mt-1.5 text-sm text-[#5C5E58] max-w-md mx-auto">
            {favoritesOnly
              ? t(
                  'outfits.noFavoritesDesc',
                  'Tap the heart button on any outfit card or compose a new combination in Outfit Builder.'
                )
              : t('outfits.noMatchDesc', 'Compose your next multi-layer look in the visual Outfit Builder.')}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {selectedOccasion !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedOccasion('All')}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1D1A] cursor-pointer"
              >
                {t('outfits.showAllOccasions', 'Show All Occasions')}
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('builder')}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] cursor-pointer"
            >
              {t('outfits.openBuilder', 'Open Outfit Builder')}
            </button>
          </div>
        </div>
      )}

      {/* Quick Schedule Modal */}
      {schedulingOutfit && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1D1A]/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setSchedulingOutfit(null)}
              aria-label={t('outfits.closeModal', 'Close schedule modal')}
              className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-[#5C5E58] hover:bg-[#F2EFE9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-xs font-medium text-[#526B56] mb-1">
              {t('nav.calendar', 'Outfit Calendar')}
            </p>
            <h3 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
              {t('outfits.scheduleModalTitle', 'Schedule “{name}”').replace(
                '{name}',
                schedulingOutfit.name
              )}
            </h3>

            <form onSubmit={handleConfirmSchedule} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                  {t('outfits.targetDate', 'Target Date')}
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#D8D3C8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                  {t('outfits.dayNote', 'Event or Day Note')}
                </label>
                <input
                  type="text"
                  value={scheduleNote}
                  onChange={(e) => setScheduleNote(e.target.value)}
                  placeholder={t('outfits.dayNotePlaceholder', 'e.g., Studio Seminar & Dinner')}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSchedulingOutfit(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1D1A] cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] cursor-pointer"
                >
                  {t('outfits.assignToCalendar', 'Assign to Calendar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
