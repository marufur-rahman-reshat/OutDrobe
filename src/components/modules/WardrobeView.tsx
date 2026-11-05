import React, { useMemo, useState } from 'react';
import { Plus, Search, Upload, X } from 'lucide-react';
import type { ClothingCategory, ClothingItem, SeasonTag } from '../../types/outdrobe';
import { COLOR_SWATCH_OPTIONS, GARMENT_PRESET_ASSETS } from '../../data/garmentAssets';
import { ClothingCard } from '../common/ClothingCard';
import { GarmentImage } from '../common/GarmentImage';
import { TourSpotlightCallout } from '../demo/TourSpotlightCallout';
import { useLanguage } from '../../context/LanguageContext';

interface WardrobeViewProps {
  wardrobe: ClothingItem[];
  onCreateGarment: (payload: Partial<ClothingItem>) => Promise<void>;
  onUpdateGarment: (id: string, payload: Partial<ClothingItem>) => Promise<void>;
  onDeleteGarment: (item: ClothingItem) => Promise<void>;
  isTourActive?: boolean;
  onNextTourStep?: () => void;
}

const CATEGORIES: ('All' | ClothingCategory)[] = [
  'All',
  'Outerwear',
  'Tops',
  'Bottoms',
  'Footwear',
  'Accessories',
];

const SEASONS: ('All' | SeasonTag)[] = [
  'All',
  'All Seasons',
  'Spring',
  'Summer',
  'Autumn',
  'Winter',
];

async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image format.'));
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.fillStyle = '#FAF8F5';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  wardrobe,
  onCreateGarment,
  onUpdateGarment,
  onDeleteGarment,
  isTourActive = false,
  onNextTourStep,
}) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<'All' | ClothingCategory>('All');
  const [selectedSeason, setSelectedSeason] = useState<'All' | SeasonTag>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('Tops');
  const [color, setColor] = useState('Soft Sage');
  const [colorHex, setColorHex] = useState('#7A8F7C');
  const [fabric, setFabric] = useState('');
  const [season, setSeason] = useState<SeasonTag>('All Seasons');
  const [purchasePrice, setPurchasePrice] = useState('120');
  const [imageKey, setImageKey] = useState('sage_blazer');
  const [customImageUrl, setCustomImageUrl] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];

  const filteredItems = useMemo(() => {
    return safeWardrobe.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (
        selectedSeason !== 'All' &&
        item.season !== selectedSeason &&
        item.season !== 'All Seasons'
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.color.toLowerCase().includes(q) ||
          item.fabric.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [safeWardrobe, selectedCategory, selectedSeason, searchQuery]);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setBrand('');
    setCategory('Tops');
    setColor('Warm Ivory');
    setColorHex('#EFECE4');
    setFabric('100% Organic Cotton');
    setSeason('All Seasons');
    setPurchasePrice('120');
    setImageKey('ivory_knit');
    setCustomImageUrl(undefined);
    setNotes('');
    setUploadError(null);
    setModalOpen(true);
  };

  const openEditModal = (item: ClothingItem) => {
    setEditingItem(item);
    setName(item.name);
    setBrand(item.brand);
    setCategory(item.category);
    setColor(item.color);
    setColorHex(item.colorHex);
    setFabric(item.fabric);
    setSeason(item.season);
    setPurchasePrice(String(item.purchasePrice));
    setImageKey(item.imageKey);
    setCustomImageUrl(item.customImageUrl);
    setNotes(item.notes || '');
    setUploadError(null);
    setModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError(t('wardrobe.invalidImage', 'Please select a JPEG, PNG, or WebP clothing image.'));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError(t('wardrobe.imageTooLarge', 'Please choose an image smaller than 8 MB.'));
      return;
    }
    try {
      const compressed = await compressImageFile(file);
      setCustomImageUrl(compressed);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not process image.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload: Partial<ClothingItem> = {
        name: name.trim(),
        brand: brand.trim() || 'Personal Archive',
        category,
        color,
        colorHex,
        fabric: fabric.trim() || 'Natural Fiber',
        season,
        purchasePrice: Math.max(0, Number(purchasePrice) || 0),
        imageKey,
        customImageUrl,
        notes: notes.trim(),
      };
      if (editingItem) {
        await onUpdateGarment(editingItem.id, payload);
      } else {
        await onCreateGarment(payload);
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async (item: ClothingItem) => {
    await onUpdateGarment(item.id, { isFavorite: !item.isFavorite });
  };

  return (
    <div className="space-y-8">
      {/* Contextual Spotlight Callout: Phase 2 Digital Wardrobe */}
      {isTourActive && (
        <TourSpotlightCallout
          stepNumber={2}
          stepBadge="Garment Archive"
          stepTitle="Curated Digital Wardrobe"
          headline="Catalog, Filter, and Inspect Your Clothes"
          description="OutDrobe replaces cluttered drawers with a clear visual archive. Explore Claire Vance’s 9-piece capsule, filter by category or season, and inspect individual garment fabrics and wear metrics."
          guidancePoints={[
            {
              label: 'Category & Season Filters',
              text: 'Use the category pills below to isolate Outerwear, Tops, Bottoms, Footwear, or Accessories.',
            },
            {
              label: 'Garment Cards & Metrics',
              text: 'Each piece calculates real cost-per-wear by dividing purchase price by wear count.',
            },
            {
              label: 'Click Any Card to Inspect',
              text: 'Click any garment card (or its pencil icon) to view tailored fabrics, natural fibers, color swatch, and care notes.',
            },
          ]}
          interactiveTip="Try switching between 'Outerwear' and 'Tops' below, or click any garment card to inspect its tailoring details."
          onNext={onNextTourStep}
          nextLabel="Next: Outfit Builder →"
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <p className="text-xs font-medium text-[#526B56] mb-1">
            {t('wardrobe.management', 'Digital Wardrobe · Clothing Management')}
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
            {t('wardrobe.archiveTitle', 'Your Garment Archive')}
          </h1>
          <p className="mt-1 text-sm text-[#5C5E58]">
            <span className="font-mono-tabular">{safeWardrobe.length}</span>{' '}
            {t(
              'wardrobe.catalogedPiecesSubtitle',
              'cataloged pieces organized by silhouette, season, and cost-per-wear.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t('wardrobe.addNewGarment', 'Add Garment')}
        </button>
      </div>

      {/* Interactive Filter Toolbar with Tour Spotlight */}
      <div
        className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-2 rounded-xl transition-all duration-300 ${
          isTourActive ? 'ring-2 ring-[#526B56]/50 bg-[#F2EFE9]/80' : ''
        }`}
      >
        <div className="flex items-center gap-1 p-1 bg-[#EFECE6] rounded-lg overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-[#1C1D1A] shadow-xs'
                  : 'text-[#5C5E58] hover:text-[#1C1D1A]'
              }`}
            >
              {t(`categories.${cat.toLowerCase()}`, cat)}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select
            aria-label="Filter by season"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value as 'All' | SeasonTag)}
            className="px-3 py-2 text-xs font-medium bg-white border border-[#D8D3C8] rounded-lg text-[#1C1D1A] focus:outline-none focus:border-[#526B56] cursor-pointer"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s === 'All'
                  ? t('seasons.allFilter', 'All Seasons Filter')
                  : t(`seasons.${s.toLowerCase().replace(' ', '')}`, s)}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8A8D84] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('wardrobe.searchPlaceholder', 'Search name, color, fabric...')}
              className="w-full sm:w-60 pl-8 pr-3 py-2 text-xs bg-white border border-[#D8D3C8] rounded-lg text-[#1C1D1A] placeholder:text-[#8A8D84] focus:outline-none focus:border-[#526B56]"
            />
          </div>
        </div>
      </div>

      {/* Tour Grid Header if active */}
      {isTourActive && (
        <div className="flex items-center justify-between text-xs text-[#73766E] px-1 -mb-3">
          <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-[#526B56] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#526B56]" />
            {t('wardrobe.highlightedGrid', 'Highlighted Garment Grid')} · {filteredItems.length}{' '}
            {t('wardrobe.piecesShown', 'Pieces Shown')}
          </span>
          <span className="hidden sm:inline">
            {t('wardrobe.clickCardHint', 'Click any garment card to inspect details')}
          </span>
        </div>
      )}

      {/* Garment Grid or Empty State */}
      {filteredItems.length > 0 ? (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2 rounded-2xl transition-all duration-300 ${
            isTourActive ? 'ring-2 ring-[#526B56]/30 bg-[#FAF8F5]' : ''
          }`}
        >
          {filteredItems.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onToggleFavorite={handleToggleFavorite}
              onEdit={openEditModal}
              onDelete={onDeleteGarment}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-xl py-16 px-6 text-center">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
            {t('wardrobe.noMatchTitle', 'No garments match your current filter')}
          </h2>
          <p className="mt-1.5 text-sm text-[#5C5E58] max-w-md mx-auto">
            {t(
              'wardrobe.noMatchDesc',
              'Reset your category or search criteria, or add a new piece to your digital wardrobe.'
            )}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedSeason('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1D1A] hover:bg-[#E6E1D7] transition-colors cursor-pointer"
            >
              {t('wardrobe.resetFilters', 'Reset Filters')}
            </button>
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors cursor-pointer"
            >
              {t('wardrobe.addNewGarment', 'Add Garment')}
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Garment Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1D1A]/45 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="garment-modal-title"
        >
          <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-2xl p-6 sm:p-8 my-8 relative">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label={t('wardrobe.closeForm', 'Close garment form')}
              className="absolute top-5 right-5 w-10 h-10 rounded-lg flex items-center justify-center text-[#5C5E58] hover:text-[#1C1D1A] hover:bg-[#F2EFE9] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-xs font-medium text-[#526B56] mb-1">
              {editingItem
                ? t('wardrobe.updateRecord', 'Update Garment Record')
                : t('wardrobe.newAddition', 'New Closet Addition')}
            </p>
            <h2 id="garment-modal-title" className="font-editorial text-3xl font-medium text-[#1C1D1A]">
              {editingItem ? editingItem.name : t('wardrobe.catalogGarment', 'Catalog a Garment')}
            </h2>

            {isTourActive && editingItem && (
              <div className="mt-3 p-3 rounded-xl bg-[#EBF0EC] border border-[#CBD8CD] text-xs text-[#2D4030] flex items-center gap-2.5">
                <span className="font-semibold font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-white text-[#354938] border border-[#CBD8CD] shrink-0">
                  {t('wardrobe.demoDetailView', 'Demo Detail View')}
                </span>
                <span className="leading-relaxed">
                  {t(
                    'wardrobe.inspectingNotice',
                    'Inspecting {brand} · {category} in {color}. Form fields show fabric, season, and cost-per-wear breakdown.'
                  )
                    .replace('{brand}', editingItem.brand)
                    .replace('{category}', t(`categories.${editingItem.category.toLowerCase()}`, editingItem.category))
                    .replace('{color}', editingItem.color)}
                </span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Image Upload & Preview */}
              <div className="md:col-span-5 space-y-4">
                <div className="aspect-[3/4] rounded-xl overflow-hidden border border-[#E5E0D8] bg-white">
                  <GarmentImage
                    imageKey={imageKey}
                    customImageUrl={customImageUrl}
                    alt={name || 'Garment preview'}
                    colorHex={colorHex}
                    className="w-full h-full"
                  />
                </div>

                <div>
                  <label className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9] cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    {t('wardrobe.uploadPhoto', 'Upload Photo from Device')}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {customImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomImageUrl(undefined)}
                      className="mt-2 w-full text-center text-xs text-[#73766E] hover:text-[#1C1D1A] cursor-pointer"
                    >
                      {t('wardrobe.revertPreset', 'Revert to Studio Lookbook Preset')}
                    </button>
                  )}
                  {uploadError && (
                    <p className="mt-1.5 text-xs text-[#9E2B1E]">{uploadError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5C5E58] mb-1.5">
                    {t('wardrobe.chooseSilhouette', 'Or Choose Studio Silhouette')}
                  </label>
                  <select
                    value={imageKey}
                    onChange={(e) => {
                      setImageKey(e.target.value);
                      setCustomImageUrl(undefined);
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8D3C8] rounded-lg cursor-pointer"
                  >
                    {Object.values(GARMENT_PRESET_ASSETS).map((preset) => (
                      <option key={preset.key} value={preset.key}>
                        {preset.label} ({preset.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column: Attributes */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                    {t('wardrobe.garmentName', 'Garment Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('wardrobe.garmentNamePlaceholder', 'e.g., Relaxed Linen Overshirt')}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg focus:outline-none focus:border-[#526B56]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                      {t('wardrobe.categoryLabel', 'Category *')}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg cursor-pointer"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {t(`categories.${cat.toLowerCase()}`, cat)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                      {t('wardrobe.seasonLabel', 'Season')}
                    </label>
                    <select
                      value={season}
                      onChange={(e) => setSeason(e.target.value as SeasonTag)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg cursor-pointer"
                    >
                      {SEASONS.filter((s) => s !== 'All').map((s) => (
                        <option key={s} value={s}>
                          {t(`seasons.${s.toLowerCase().replace(' ', '')}`, s)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                      {t('wardrobe.brandLabel', 'Brand / Maker')}
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder={t('wardrobe.brandPlaceholder', 'Atelier Nord')}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                      {t('wardrobe.priceLabel', 'Purchase Price ($)')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#D8D3C8] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1C1D1A] mb-1.5">
                    {t('wardrobe.colorTone', 'Color Tone')} ({color})
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_SWATCH_OPTIONS.map((swatch) => (
                      <button
                        key={swatch.label}
                        type="button"
                        onClick={() => {
                          setColor(swatch.label);
                          setColorHex(swatch.hex);
                        }}
                        title={swatch.label}
                        aria-label={`Select color ${swatch.label}`}
                        className={`w-7 h-7 rounded-full border transition-transform cursor-pointer ${
                          color === swatch.label
                            ? 'scale-110 ring-2 ring-[#526B56] ring-offset-2 border-black/30'
                            : 'border-black/15 hover:scale-105'
                        }`}
                        style={{ backgroundColor: swatch.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                    {t('wardrobe.fabricCare', 'Fabric & Care Notes')}
                  </label>
                  <input
                    type="text"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder={t('wardrobe.fabricPlaceholder', '100% Extra-Fine Merino · Hand wash cold')}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                    {t('wardrobe.stylingNotes', 'Styling Notes (Optional)')}
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t(
                      'wardrobe.stylingPlaceholder',
                      'Pairs cleanly with charcoal wide-leg wool trousers...'
                    )}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1D1A] hover:bg-[#E6E1D7] transition-colors cursor-pointer"
                  >
                    {t('wardrobe.cancelBtn', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {saving
                      ? t('common.saving', 'Saving...')
                      : editingItem
                      ? t('wardrobe.saveChanges', 'Save Changes')
                      : t('wardrobe.addToWardrobe', 'Add to Wardrobe')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
