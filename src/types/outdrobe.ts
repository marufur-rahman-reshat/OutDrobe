export type ClothingCategory =
  | 'Tops'
  | 'Bottoms'
  | 'Outerwear'
  | 'Footwear'
  | 'Accessories';

export type SeasonTag = 'All Seasons' | 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type OccasionTag =
  | 'Daily Studio'
  | 'Professional'
  | 'Campus'
  | 'Evening'
  | 'Weekend'
  | 'Travel';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  styleNote: string;
  createdAt: string;
}

export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  brand: string;
  category: ClothingCategory;
  color: string;
  colorHex: string;
  fabric: string;
  season: SeasonTag;
  purchasePrice: number;
  imageKey: string;
  customImageUrl?: string;
  wearCount: number;
  lastWornDate: string | null;
  isFavorite: boolean;
  notes?: string;
  createdAt: string;
}

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  occasion: OccasionTag;
  season: SeasonTag;
  itemIds: string[];
  isFavorite: boolean;
  wearCount: number;
  lastWornDate: string | null;
  notes: string;
  createdAt: string;
}

export interface CalendarPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  outfitId: string;
  occasionNote: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface WearLogEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  outfitId: string | null;
  outfitName: string;
  itemIds: string[];
  occasion: OccasionTag;
  weatherNote: string;
  notes: string;
  createdAt: string;
}

export interface OutfitSuggestion {
  id: string;
  title: string;
  rationale: string;
  occasion: OccasionTag;
  season: SeasonTag;
  temperatureLabel: string;
  itemIds: string[];
  harmonyLabel: string;
  rotationBenefit: string;
}

export type AppSection =
  | 'dashboard'
  | 'wardrobe'
  | 'builder'
  | 'outfits'
  | 'favorites'
  | 'calendar'
  | 'history'
  | 'suggestions'
  | 'statistics'
  | 'help'
  | 'blueprint';
