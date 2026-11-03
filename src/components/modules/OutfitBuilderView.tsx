import React, { useEffect, useState } from 'react';
import { Check, Layers, RotateCcw, Shuffle } from 'lucide-react';
import type {
  ClothingCategory,
  ClothingItem,
  OccasionTag,
  Outfit,
  SeasonTag,
} from '../../types/outdrobe';
import { GarmentImage } from '../common/GarmentImage';
import { TourSpotlightCallout } from '../demo/TourSpotlightCallout';

interface OutfitBuilderViewProps {
  wardrobe: ClothingItem[];
  editingOutfit?: Outfit | null;
  onSaveOutfit: (payload: Partial<Outfit>) => Promise<void>;
  onUpdateOutfit?: (id: string, payload: Partial<Outfit>) => Promise<void>;
  onCancelEdit?: () => void;
  isTourActive?: boolean;
  onNextTourStep?: () => void;
}

const LAYER_ORDER: ClothingCategory[] = [
  'Outerwear',
  'Tops',
  'Bottoms',
  'Footwear',
  'Accessories',
];

const OCCASIONS: OccasionTag[] = [
  'Daily Studio',
  'Professional',
  'Campus',
  'Evening',
  'Weekend',
  'Travel',
];

const SEASONS: SeasonTag[] = ['All Seasons', 'Spring', 'Summer', 'Autumn', 'Winter'];

export const OutfitBuilderView: React.FC<OutfitBuilderViewProps> = ({
  wardrobe,
  editingOutfit,
  onSaveOutfit,
  onUpdateOutfit,
  onCancelEdit,
  isTourActive = false,
  onNextTourStep,
}) => {
  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];

  const [activeLayer, setActiveLayer] = useState<ClothingCategory>('Tops');
  const [selectedByCategory, setSelectedByCategory] = useState<
    Partial<Record<ClothingCategory, string>>
  >(() => {
    if (editingOutfit && Array.isArray(editingOutfit.itemIds)) {
      const mapped: Partial<Record<ClothingCategory, string>> = {};
      editingOutfit.itemIds.forEach((itemId) => {
        const item = safeWardrobe.find((g) => g.id === itemId);
        if (item) {
          mapped[item.category] = item.id;
        }
      });
      return mapped;
    }
    const initial: Partial<Record<ClothingCategory, string>> = {};
    const top = safeWardrobe.find((g) => g.category === 'Tops');
    const bottom = safeWardrobe.find((g) => g.category === 'Bottoms');
    const shoe = safeWardrobe.find((g) => g.category === 'Footwear');
    if (top) initial.Tops = top.id;
    if (bottom) initial.Bottoms = bottom.id;
    if (shoe) initial.Footwear = shoe.id;
    return initial;
  });

  const [outfitName, setOutfitName] = useState(() => editingOutfit?.name || '');
  const [occasion, setOccasion] = useState<OccasionTag>(
    () => editingOutfit?.occasion || 'Daily Studio'
  );
  const [season, setSeason] = useState<SeasonTag>(
    () => editingOutfit?.season || 'All Seasons'
  );
  const [notes, setNotes] = useState(() => editingOutfit?.notes || '');
  const [isFavorite, setIsFavorite] = useState(() =>
    editingOutfit ? Boolean(editingOutfit.isFavorite) : true
  );
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<string | null>(null);

  useEffect(() => {
    if (editingOutfit) {
      setOutfitName(editingOutfit.name || '');
      setOccasion(editingOutfit.occasion || 'Daily Studio');
      setSeason(editingOutfit.season || 'All Seasons');
      setNotes(editingOutfit.notes || '');
      setIsFavorite(Boolean(editingOutfit.isFavorite));
      setSavedBanner(null);

      const mapped: Partial<Record<ClothingCategory, string>> = {};
      if (Array.isArray(editingOutfit.itemIds)) {
        editingOutfit.itemIds.forEach((itemId) => {
          const item = safeWardrobe.find((g) => g.id === itemId);
          if (item) {
            mapped[item.category] = item.id;
          }
        });
      }
      setSelectedByCategory(mapped);
    } else {
      setOutfitName('');
      setOccasion('Daily Studio');
      setSeason('All Seasons');
      setNotes('');
      setIsFavorite(true);
      setSavedBanner(null);

      const initial: Partial<Record<ClothingCategory, string>> = {};
      const top = safeWardrobe.find((g) => g.category === 'Tops');
      const bottom = safeWardrobe.find((g) => g.category === 'Bottoms');
      const shoe = safeWardrobe.find((g) => g.category === 'Footwear');
      if (top) initial.Tops = top.id;
      if (bottom) initial.Bottoms = bottom.id;
      if (shoe) initial.Footwear = shoe.id;
      setSelectedByCategory(initial);
    }
  }, [editingOutfit, wardrobe]);

  const wardrobeMap = new Map<string, ClothingItem>(safeWardrobe.map((g) => [g.id, g]));

  const selectedItems = LAYER_ORDER.map((cat) => {
    const id = selectedByCategory[cat];
    return id ? wardrobeMap.get(id) : undefined;
  }).filter((item): item is ClothingItem => Boolean(item));

  const layerItems = safeWardrobe.filter((g) => g.category === activeLayer);

  const toggleSelectItem = (item: ClothingItem) => {
    setSavedBanner(null);
    setSelectedByCategory((prev) => {
      if (prev[item.category] === item.id) {
        const copy = { ...prev };
        delete copy[item.category];
        return copy;
      }
      return { ...prev, [item.category]: item.id };
    });
  };

  const handleShuffle = () => {
    setSavedBanner(null);
    const next: Partial<Record<ClothingCategory, string>> = {};
    (['Tops', 'Bottoms', 'Footwear', 'Outerwear'] as ClothingCategory[]).forEach((cat) => {
      const candidates = wardrobe.filter((g) => g.category === cat);
      if (candidates.length > 0) {
        if (cat === 'Outerwear' && Math.random() < 0.3) return;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        next[cat] = pick.id;
      }
    });
    setSelectedByCategory(next);
  };

  const handleClear = () => {
    setSavedBanner(null);
    setSelectedByCategory({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    setSaving(true);
    try {
      const resolvedName =
        outfitName.trim() || `${occasion} ${selectedItems[0].color} Look`;
      const payload: Partial<Outfit> = {
        name: resolvedName,
        occasion,
        season,
        itemIds: selectedItems.map((i) => i.id),
        isFavorite,
        notes: notes.trim(),
      };

      if (editingOutfit && onUpdateOutfit) {
        await onUpdateOutfit(editingOutfit.id, payload);
        setSavedBanner(`Updated "${resolvedName}" successfully.`);
      } else {
        await onSaveOutfit(payload);
        setOutfitName('');
        setNotes('');
        setSavedBanner(`Saved "${resolvedName}" to your Outfits collection.`);
      }
    } finally {
      setSaving(false);
    }
  };

  const totalOutfitValue = selectedItems.reduce((sum, i) => sum + i.purchasePrice, 0);

  return (
    <div className="space-y-8">
      {/* Contextual Spotlight Callout: Phase 3 Outfit Builder */}
      {isTourActive && (
        <TourSpotlightCallout
          stepNumber={3}
          stepBadge="Layering Studio"
          stepTitle="Outfit Builder Canvas"
          headline="Compose Multi-Piece Ensembles in Real Time"
          description="Assemble complete looks before getting dressed. Choose one piece per layer from your capsule, observe proportional balance on the live canvas, and tag occasion context—all simulated in local memory."
          guidancePoints={[
            {
              label: '1. Layer Selection Rack',
              text: 'Switch between Outerwear, Tops, Bottoms, Footwear, and Accessories to pick one garment per slot.',
            },
            {
              label: '2. Live Lookbook Canvas',
              text: 'Observe color harmony swatches, combined outfit value, and multi-layer composition updating instantly.',
            },
            {
              label: '3. Ensemble Metadata',
              text: 'Assign occasion tags (Studio, Campus, Evening) and seasons to organize your saved looks for scheduling.',
            },
          ]}
          interactiveTip="Select any garment from the rack or click 'Shuffle Capsule' above to watch the lookbook canvas combine pieces dynamically in local memory."
          onNext={onNextTourStep}
          nextLabel="Next: Outfit Calendar →"
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <p className="text-xs font-medium text-[#526B56] mb-1">
            {editingOutfit ? 'Edit Lookbook Ensemble' : 'Visual Lookbook Studio'}
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
            {editingOutfit ? `Edit "${editingOutfit.name}"` : 'Outfit Builder'}
          </h1>
          <p className="mt-1 text-sm text-[#5C5E58]">
            {editingOutfit
              ? 'Update pieces, occasion, season, or styling notes for this saved ensemble.'
              : 'Select one piece per layer to compose balanced silhouettes and test color harmony.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Shuffle Capsule
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#5C5E58] hover:text-[#1C1D1A] transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Canvas
          </button>
        </div>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-xl bg-[#EBF0EC] border border-[#CBD8CD] flex items-center justify-between gap-4 text-sm text-[#2D4030]">
          <span>{savedBanner}</span>
          <button
            type="button"
            onClick={() => setSavedBanner(null)}
            className="text-xs font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Garment Layer Picker with Tour Spotlight */}
        <div
          className={`lg:col-span-7 space-y-5 p-2 rounded-2xl transition-all duration-300 ${
            isTourActive ? 'ring-2 ring-[#526B56]/50 bg-[#F2EFE9]/40' : ''
          }`}
        >
          {isTourActive && (
            <div className="flex items-center justify-between text-xs text-[#73766E] px-1 -mb-2">
              <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-[#526B56] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#526B56]" />
                Layer Selection Rack · Pick 1 Piece per Layer
              </span>
              <span className="hidden sm:inline">Outerwear · Tops · Bottoms · Shoes</span>
            </div>
          )}

          <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg overflow-x-auto">
            {LAYER_ORDER.map((cat) => {
              const hasSelection = Boolean(selectedByCategory[cat]);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveLayer(cat)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    activeLayer === cat
                      ? 'bg-white text-[#1C1D1A] shadow-xs'
                      : 'text-[#5C5E58] hover:text-[#1C1D1A]'
                  }`}
                >
                  <span>{cat}</span>
                  {hasSelection && <Check className="w-3 h-3 text-[#526B56]" />}
                </button>
              );
            })}
          </div>

          {layerItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {layerItems.map((item) => {
                const isSelected = selectedByCategory[item.category] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSelectItem(item)}
                    className={`text-left rounded-xl overflow-hidden border transition-all flex flex-col bg-white ${
                      isSelected
                        ? 'border-[#526B56] ring-2 ring-[#526B56]/30'
                        : 'border-[#E5E0D8] hover:border-[#B8B2A6]'
                    }`}
                  >
                    <div className="relative aspect-[3/4] w-full">
                      <GarmentImage
                        imageKey={item.imageKey}
                        customImageUrl={item.customImageUrl}
                        alt={item.name}
                        colorHex={item.colorHex}
                        className="w-full h-full"
                      />
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#526B56] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-[#1C1D1A] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#73766E] mt-0.5 truncate">
                        {item.color} · {item.wearCount} wears
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-xl py-12 px-6 text-center">
              <p className="text-sm font-medium text-[#1C1D1A]">
                No {activeLayer.toLowerCase()} in your wardrobe yet
              </p>
              <p className="mt-1 text-xs text-[#5C5E58]">
                Switch to another layer tab or add {activeLayer.toLowerCase()} in your Garment Archive.
              </p>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Live Outfit Composition Canvas & Save Form with Tour Spotlight */}
        <form
          onSubmit={handleSave}
          className={`lg:col-span-5 bg-white border border-[#E5E0D8] rounded-xl p-6 space-y-6 transition-all duration-300 ${
            isTourActive ? 'ring-2 ring-[#526B56]/50 shadow-md' : ''
          }`}
        >
          {isTourActive && (
            <div className="p-2.5 rounded-lg bg-[#EBF0EC] border border-[#CBD8CD] text-xs text-[#2D4030] flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white text-[#354938] border border-[#CBD8CD] shrink-0">
                Live Studio
              </span>
              <span>
                Testing layer combinations live in local memory. Zero changes are written to the database.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#526B56]" />
              <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
                Lookbook Canvas
              </h2>
            </div>
            <span className="font-mono-tabular text-xs text-[#73766E]">
              {selectedItems.length} / 5 layers
            </span>
          </div>

          {selectedItems.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#EFECE6]">
                {selectedItems.map((piece) => (
                  <div
                    key={piece.id}
                    className="bg-white rounded-lg overflow-hidden border border-[#E5E0D8]/80 flex flex-col"
                  >
                    <div className="aspect-[3/4] w-full">
                      <GarmentImage
                        imageKey={piece.imageKey}
                        customImageUrl={piece.customImageUrl}
                        alt={piece.name}
                        colorHex={piece.colorHex}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-[#1C1D1A] truncate">
                          {piece.name}
                        </p>
                        <p className="text-[10px] text-[#73766E]">{piece.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSelectItem(piece)}
                        className="text-[10px] text-[#73766E] hover:text-[#B93829] shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Color Harmony Swatch Bar */}
              <div className="flex items-center justify-between text-xs text-[#5C5E58] pt-1">
                <div className="flex items-center gap-2">
                  <span>Color Harmony:</span>
                  <div className="flex items-center -space-x-1">
                    {selectedItems.map((i) => (
                      <span
                        key={i.id}
                        title={i.color}
                        className="w-5 h-5 rounded-full border border-white ring-1 ring-black/10"
                        style={{ backgroundColor: i.colorHex }}
                      />
                    ))}
                  </div>
                </div>
                <span className="font-mono-tabular">Value: ${totalOutfitValue}</span>
              </div>
            </div>
          ) : (
            <div className="py-12 px-4 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#D8D3C8]">
              <p className="text-sm font-medium text-[#1C1D1A]">Canvas is empty</p>
              <p className="mt-1 text-xs text-[#5C5E58]">
                Click garments on the left to layer tops, bottoms, outerwear, and footwear.
              </p>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-[#EFECE6]">
            <div>
              <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                Outfit Title
              </label>
              <input
                type="text"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g., Autumn Architecture Critique"
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D3C8] rounded-lg focus:outline-none focus:border-[#526B56]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#1C1D1A] mb-1">Occasion</label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value as OccasionTag)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8D3C8] rounded-lg"
                >
                  {OCCASIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1D1A] mb-1">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as SeasonTag)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8D3C8] rounded-lg"
                >
                  {SEASONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                Styling Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional cuff or accessory reminder..."
                className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D3C8] rounded-lg"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#5C5E58] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="accent-[#526B56]"
              />
              <span>Add immediately to Favorite Outfits</span>
            </label>

            <div className="flex items-center gap-2">
              {editingOutfit && onCancelEdit && (
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-[#F2EFE9] text-[#1C1D1A] hover:bg-[#E6E1D7] transition-colors text-center"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={selectedItems.length === 0 || saving}
                className={`${
                  editingOutfit ? 'flex-2' : 'w-full'
                } py-2.5 px-4 rounded-lg text-sm font-medium bg-[#526B56] text-white hover:bg-[#435947] disabled:opacity-45 transition-colors`}
              >
                {saving
                  ? editingOutfit
                    ? 'Updating Look...'
                    : 'Saving Outfit...'
                  : editingOutfit
                  ? 'Update Look'
                  : 'Save Outfit to Lookbook'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
