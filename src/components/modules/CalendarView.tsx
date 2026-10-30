import React, { useMemo, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { CalendarPlan, ClothingItem, Outfit } from '../../types/outdrobe';
import { GarmentImage } from '../common/GarmentImage';

interface CalendarViewProps {
  calendar: CalendarPlan[];
  outfits: Outfit[];
  wardrobe: ClothingItem[];
  onScheduleOutfit: (date: string, outfitId: string, occasionNote: string) => Promise<void>;
  onRemovePlan: (id: string) => Promise<void>;
  onLogPlannedOutfit: (plan: CalendarPlan, outfit: Outfit) => Promise<void>;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  calendar,
  outfits,
  wardrobe,
  onScheduleOutfit,
  onRemovePlan,
  onLogPlannedOutfit,
}) => {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(todayIso);

  const safeOutfits = Array.isArray(outfits) ? outfits : [];
  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];
  const safeCalendar = Array.isArray(calendar) ? calendar : [];

  const [chosenOutfitId, setChosenOutfitId] = useState(safeOutfits[0]?.id || '');
  const [occasionNote, setOccasionNote] = useState('');
  const [saving, setSaving] = useState(false);

  const outfitMap = useMemo(
    () => new Map<string, Outfit>(safeOutfits.map((o) => [o.id, o])),
    [safeOutfits]
  );
  const wardrobeMap = useMemo(
    () => new Map<string, ClothingItem>(safeWardrobe.map((g) => [g.id, g])),
    [safeWardrobe]
  );
  const planByDate = useMemo(
    () => new Map<string, CalendarPlan>(safeCalendar.map((c) => [c.date, c])),
    [safeCalendar]
  );

  const daysGrid = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= totalDays; day += 1) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(
        2,
        '0'
      )}`;
      cells.push(iso);
    }
    return cells;
  }, [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const stepMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const activePlan = planByDate.get(selectedDate);
  const activeOutfit = activePlan ? outfitMap.get(activePlan.outfitId) : undefined;
  const activePieces = activeOutfit
    ? activeOutfit.itemIds
        .map((id) => wardrobeMap.get(id))
        .filter((g): g is ClothingItem => Boolean(g))
    : [];

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = chosenOutfitId || outfits[0]?.id;
    if (!targetId) return;
    setSaving(true);
    try {
      await onScheduleOutfit(selectedDate, targetId, occasionNote.trim() || 'Planned Look');
      setOccasionNote('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <p className="text-xs font-medium text-[#526B56] mb-1">Weekly & Monthly Lookbook Planner</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
            Outfit Calendar
          </h1>
          <p className="mt-1 text-sm text-[#5C5E58]">
            Select any calendar date to schedule an outfit ahead of lectures, meetings, or trips.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            aria-label="Previous month"
            className="w-9 h-9 rounded-lg bg-white border border-[#D8D3C8] flex items-center justify-center hover:bg-[#F2EFE9]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-sm font-medium text-[#1C1D1A] min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => stepMonth(1)}
            aria-label="Next month"
            className="w-9 h-9 rounded-lg bg-white border border-[#D8D3C8] flex items-center justify-center hover:bg-[#F2EFE9]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-8 bg-white border border-[#E5E0D8] rounded-xl p-5">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-[#73766E] py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysGrid.map((iso, index) => {
              if (!iso) {
                return <div key={`empty_${index}`} className="aspect-square rounded-lg bg-[#FAF8F5]/50" />;
              }
              const dayNum = Number(iso.slice(8, 10));
              const plan = planByDate.get(iso);
              const plannedOutfit = plan ? outfitMap.get(plan.outfitId) : undefined;
              const isSelected = iso === selectedDate;
              const isToday = iso === todayIso;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className={`aspect-square rounded-lg p-2 text-left flex flex-col justify-between border transition-colors ${
                    isSelected
                      ? 'bg-[#EBF0EC] border-[#526B56]'
                      : plannedOutfit
                      ? 'bg-[#FAF8F5] border-[#D8D3C8] hover:border-[#526B56]'
                      : 'bg-white border-[#EFECE6] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`font-mono-tabular text-xs ${
                        isToday ? 'font-bold text-[#526B56]' : 'text-[#1C1D1A]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {plan?.isCompleted && (
                      <CheckCircle2 className="w-3 h-3 text-[#526B56] shrink-0" />
                    )}
                  </div>

                  {plannedOutfit ? (
                    <span className="text-[10px] leading-tight font-medium text-[#2D4030] line-clamp-2">
                      {plannedOutfit.name}
                    </span>
                  ) : (
                    <span className="text-[10px] text-transparent select-none">-</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector */}
        <div className="lg:col-span-4 bg-white border border-[#E5E0D8] rounded-xl p-6 space-y-6">
          <div>
            <p className="font-mono-tabular text-xs font-medium text-[#526B56]">{selectedDate}</p>
            <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A] mt-0.5">
              Day Plan
            </h2>
          </div>

          {activePlan && activeOutfit ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#EFECE6]">
                {activePieces.slice(0, 4).map((piece) => (
                  <div key={piece.id} className="space-y-1">
                    <div className="aspect-[3/4] rounded-md overflow-hidden bg-white border border-[#E5E0D8]">
                      <GarmentImage
                        imageKey={piece.imageKey}
                        customImageUrl={piece.customImageUrl}
                        alt={piece.name}
                        colorHex={piece.colorHex}
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-[#1C1D1A] truncate">{piece.name}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#1C1D1A]">{activeOutfit.name}</h3>
                <p className="text-xs text-[#5C5E58] mt-0.5">
                  {activePlan.occasionNote} · {activeOutfit.occasion}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {!activePlan.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onLogPlannedOutfit(activePlan, activeOutfit)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Log Worn
                  </button>
                ) : (
                  <span className="flex-1 text-xs font-medium text-[#526B56]">
                    Completed & logged
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onRemovePlan(activePlan.id)}
                  aria-label="Remove scheduled outfit"
                  className="p-2.5 rounded-lg text-[#73766E] hover:text-[#B93829] hover:bg-[#FDF2F0]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#5C5E58]">
              No outfit assigned to {selectedDate} yet. Choose a saved look below.
            </p>
          )}

          {outfits.length > 0 && (
            <form onSubmit={handleAssign} className="pt-5 border-t border-[#EFECE6] space-y-4">
              <p className="text-xs font-semibold text-[#1C1D1A]">
                {activePlan ? 'Replace Scheduled Outfit' : 'Assign Saved Outfit'}
              </p>

              <div>
                <label className="block text-xs text-[#5C5E58] mb-1">Outfit</label>
                <select
                  value={chosenOutfitId || outfits[0]?.id}
                  onChange={(e) => setChosenOutfitId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8D3C8] rounded-lg"
                >
                  {outfits.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.occasion})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#5C5E58] mb-1">Day Context / Event</label>
                <input
                  type="text"
                  value={occasionNote}
                  onChange={(e) => setOccasionNote(e.target.value)}
                  placeholder="e.g., Client Workshop"
                  className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#D8D3C8] rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-medium bg-[#1C1D1A] text-white hover:bg-[#31332E] transition-colors"
              >
                {saving ? 'Saving...' : `Schedule for ${selectedDate}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
