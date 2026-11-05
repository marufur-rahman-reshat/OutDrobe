import React from 'react';
import { ArrowRight, Calendar, CheckCircle2, Plus, Sparkles } from 'lucide-react';
import type {
  AppSection,
  CalendarPlan,
  ClothingItem,
  Outfit,
  UserProfile,
  WearLogEntry,
} from '../../types/outdrobe';
import { GarmentImage } from '../common/GarmentImage';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardViewProps {
  user: UserProfile;
  wardrobe: ClothingItem[];
  outfits: Outfit[];
  calendar: CalendarPlan[];
  wearLogs: WearLogEntry[];
  onNavigate: (section: AppSection) => void;
  onLogPlannedOutfit: (plan: CalendarPlan, outfit: Outfit) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  wardrobe,
  outfits,
  calendar,
  wearLogs,
  onNavigate,
  onLogPlannedOutfit,
}) => {
  const { t } = useLanguage();
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;

  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];
  const safeOutfits = Array.isArray(outfits) ? outfits : [];
  const safeCalendar = Array.isArray(calendar) ? calendar : [];
  const safeWearLogs = Array.isArray(wearLogs) ? wearLogs : [];

  const wardrobeMap = new Map<string, ClothingItem>(safeWardrobe.map((g) => [g.id, g]));
  const outfitMap = new Map<string, Outfit>(safeOutfits.map((o) => [o.id, o]));

  const todaysPlan = safeCalendar.find((c) => c.date === todayIso);
  const todaysOutfit = todaysPlan ? outfitMap.get(todaysPlan.outfitId) : undefined;
  const todaysPieces = todaysOutfit
    ? (Array.isArray(todaysOutfit.itemIds) ? todaysOutfit.itemIds : [])
        .map((id) => wardrobeMap.get(id))
        .filter((g): g is ClothingItem => Boolean(g))
    : [];

  const totalGarments = safeWardrobe.length;
  const favoriteOutfitsCount = safeOutfits.filter((o) => o.isFavorite).length;
  const unwornItems = safeWardrobe.filter((g) => g.wearCount === 0);
  const totalValue = safeWardrobe.reduce((sum, g) => sum + g.purchasePrice, 0);
  const totalWears = safeWardrobe.reduce((sum, g) => sum + g.wearCount, 0);
  const avgCostPerWear = totalWears > 0 ? totalValue / totalWears : 0;

  return (
    <div className="space-y-10">
      {/* Editorial Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D8]">
        <div>
          <p className="text-xs font-medium text-[#526B56] mb-1">
            {t('dashboard.overview', 'Personal Closet Overview')}
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
            {t('dashboard.welcomeBack', 'Welcome back,')} {user.displayName.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-[#5C5E58]">{user.styleNote}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('wardrobe')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('dashboard.addGarment', 'Add Garment')}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('builder')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t('dashboard.composeOutfit', 'Compose Outfit')}
          </button>
        </div>
      </div>

      {/* Key Metrics Strip (Single-Elevation, Tabular Numerals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('dashboard.catalogedGarments', 'Cataloged Garments')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            {totalGarments}
          </p>
          <p className="mt-1 text-xs text-[#5C5E58] font-mono-tabular">
            {unwornItems.length} {t('dashboard.unwornInCloset', 'unworn in closet')}
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('dashboard.savedOutfits', 'Saved Outfits')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            {outfits.length}
          </p>
          <p className="mt-1 text-xs text-[#5C5E58] font-mono-tabular">
            {favoriteOutfitsCount} {t('dashboard.markedFavorite', 'marked favorite')}
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('dashboard.avgCostPerWear', 'Avg. Cost Per Wear')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            ${avgCostPerWear.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-[#5C5E58] font-mono-tabular">
            {t('dashboard.acrossTotalWears', `Across ${totalWears} total garment wears`).replace(
              '{count}',
              String(totalWears)
            )}
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('dashboard.scheduledDays', 'Scheduled Days')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            {calendar.filter((c) => c.date >= todayIso).length}
          </p>
          <p className="mt-1 text-xs text-[#5C5E58]">{t('dashboard.upcomingPlans', 'Upcoming calendar plans')}</p>
        </div>
      </div>

      {/* Main Two-Column Split: Today's Planned Outfit + Unworn Rotation Prompt */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <section className="lg:col-span-7 bg-white border border-[#E5E0D8] rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-medium text-[#526B56]">
                {t('dashboard.today', 'Today')} · {todayIso}
              </p>
              <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A] mt-0.5">
                {t('dashboard.todaysScheduledLook', "Today’s Scheduled Look")}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C5E58] hover:text-[#1C1D1A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              {t('dashboard.openCalendar', 'Open Calendar')}
            </button>
          </div>

          {todaysPlan && todaysOutfit ? (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {todaysPieces.map((piece) => (
                  <div key={piece.id} className="space-y-1.5">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden border border-[#EFECE6]">
                      <GarmentImage
                        imageKey={piece.imageKey}
                        customImageUrl={piece.customImageUrl}
                        alt={piece.name}
                        colorHex={piece.colorHex}
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-xs font-medium text-[#1C1D1A] truncate">{piece.name}</p>
                    <p className="text-[11px] text-[#73766E] truncate">{piece.color}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#EFECE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-[#1C1D1A]">{todaysOutfit.name}</h3>
                  <p className="text-xs text-[#5C5E58] mt-0.5">
                    {todaysPlan.occasionNote} · {todaysOutfit.occasion}
                  </p>
                </div>

                {todaysPlan.isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#526B56] whitespace-nowrap">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('dashboard.loggedHistory', 'Logged in Wear History')}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onLogPlannedOutfit(todaysPlan, todaysOutfit)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#526B56] text-white hover:bg-[#435947] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('dashboard.markWornToday', 'Mark Worn Today')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center bg-[#FAF8F5] rounded-lg px-4">
              <p className="text-sm font-medium text-[#1C1D1A]">
                {t('dashboard.noOutfitScheduled', 'No outfit scheduled for today')}
              </p>
              <p className="mt-1 text-xs text-[#5C5E58] max-w-sm mx-auto">
                {t(
                  'dashboard.noOutfitScheduledDesc',
                  'Assign one of your saved outfits on the calendar or generate a weather-matched recommendation.'
                )}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('calendar')}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-[#1C1D1A] text-white hover:bg-[#31332E] transition-colors cursor-pointer"
                >
                  {t('dashboard.scheduleToday', 'Schedule Today')}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('suggestions')}
                  className="px-4 py-2 rounded-lg text-xs font-medium bg-white border border-[#D8D3C8] text-[#1C1D1A] hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                >
                  {t('dashboard.viewSuggestions', 'View Suggestions')}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right Column: Closet Rotation & Recent Wear History */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white border border-[#E5E0D8] rounded-xl p-6">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
                {t('dashboard.rotationOpportunities', 'Rotation Opportunities')}
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('suggestions')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#526B56] hover:text-[#354938] whitespace-nowrap cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t('dashboard.styleIdeas', 'Style Ideas')}
              </button>
            </div>

            {unwornItems.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-[#5C5E58]">
                  {unwornItems.length === 1
                    ? t('dashboard.unwornDebutSingle', 'You have 1 garment waiting for its debut wear:')
                    : t(
                        'dashboard.unwornDebutPlural',
                        `You have ${unwornItems.length} garments waiting for their debut wear:`
                      ).replace('{count}', String(unwornItems.length))}
                </p>
                {unwornItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 pt-3 border-t border-[#EFECE6]"
                  >
                    <div className="w-12 h-16 rounded-md overflow-hidden shrink-0 border border-[#EFECE6]">
                      <GarmentImage
                        imageKey={item.imageKey}
                        customImageUrl={item.customImageUrl}
                        alt={item.name}
                        colorHex={item.colorHex}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1C1D1A] truncate">{item.name}</p>
                      <p className="text-xs text-[#73766E]">
                        {t(`categories.${item.category.toLowerCase()}`, item.category)} · {item.color} · ${item.purchasePrice}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('builder')}
                      className="text-xs font-medium text-[#526B56] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t('dashboard.buildLook', 'Build Look')}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#5C5E58]">
                {t(
                  'dashboard.allWornNotice',
                  'Every item in your digital wardrobe has been worn at least once. Great closet utilization!'
                )}
              </p>
            )}
          </section>

          <section className="bg-white border border-[#E5E0D8] rounded-xl p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
                {t('dashboard.recentWearLog', 'Recent Wear Log')}
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#5C5E58] hover:text-[#1C1D1A] whitespace-nowrap cursor-pointer"
              >
                {t('dashboard.fullHistory', 'Full History')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {wearLogs.length > 0 ? (
              <div className="divide-y divide-[#EFECE6]">
                {wearLogs.slice(0, 3).map((entry) => (
                  <div key={entry.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1C1D1A] truncate">
                        {entry.outfitName}
                      </p>
                      <p className="text-xs text-[#73766E]">
                        {entry.occasion} · {entry.weatherNote}
                      </p>
                    </div>
                    <span className="font-mono-tabular text-xs text-[#5C5E58] shrink-0">
                      {entry.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#5C5E58]">
                {t(
                  'dashboard.noWearsYet',
                  'No wears logged yet. Log your first outfit to track garment rotation.'
                )}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
