import React, { useMemo } from 'react';
import type { ClothingCategory, ClothingItem, Outfit, WearLogEntry } from '../../types/outdrobe';
import { useLanguage } from '../../context/LanguageContext';

interface StatisticsViewProps {
  wardrobe: ClothingItem[];
  outfits: Outfit[];
  wearLogs: WearLogEntry[];
}

const CATEGORIES: ClothingCategory[] = [
  'Outerwear',
  'Tops',
  'Bottoms',
  'Footwear',
  'Accessories',
];

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  wardrobe,
  outfits,
  wearLogs,
}) => {
  const { t } = useLanguage();
  const safeWardrobe = Array.isArray(wardrobe) ? wardrobe : [];
  const safeOutfits = Array.isArray(outfits) ? outfits : [];
  const safeWearLogs = Array.isArray(wearLogs) ? wearLogs : [];

  const stats = useMemo(() => {
    const totalValue = safeWardrobe.reduce((sum, g) => sum + g.purchasePrice, 0);
    const totalWears = safeWardrobe.reduce((sum, g) => sum + g.wearCount, 0);
    const wornCount = safeWardrobe.filter((g) => g.wearCount > 0).length;
    const utilizationPct =
      safeWardrobe.length > 0 ? Math.round((wornCount / safeWardrobe.length) * 100) : 0;
    const avgCostPerWear = totalWears > 0 ? totalValue / totalWears : 0;

    const categoryBreakdown = CATEGORIES.map((cat) => {
      const items = safeWardrobe.filter((g) => g.category === cat);
      const catValue = items.reduce((s, i) => s + i.purchasePrice, 0);
      const pct = safeWardrobe.length > 0 ? Math.round((items.length / safeWardrobe.length) * 100) : 0;
      return { category: cat, count: items.length, value: catValue, pct };
    });

    const colorMap = new Map<string, { label: string; hex: string; count: number }>();
    safeWardrobe.forEach((g) => {
      const existing = colorMap.get(g.color);
      if (existing) {
        existing.count += 1;
      } else {
        colorMap.set(g.color, { label: g.color, hex: g.colorHex, count: 1 });
      }
    });

    const colors = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);

    const bestValueItems = [...safeWardrobe]
      .filter((g) => g.wearCount > 0 && g.purchasePrice > 0)
      .sort((a, b) => a.purchasePrice / a.wearCount - b.purchasePrice / b.wearCount)
      .slice(0, 5);

    const leastWornItems = [...safeWardrobe]
      .sort((a, b) => a.wearCount - b.wearCount)
      .slice(0, 5);

    return {
      totalValue,
      totalWears,
      utilizationPct,
      avgCostPerWear,
      categoryBreakdown,
      colors,
      bestValueItems,
      leastWornItems,
    };
  }, [safeWardrobe]);

  return (
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#E5E0D8]">
        <p className="text-xs font-medium text-[#526B56] mb-1">
          {t('statistics.economicsEyebrow', 'Closet Economics & Utilization')}
        </p>
        <h1 className="font-editorial text-3xl sm:text-4xl font-medium text-[#1C1D1A]">
          {t('statistics.statsTitle', 'Wardrobe Statistics')}
        </h1>
        <p className="mt-1 text-sm text-[#5C5E58]">
          {t(
            'statistics.statsSubtitle',
            'Quantitative view of garment frequency, color palette balance, and cost-per-wear return.'
          )}
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('statistics.totalInvestment', 'Total Closet Investment')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            ${stats.totalValue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-[#5C5E58] font-mono-tabular">
            {t('statistics.acrossGarments', `Across ${safeWardrobe.length} garments`).replace(
              '{count}',
              String(safeWardrobe.length)
            )}
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('statistics.closetUtilization', 'Closet Utilization')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            {stats.utilizationPct}%
          </p>
          <p className="mt-1 text-xs text-[#5C5E58]">
            {t('statistics.wornOnce', 'Items worn at least once')}
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('statistics.portfolioCpw', 'Portfolio Cost / Wear')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            ${stats.avgCostPerWear.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-[#5C5E58] font-mono-tabular">
            {t('statistics.cumulativeWears', `${stats.totalWears} cumulative garment wears`).replace(
              '{count}',
              String(stats.totalWears)
            )}
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-xl p-5">
          <p className="text-xs text-[#73766E]">{t('statistics.diaryEntries', 'Diary Entries')}</p>
          <p className="mt-2 font-mono-tabular text-2xl font-medium text-[#1C1D1A]">
            {safeWearLogs.length}
          </p>
          <p className="mt-1 text-xs text-[#5C5E58] font-mono-tabular">
            {t('statistics.savedFormulas', `${safeOutfits.length} saved outfit formulas`).replace(
              '{count}',
              String(safeOutfits.length)
            )}
          </p>
        </div>
      </div>

      {/* Category Distribution & Color Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white border border-[#E5E0D8] rounded-xl p-6 space-y-5">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
            {t('statistics.categoryBreakdown', 'Category Breakdown')}
          </h2>
          <div className="space-y-4">
            {stats.categoryBreakdown.map((row) => (
              <div key={row.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1C1D1A]">
                    {t(`categories.${row.category.toLowerCase()}`, row.category)}
                  </span>
                  <span className="font-mono-tabular text-[#5C5E58]">
                    {row.count} {t('statistics.items', 'items')} · ${row.value} ({row.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#F2EFE9] overflow-hidden">
                  <div
                    className="h-full bg-[#526B56] rounded-full"
                    style={{ width: `${Math.max(row.pct, row.count > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#E5E0D8] rounded-xl p-6 space-y-5">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A]">
            {t('statistics.colorPalette', 'Color Palette Harmony')}
          </h2>
          <div className="divide-y divide-[#EFECE6]">
            {stats.colors.map((c) => (
              <div key={c.label} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="text-sm text-[#1C1D1A]">{c.label}</span>
                </div>
                <span className="font-mono-tabular text-xs text-[#5C5E58]">
                  {c.count} {c.count === 1 ? t('statistics.piece', 'piece') : t('statistics.pieces', 'pieces')}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Best Cost-Per-Wear Leaderboard vs Under-Rotated Pieces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white border border-[#E5E0D8] rounded-xl p-6">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A] mb-4">
            {t('statistics.lowestCpw', 'Lowest Cost-Per-Wear Staples')}
          </h2>
          <div className="divide-y divide-[#EFECE6]">
            {stats.bestValueItems.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1C1D1A] truncate">{item.name}</p>
                  <p className="text-xs text-[#73766E]">
                    {t(`categories.${item.category.toLowerCase()}`, item.category)} · {t('statistics.retail', 'Retail')} ${item.purchasePrice}
                  </p>
                </div>
                <div className="text-right font-mono-tabular shrink-0">
                  <p className="text-sm font-semibold text-[#526B56]">
                    ${(item.purchasePrice / item.wearCount).toFixed(2)} {t('clothingCard.perWear', '/ wear')}
                  </p>
                  <p className="text-xs text-[#73766E]">
                    {item.wearCount} {t('clothingCard.wearsUnit', 'wears')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#E5E0D8] rounded-xl p-6">
          <h2 className="font-editorial text-2xl font-medium text-[#1C1D1A] mb-4">
            {t('statistics.lowestRotation', 'Lowest Rotation Pieces')}
          </h2>
          <div className="divide-y divide-[#EFECE6]">
            {stats.leastWornItems.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1C1D1A] truncate">{item.name}</p>
                  <p className="text-xs text-[#73766E]">
                    {t(`categories.${item.category.toLowerCase()}`, item.category)} · {item.color}
                  </p>
                </div>
                <div className="text-right font-mono-tabular shrink-0">
                  <p className="text-sm font-medium text-[#1C1D1A]">
                    {item.wearCount} {t('clothingCard.wearsUnit', 'wears')}
                  </p>
                  <p className="text-xs text-[#73766E]">
                    {item.lastWornDate
                      ? t('statistics.lastWorn', `Last ${item.lastWornDate}`).replace(
                          '{date}',
                          item.lastWornDate
                        )
                      : t('statistics.unworn', 'Unworn')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
