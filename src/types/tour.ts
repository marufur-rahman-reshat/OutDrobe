import type { AppSection } from './outdrobe';

export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  badge: string;
  targetSection: AppSection;
  headline: string;
  description: string;
  tip?: string;
}

export const DEMO_TOUR_STEPS: TourStep[] = [
  {
    id: 'step_dashboard',
    stepNumber: 1,
    title: 'Daily Look & Morning Overview',
    badge: 'Morning Control',
    targetSection: 'dashboard',
    headline: 'Start each day with zero decision fatigue',
    description:
      'View your scheduled look for today, glance at active capsule stats, and see recent wear rotation at a glance.',
    tip: 'Notice the Scheduled Outfit card reflecting today’s date with Claire’s studio uniform.',
  },
  {
    id: 'step_wardrobe',
    stepNumber: 2,
    title: 'Curated Digital Wardrobe',
    badge: 'Garment Archive',
    targetSection: 'wardrobe',
    headline: 'A calm, searchable catalog of what you actually own',
    description:
      'Explore Claire’s 9-piece capsule. Filter by category, season, or occasion, and inspect fabric composition and cost-per-wear.',
    tip: 'Click any garment card to inspect tailoring details, fabrics, and purchase metrics.',
  },
  {
    id: 'step_builder',
    stepNumber: 3,
    title: 'Outfit Builder Canvas',
    badge: 'Layering Studio',
    targetSection: 'builder',
    headline: 'Assemble multi-layer ensembles before you get dressed',
    description:
      'Pair tops, bottoms, tailored outerwear, and footwear. OutDrobe validates proportions and balance across your capsule.',
    tip: 'Select garments from the left rack to compose a fresh look on the visual canvas.',
  },
  {
    id: 'step_calendar',
    stepNumber: 4,
    title: 'Weekly Lookbook Schedule',
    badge: 'Calendar Planning',
    targetSection: 'calendar',
    headline: 'Eliminate morning rush by scheduling looks ahead',
    description:
      'Assign outfits to upcoming days, work presentations, and weekend walks. Stay ahead of your week effortlessly.',
    tip: 'Days with scheduled outfits show thumbnail previews and contextual event notes.',
  },
  {
    id: 'step_suggestions',
    stepNumber: 5,
    title: 'Smart Styling & Rotation',
    badge: 'Algorithmic Harmony',
    targetSection: 'suggestions',
    headline: 'Discover fresh combinations from your existing pieces',
    description:
      'Get automated suggestions based on occasion, weather, and capsule rotation to maximize cost-per-wear efficiency.',
    tip: 'Explore curated pairings designed to bring forgotten pieces back into regular wear.',
  },
];
