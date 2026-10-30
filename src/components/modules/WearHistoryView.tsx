import React, { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type {
  ClothingItem,
  OccasionTag,
  Outfit,
  WearLogEntry,
} from '../../types/outdrobe';
import { GarmentImage } from '../common/GarmentImage';

interface WearHistoryViewProps {
  wearLogs: WearLogEntry[];
  outfits: Outfit[];
  wardrobe: ClothingItem[];
  onLogWear: (payload: {
    date: string;
    outfitId: string | null;
    occasion: string;
    weatherNote: string;
    notes: string;
  }) => Promise<void>;
}

const OCCASIONS: OccasionTag[] = [
  'Daily Studio',
  'Professional',
  'Campus',
  'Evening',
  'Weekend',
  'Travel',
];

export const WearHistoryView: React.FC<WearHistoryViewProps> = ({
  wearLogs,
  outfits,
  wardrobe,
  onLogWear,
}) => {
  const safeWearLogs = Array.isArray(wearLogs) ? wearLogs : [];
  const safeOutfits = Array.isArray(outfits) ? outfits : [];
  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });
  const [outfitId, setOutfitId] = useState(safeOutfits[0]?.id || '');
  const [occasion, setOccasion] = useState<OccasionTag>('Daily Studio');
  const [weatherNote, setWeatherNote] = useState('17°C · Crisp Clear');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const wardrobeMap = useMemo(
    () => new Map<string, ClothingItem>(safeWardrobe.map((g) => [g.id, g])),
    [safeWardrobe]
  );

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetOutfit = outfitId || outfits[0]?.id;
    if (!targetOutfit) return;
    setSaving(true);
    try {
      await onLogWear({
        date,
        outfitId: targetOutfit,
        occasion,
        weatherNote: weatherNote.trim() || 'Mild',
        notes: notes.trim(),
      });
      setModalOpen(false);
      setNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <p className="text-xs font-medium text-[#526B56] mb-1">Chronological Closet Diary</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
            Wear History
          </h1>
          <p className="mt-1 text-sm text-[#5C5E58]">
            Every logged entry automatically updates garment wear counts and cost-per-wear metrics.
          </p>
        </div>

        {outfits.length > 0 && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Log Outfit Worn
          </button>
        )}
      </div>

      {wearLogs.length > 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E0D8] bg-[#FAF8F5] text-xs font-medium text-[#73766E]">
                  <th className="py-3.5 px-5">Date Worn</th>
                  <th className="py-3.5 px-5">Outfit & Garments</th>
                  <th className="py-3.5 px-5">Context</th>
                  <th className="py-3.5 px-5">Notes</th>
                  <th className="py-3.5 px-5 text-right">Pieces</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6] text-sm">
                {wearLogs.map((entry) => {
                  const items = entry.itemIds
                    .map((id) => wardrobeMap.get(id))
                    .filter((g): g is ClothingItem => Boolean(g));
                  return (
                    <tr key={entry.id} className="hover:bg-[#FAF8F5]/70 transition-colors">
                      <td className="py-4 px-5 font-mono-tabular text-xs text-[#1C1D1A] whitespace-nowrap align-top">
                        {entry.date}
                      </td>
                      <td className="py-4 px-5 align-top">
                        <p className="font-semibold text-[#1C1D1A]">{entry.outfitName}</p>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          {items.map((piece) => (
                            <div
                              key={piece.id}
                              className="flex items-center gap-1.5 pr-2"
                              title={piece.name}
                            >
                              <div className="w-7 h-9 rounded-xs overflow-hidden border border-[#E5E0D8] shrink-0">
                                <GarmentImage
                                  imageKey={piece.imageKey}
                                  customImageUrl={piece.customImageUrl}
                                  alt={piece.name}
                                  colorHex={piece.colorHex}
                                  className="w-full h-full"
                                />
                              </div>
                              <span className="text-xs text-[#5C5E58]">{piece.name}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-xs text-[#5C5E58] whitespace-nowrap align-top">
                        {entry.occasion} · {entry.weatherNote}
                      </td>
                      <td className="py-4 px-5 text-xs text-[#5C5E58] max-w-xs align-top">
                        {entry.notes || '—'}
                      </td>
                      <td className="py-4 px-5 text-right font-mono-tabular text-xs text-[#1C1D1A] align-top">
                        {entry.itemIds.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-xl py-16 px-6 text-center">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
            No wear history entries yet
          </h2>
          <p className="mt-1.5 text-sm text-[#5C5E58] max-w-md mx-auto">
            Log outfits as you wear them to uncover your most reliable wardrobe staples.
          </p>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1C1D1A]/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl w-full max-w-md p-6 relative">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Close wear log modal"
              className="absolute top-4 right-4 w-9 h-9 rounded-lg flex items-center justify-center text-[#5C5E58] hover:bg-[#F2EFE9]"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-xs font-medium text-[#526B56] mb-1">Atomic Counter Update</p>
            <h3 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
              Log Outfit Worn
            </h3>

            <form onSubmit={handleCreateEntry} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1C1D1A] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono-tabular bg-white border border-[#D8D3C8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1C1D1A] mb-1">Occasion</label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value as OccasionTag)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D8D3C8] rounded-lg"
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1D1A] mb-1">Outfit</label>
                <select
                  value={outfitId || outfits[0]?.id}
                  onChange={(e) => setOutfitId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg"
                >
                  {outfits.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.itemIds.length} pieces)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                  Weather Context
                </label>
                <input
                  type="text"
                  value={weatherNote}
                  onChange={(e) => setWeatherNote(e.target.value)}
                  placeholder="16°C · Light Breeze"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1C1D1A] mb-1">
                  Comfort or Fit Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Great layering weight for indoor studio..."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#D8D3C8] rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#F2EFE9] text-[#1C1D1A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947]"
                >
                  {saving ? 'Logging...' : 'Save Wear Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
