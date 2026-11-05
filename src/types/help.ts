import type { Language } from '../i18n/translations';

export type HelpCategory =
  | 'all'
  | 'getting_started'
  | 'wardrobe'
  | 'builder'
  | 'outfits'
  | 'calendar'
  | 'history'
  | 'suggestions_stats'
  | 'settings';

export interface HelpCategoryMeta {
  id: HelpCategory;
  translationKey: string;
  defaultLabel: string;
}

export interface HelpFaqItem {
  id: string;
  category: Exclude<HelpCategory, 'all'>;
  question: Record<Language, string>;
  answer: Record<Language, string>;
  keywords: Record<Language, string[]>;
}
