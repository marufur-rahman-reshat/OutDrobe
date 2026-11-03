import type {
  CalendarPlan,
  ClothingCategory,
  ClothingItem,
  OccasionTag,
  Outfit,
  OutfitSuggestion,
  SeasonTag,
  UserProfile,
  WearLogEntry,
} from '../types/outdrobe';
import { supabase } from '../lib/supabaseClient';
import {
  deleteGarmentImage,
  getBatchSignedGarmentUrls,
  getSignedGarmentUrl,
  isStoragePath,
  uploadGarmentImage,
} from './storageService';

const TOKEN_STORAGE_KEY = 'outdrobe_session_token';

export interface WorkspaceSnapshot {
  wardrobe: ClothingItem[];
  outfits: Outfit[];
  calendar: CalendarPlan[];
  wearLogs: WearLogEntry[];
}

export function getSavedToken(): string | null {
  try {
    const explicit = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (explicit) return explicit;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        return localStorage.getItem(key);
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function setSavedToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors in restricted frames
  }
}

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getSavedToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data as T;
}

async function buildUserProfileFromSupabase(user: {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<UserProfile> {
  let displayName =
    (user.user_metadata?.display_name as string) ||
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    '';
  let styleNote = 'Personal Digital Wardrobe';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      if (profile.display_name) displayName = String(profile.display_name);
      if (profile.style_note) styleNote = String(profile.style_note);
    }
  } catch {
    // Fall back to user metadata if profiles query fails
  }

  if (!displayName) {
    displayName = user.email ? user.email.split('@')[0] : 'Wardrobe Curator';
  }

  return {
    uid: user.id,
    email: user.email || '',
    displayName,
    styleNote,
    createdAt: user.created_at || new Date().toISOString(),
  };
}

interface DatabaseClothingRow {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  category: string;
  color: string | null;
  color_hex: string | null;
  fabric: string | null;
  season: string | null;
  purchase_price: number | string | null;
  image_key: string | null;
  image_url: string | null;
  wear_count: number | null;
  last_worn_date: string | null;
  is_favorite: boolean | null;
  notes: string | null;
  created_at: string;
}

function mapDatabaseClothingRowToItem(
  row: DatabaseClothingRow,
  resolvedImageUrl?: string
): ClothingItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name || 'Untitled Garment'),
    brand: String(row.brand || 'Personal Archive'),
    category: (row.category || 'Tops') as ClothingCategory,
    color: String(row.color || 'Neutral'),
    colorHex: String(row.color_hex || '#8C8A82'),
    fabric: String(row.fabric || 'Natural Fiber'),
    season: (row.season || 'All Seasons') as SeasonTag,
    purchasePrice: Math.max(0, Number(row.purchase_price) || 0),
    imageKey: String(row.image_key || 'sage_blazer'),
    customImageUrl:
      resolvedImageUrl !== undefined
        ? resolvedImageUrl
        : row.image_url
        ? String(row.image_url)
        : undefined,
    wearCount: Math.max(0, Number(row.wear_count) || 0),
    lastWornDate: row.last_worn_date ? String(row.last_worn_date) : null,
    isFavorite: Boolean(row.is_favorite),
    notes: row.notes ? String(row.notes) : '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

interface DatabaseOutfitRow {
  id: string;
  user_id: string;
  name: string;
  occasion: string;
  season: string;
  is_favorite: boolean | null;
  wear_count: number | null;
  last_worn_date: string | null;
  notes: string | null;
  created_at: string;
  outfit_items?: Array<{ clothing_item_id: string }> | null;
}

function mapDatabaseOutfitRowToItem(
  row: DatabaseOutfitRow,
  itemIds?: string[]
): Outfit {
  const resolvedItemIds: string[] =
    itemIds !== undefined
      ? itemIds
      : Array.isArray(row.outfit_items)
      ? row.outfit_items.map((oi) => String(oi.clothing_item_id)).filter(Boolean)
      : [];

  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name || 'Untitled Ensemble'),
    occasion: (row.occasion || 'Daily Studio') as OccasionTag,
    season: (row.season || 'All Seasons') as SeasonTag,
    itemIds: resolvedItemIds,
    isFavorite: Boolean(row.is_favorite),
    wearCount: Math.max(0, Number(row.wear_count) || 0),
    lastWornDate: row.last_worn_date ? String(row.last_worn_date) : null,
    notes: row.notes ? String(row.notes) : '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

interface DatabaseWearLogRow {
  id: string;
  user_id: string;
  date: string;
  outfit_id: string | null;
  outfit_name: string | null;
  item_ids: string[] | null;
  occasion: string | null;
  weather_note: string | null;
  notes: string | null;
  created_at: string;
}

function mapDatabaseWearLogRowToItem(row: DatabaseWearLogRow): WearLogEntry {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    date: String(row.date),
    outfitId: row.outfit_id ? String(row.outfit_id) : null,
    outfitName: String(row.outfit_name || 'Custom Ensemble'),
    itemIds: Array.isArray(row.item_ids) ? row.item_ids.map(String) : [],
    occasion: (row.occasion || 'Daily Studio') as OccasionTag,
    weatherNote: String(row.weather_note || 'Mild'),
    notes: String(row.notes || ''),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

interface DatabaseCalendarPlanRow {
  id: string;
  user_id: string;
  date: string;
  outfit_id: string;
  occasion_note: string | null;
  is_completed: boolean | null;
  created_at: string;
}

function mapDatabaseCalendarPlanRowToItem(row: DatabaseCalendarPlanRow): CalendarPlan {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    date: String(row.date),
    outfitId: String(row.outfit_id),
    occasionNote: String(row.occasion_note || ''),
    isCompleted: Boolean(row.is_completed),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export const outdrobeApi = {
  async loginDemo(): Promise<{ token: string; user: UserProfile }> {
    throw new Error(
      'Demo login is disabled during Supabase integration. Please sign in or create an account with your email.'
    );
  },

  async login(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Sign in failed. No active session returned.');
    }

    setSavedToken(data.session.access_token);
    const userProfile = await buildUserProfileFromSupabase(data.user);
    return { token: data.session.access_token, user: userProfile };
  },

  async register(
    displayName: string,
    email: string,
    password: string,
    _startWithSampleCapsule: boolean
  ): Promise<{ token: string; user: UserProfile }> {
    const trimmedEmail = email.trim();
    const trimmedName = displayName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          display_name: trimmedName,
          full_name: trimmedName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed. Unable to create user.');
    }

    // Handle email confirmation requirement gracefully
    if (!data.session) {
      throw new Error(
        'Account created! Please check your email inbox to confirm your account before signing in.'
      );
    }

    setSavedToken(data.session.access_token);
    const userProfile = await buildUserProfileFromSupabase(data.user);
    return { token: data.session.access_token, user: userProfile };
  },

  async getCurrentUser(): Promise<{ user: UserProfile }> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error(error?.message || 'No authenticated Supabase user found.');
    }

    const userProfile = await buildUserProfileFromSupabase(user);
    return { user: userProfile };
  },

  async updateProfile(updates: {
    displayName?: string;
    styleNote?: string;
  }): Promise<{ user: UserProfile }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to update profile.');
    }

    const payload: Record<string, string> = {};
    if (updates.displayName !== undefined) {
      payload.display_name = updates.displayName.trim();
    }
    if (updates.styleNote !== undefined) {
      payload.style_note = updates.styleNote.trim();
    }

    if (Object.keys(payload).length === 0) {
      const current = await buildUserProfileFromSupabase(user);
      return { user: current };
    }

    // 1. Update public.profiles in PostgreSQL FIRST (primary source of truth)
    const { data: updatedProfile, error: dbError } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select('*')
      .maybeSingle();

    if (dbError) {
      throw new Error(`Failed to update profile: ${dbError.message}`);
    }

    // 2. Only after database update succeeds, synchronize auth user metadata
    if (payload.display_name) {
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          display_name: payload.display_name,
          full_name: payload.display_name,
        },
      });

      if (metaError && typeof console !== 'undefined') {
        console.warn('[Profile Update] Auth metadata synchronization encountered an error.');
      }
    }

    // 3. Return updated profile using database row as primary source of truth
    const userProfile: UserProfile = {
      uid: user.id,
      email: user.email || '',
      displayName:
        updatedProfile?.display_name ||
        payload.display_name ||
        (user.user_metadata?.display_name as string) ||
        user.email?.split('@')[0] ||
        'Wardrobe Curator',
      styleNote:
        updatedProfile?.style_note ||
        payload.style_note ||
        'Personal Digital Wardrobe',
      createdAt: updatedProfile?.created_at || user.created_at || new Date().toISOString(),
    };

    return { user: userProfile };
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } finally {
      setSavedToken(null);
    }
  },

  async getWorkspace(): Promise<WorkspaceSnapshot> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let wardrobe: ClothingItem[] = [];

    if (user) {
      try {
        const { data, error } = await supabase
          .from('clothing_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          // Identify which image_url values are private Storage object paths
          const imagePaths = data
            .map((r) => r.image_url as string | null)
            .filter((p): p is string => Boolean(p));

          // Generate signed URLs in a single batch
          const signedUrlsMap = await getBatchSignedGarmentUrls(imagePaths);

          wardrobe = data.map((row) => {
            const rawUrl = row.image_url ? String(row.image_url) : undefined;
            const resolvedUrl = rawUrl ? signedUrlsMap.get(rawUrl) || rawUrl : undefined;
            return mapDatabaseClothingRowToItem(row as DatabaseClothingRow, resolvedUrl);
          });
        } else if (error) {
          console.warn('[Workspace] Supabase wardrobe query notice:', error.message);
        }
      } catch (err) {
        console.warn('[Workspace] Failed to fetch wardrobe from Supabase:', err);
      }
    }

    // Fetch outfits from Supabase with relational outfit_items
    let outfits: Outfit[] = [];

    if (user) {
      try {
        const { data: outfitData, error: outfitError } = await supabase
          .from('outfits')
          .select('*, outfit_items(clothing_item_id)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!outfitError && Array.isArray(outfitData)) {
          outfits = outfitData.map((row) =>
            mapDatabaseOutfitRowToItem(row as DatabaseOutfitRow)
          );
        } else if (outfitError) {
          console.warn('[Workspace] Supabase outfits query notice:', outfitError.message);
        }
      } catch (err) {
        console.warn('[Workspace] Failed to fetch outfits from Supabase:', err);
      }
    }

    // Fetch calendar plans from Supabase
    let calendar: CalendarPlan[] = [];

    if (user) {
      try {
        const { data: calendarData, error: calendarError } = await supabase
          .from('calendar_plans')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (!calendarError && Array.isArray(calendarData)) {
          calendar = calendarData.map((row) =>
            mapDatabaseCalendarPlanRowToItem(row as DatabaseCalendarPlanRow)
          );
        } else if (calendarError) {
          console.warn('[Workspace] Supabase calendar query notice:', calendarError.message);
        }
      } catch (err) {
        console.warn('[Workspace] Failed to fetch calendar from Supabase:', err);
      }
    }

    // Fetch wear logs from Supabase
    let wearLogs: WearLogEntry[] = [];

    if (user) {
      try {
        const { data: logsData, error: logsError } = await supabase
          .from('wear_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (!logsError && Array.isArray(logsData)) {
          wearLogs = logsData.map((row) =>
            mapDatabaseWearLogRowToItem(row as DatabaseWearLogRow)
          );
        } else if (logsError) {
          console.warn('[Workspace] Supabase wear logs query notice:', logsError.message);
        }
      } catch (err) {
        console.warn('[Workspace] Failed to fetch wear logs from Supabase:', err);
      }
    }

    return {
      wardrobe,
      outfits,
      calendar,
      wearLogs,
    };
  },

  async createGarment(payload: Partial<ClothingItem>): Promise<{ item: ClothingItem }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to create a garment.');
    }

    if (!payload.name || !payload.category) {
      throw new Error('Garment name and category are required.');
    }

    let storagePathToSave: string | null = null;
    let newlyUploadedPath: string | null = null;

    // 1. If payload contains a new Base64 image, upload to Storage first
    if (payload.customImageUrl && payload.customImageUrl.startsWith('data:')) {
      const uploadResult = await uploadGarmentImage(payload.customImageUrl);
      storagePathToSave = uploadResult.path;
      newlyUploadedPath = uploadResult.path;
    } else if (payload.customImageUrl && isStoragePath(payload.customImageUrl)) {
      storagePathToSave = payload.customImageUrl.trim();
    } else if (
      payload.customImageUrl &&
      (payload.customImageUrl.startsWith('http://') || payload.customImageUrl.startsWith('https://'))
    ) {
      storagePathToSave = payload.customImageUrl.trim();
    }

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      name: payload.name.trim(),
      brand: payload.brand?.trim() || 'Personal Archive',
      category: payload.category,
      color: payload.color?.trim() || 'Neutral',
      color_hex: payload.colorHex || '#8C8A82',
      fabric: payload.fabric?.trim() || 'Natural Fiber',
      season: payload.season || 'All Seasons',
      purchase_price: Math.max(0, Number(payload.purchasePrice) || 0),
      image_key: payload.imageKey || 'sage_blazer',
      image_url: storagePathToSave,
      wear_count: Math.max(0, Number(payload.wearCount) || 0),
      last_worn_date: payload.lastWornDate || null,
      is_favorite: Boolean(payload.isFavorite),
      notes: payload.notes ? payload.notes.trim() : '',
    };

    const { data, error } = await supabase
      .from('clothing_items')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error || !data) {
      // If database insertion fails after upload, attempt to remove the newly uploaded file
      if (newlyUploadedPath) {
        try {
          await deleteGarmentImage(newlyUploadedPath);
        } catch (cleanupErr) {
          console.warn('[Storage Cleanup] Failed to remove orphaned image after DB insert error:', cleanupErr);
        }
      }
      throw new Error(`Failed to create garment: ${error?.message || 'Database insert failed'}`);
    }

    // Resolve signed URL for the returned item so caller can display it immediately
    const resolvedUrl = storagePathToSave
      ? (await getSignedGarmentUrl(storagePathToSave)) || storagePathToSave
      : undefined;

    return { item: mapDatabaseClothingRowToItem(data as DatabaseClothingRow, resolvedUrl) };
  },

  async updateGarment(id: string, payload: Partial<ClothingItem>): Promise<{ item: ClothingItem }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to update a garment.');
    }

    // Fetch existing garment row to safely identify existing image_url and verify ownership
    const { data: existingRow, error: fetchError } = await supabase
      .from('clothing_items')
      .select('id, image_url, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingRow) {
      throw new Error(fetchError?.message || 'Garment not found or access denied.');
    }

    const oldImageUrl = existingRow.image_url as string | null;
    let newlyUploadedPath: string | null = null;
    let shouldUpdateImageUrl = false;
    let newImageUrlValue: string | null = null;
    let shouldDeleteOldStorageObject = false;

    // Handle customImageUrl update logic safely
    if (payload.customImageUrl !== undefined) {
      if (payload.customImageUrl === null || payload.customImageUrl === '') {
        // Image explicitly cleared or reverted to preset
        shouldUpdateImageUrl = true;
        newImageUrlValue = null;
        if (oldImageUrl && isStoragePath(oldImageUrl)) {
          shouldDeleteOldStorageObject = true;
        }
      } else if (payload.customImageUrl.startsWith('data:')) {
        // New Base64 image uploaded from device
        const uploadResult = await uploadGarmentImage(payload.customImageUrl);
        newlyUploadedPath = uploadResult.path;
        shouldUpdateImageUrl = true;
        newImageUrlValue = uploadResult.path;
        if (oldImageUrl && isStoragePath(oldImageUrl)) {
          shouldDeleteOldStorageObject = true;
        }
      } else if (isStoragePath(payload.customImageUrl)) {
        // Already a storage path
        if (payload.customImageUrl !== oldImageUrl) {
          shouldUpdateImageUrl = true;
          newImageUrlValue = payload.customImageUrl;
        }
      }
      // Note: If payload.customImageUrl starts with http (e.g. existing signed URL), do NOT overwrite storage path in DB!
    }

    const updatePayload: Record<string, unknown> = {};
    if (payload.name !== undefined) updatePayload.name = payload.name.trim();
    if (payload.brand !== undefined) updatePayload.brand = payload.brand.trim();
    if (payload.category !== undefined) updatePayload.category = payload.category;
    if (payload.color !== undefined) updatePayload.color = payload.color.trim();
    if (payload.colorHex !== undefined) updatePayload.color_hex = payload.colorHex;
    if (payload.fabric !== undefined) updatePayload.fabric = payload.fabric.trim();
    if (payload.season !== undefined) updatePayload.season = payload.season;
    if (payload.purchasePrice !== undefined) {
      updatePayload.purchase_price = Math.max(0, Number(payload.purchasePrice) || 0);
    }
    if (payload.imageKey !== undefined) updatePayload.image_key = payload.imageKey;
    if (shouldUpdateImageUrl) {
      updatePayload.image_url = newImageUrlValue;
    }
    if (payload.wearCount !== undefined) {
      updatePayload.wear_count = Math.max(0, Number(payload.wearCount) || 0);
    }
    if (payload.lastWornDate !== undefined) updatePayload.last_worn_date = payload.lastWornDate;
    if (payload.isFavorite !== undefined) updatePayload.is_favorite = Boolean(payload.isFavorite);
    if (payload.notes !== undefined) updatePayload.notes = payload.notes.trim();

    const { data: updatedData, error: updateError } = await supabase
      .from('clothing_items')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError || !updatedData) {
      // If DB update fails, clean up the newly uploaded file while keeping old file intact
      if (newlyUploadedPath) {
        try {
          await deleteGarmentImage(newlyUploadedPath);
        } catch (cleanupErr) {
          console.warn('[Storage Cleanup] Failed to remove new upload after DB update error:', cleanupErr);
        }
      }
      throw new Error(`Failed to update garment: ${updateError?.message || 'Database update failed'}`);
    }

    // Only after database update succeeds, delete the old Storage object
    if (shouldDeleteOldStorageObject && oldImageUrl && isStoragePath(oldImageUrl)) {
      try {
        await deleteGarmentImage(oldImageUrl);
      } catch (cleanupErr) {
        console.warn('[Storage Cleanup] Notice: Old storage image cleanup warning:', cleanupErr);
      }
    }

    const finalRawUrl = updatedData.image_url ? String(updatedData.image_url) : undefined;
    const resolvedUrl = finalRawUrl ? (await getSignedGarmentUrl(finalRawUrl)) || finalRawUrl : undefined;

    return { item: mapDatabaseClothingRowToItem(updatedData as DatabaseClothingRow, resolvedUrl) };
  },

  async deleteGarment(id: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to delete a garment.');
    }

    // 1. Identify existing image_url before deletion
    const { data: existingRow } = await supabase
      .from('clothing_items')
      .select('image_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    const existingImageUrl = existingRow?.image_url as string | null | undefined;

    // 2. Clean up any junction references in outfit_items before deleting the garment
    try {
      await supabase
        .from('outfit_items')
        .delete()
        .eq('clothing_item_id', id)
        .eq('user_id', user.id);
    } catch (junctionErr) {
      console.warn('[Garment Deletion] Notice when clearing outfit_items references:', junctionErr);
    }

    // 3. Delete database row using authenticated user scope
    const { error: dbError } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) {
      throw new Error(`Failed to delete garment: ${dbError.message}`);
    }

    // 4. Only after successful database deletion, attempt to remove its Storage object
    if (existingImageUrl && isStoragePath(existingImageUrl)) {
      try {
        await deleteGarmentImage(existingImageUrl);
      } catch (storageErr: unknown) {
        const msg = storageErr instanceof Error ? storageErr.message : 'Unknown storage error';
        console.warn(`[Storage Cleanup] Post-delete storage cleanup warning for garment ${id}: ${msg}`);
      }
    }
  },

  async createOutfit(payload: Partial<Outfit>): Promise<{ outfit: Outfit }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to create an outfit.');
    }

    if (!payload.name?.trim()) {
      throw new Error('Outfit name is required.');
    }

    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      name: payload.name.trim(),
      occasion: payload.occasion || 'Daily Studio',
      season: payload.season || 'All Seasons',
      is_favorite: Boolean(payload.isFavorite),
      wear_count: Math.max(0, Number(payload.wearCount) || 0),
      last_worn_date: payload.lastWornDate || null,
      notes: payload.notes ? payload.notes.trim() : '',
    };

    // 1. Insert parent outfit into public.outfits
    const { data: createdOutfit, error: outfitError } = await supabase
      .from('outfits')
      .insert(insertPayload)
      .select('*')
      .single();

    if (outfitError || !createdOutfit) {
      throw new Error(`Failed to create outfit: ${outfitError?.message || 'Insert failed'}`);
    }

    const newOutfitId = String(createdOutfit.id);
    const itemIdsToInsert = Array.isArray(payload.itemIds)
      ? Array.from(new Set(payload.itemIds.filter((id): id is string => typeof id === 'string' && id.trim() !== '')))
      : [];

    // 2. Insert itemIds into public.outfit_items if any items were selected
    if (itemIdsToInsert.length > 0) {
      const junctionRows = itemIdsToInsert.map((clothingItemId) => ({
        outfit_id: newOutfitId,
        clothing_item_id: clothingItemId,
        user_id: user.id,
      }));

      const { error: junctionError } = await supabase
        .from('outfit_items')
        .insert(junctionRows);

      if (junctionError) {
        // Roll back parent outfit on junction insert failure
        try {
          await supabase.from('outfits').delete().eq('id', newOutfitId).eq('user_id', user.id);
        } catch (cleanupErr) {
          console.warn('[Outfit Rollback] Failed to delete parent outfit after junction failure:', cleanupErr);
        }
        throw new Error(`Failed to save outfit garments: ${junctionError.message}`);
      }
    }

    return {
      outfit: mapDatabaseOutfitRowToItem(createdOutfit as DatabaseOutfitRow, itemIdsToInsert),
    };
  },

  async updateOutfit(id: string, payload: Partial<Outfit>): Promise<{ outfit: Outfit }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to update an outfit.');
    }

    // 1. Verify ownership and fetch existing outfit
    const { data: existingOutfit, error: fetchError } = await supabase
      .from('outfits')
      .select('id, user_id, outfit_items(clothing_item_id)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingOutfit) {
      throw new Error(fetchError?.message || 'Outfit not found or access denied.');
    }

    const updatePayload: Record<string, unknown> = {};
    if (payload.name !== undefined) updatePayload.name = payload.name.trim();
    if (payload.occasion !== undefined) updatePayload.occasion = payload.occasion;
    if (payload.season !== undefined) updatePayload.season = payload.season;
    if (payload.isFavorite !== undefined) updatePayload.is_favorite = Boolean(payload.isFavorite);
    if (payload.wearCount !== undefined) updatePayload.wear_count = Math.max(0, Number(payload.wearCount) || 0);
    if (payload.lastWornDate !== undefined) updatePayload.last_worn_date = payload.lastWornDate;
    if (payload.notes !== undefined) updatePayload.notes = payload.notes.trim();

    // 2. Update outfit metadata if any fields changed
    let updatedOutfit = existingOutfit;
    if (Object.keys(updatePayload).length > 0) {
      const { data: updatedData, error: updateError } = await supabase
        .from('outfits')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (updateError || !updatedData) {
        throw new Error(`Failed to update outfit: ${updateError?.message || 'Update failed'}`);
      }
      updatedOutfit = updatedData;
    }

    // 3. If itemIds are supplied, safely replace junction rows
    let finalItemIds: string[];

    if (payload.itemIds !== undefined) {
      const newItemIds = Array.isArray(payload.itemIds)
        ? Array.from(new Set(payload.itemIds.filter((cid): cid is string => typeof cid === 'string' && cid.trim() !== '')))
        : [];

      // Delete existing junction rows for this outfit
      const { error: deleteJunctionError } = await supabase
        .from('outfit_items')
        .delete()
        .eq('outfit_id', id)
        .eq('user_id', user.id);

      if (deleteJunctionError) {
        throw new Error(`Failed to update outfit items: ${deleteJunctionError.message}`);
      }

      // Insert new junction rows if not empty
      if (newItemIds.length > 0) {
        const junctionRows = newItemIds.map((clothingItemId) => ({
          outfit_id: id,
          clothing_item_id: clothingItemId,
          user_id: user.id,
        }));

        const { error: insertJunctionError } = await supabase
          .from('outfit_items')
          .insert(junctionRows);

        if (insertJunctionError) {
          throw new Error(`Failed to re-link outfit items: ${insertJunctionError.message}`);
        }
      }

      finalItemIds = newItemIds;
    } else {
      // Preserve existing itemIds if omitted in payload
      const existingJunction = (existingOutfit as { outfit_items?: Array<{ clothing_item_id: string }> }).outfit_items;
      finalItemIds = Array.isArray(existingJunction)
        ? existingJunction.map((oi) => String(oi.clothing_item_id)).filter(Boolean)
        : [];
    }

    return {
      outfit: mapDatabaseOutfitRowToItem(updatedOutfit as DatabaseOutfitRow, finalItemIds),
    };
  },

  async deleteOutfit(id: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to delete an outfit.');
    }

    // 1. Delete junction rows first
    const { error: junctionError } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', id)
      .eq('user_id', user.id);

    if (junctionError) {
      console.warn('[Outfit Deletion] Notice when clearing outfit_items:', junctionError.message);
    }

    // 2. Delete parent outfit
    const { error: outfitError } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (outfitError) {
      throw new Error(`Failed to delete outfit: ${outfitError.message}`);
    }
  },

  async scheduleOutfit(payload: {
    date: string;
    outfitId: string;
    occasionNote: string;
  }): Promise<{ plan: CalendarPlan }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to schedule an outfit.');
    }

    // If a plan already exists for this date, update it, otherwise insert
    const { data: existingPlan } = await supabase
      .from('calendar_plans')
      .select('id')
      .eq('date', payload.date)
      .eq('user_id', user.id)
      .maybeSingle();

    let resultPlan: DatabaseCalendarPlanRow;

    if (existingPlan) {
      const { data, error } = await supabase
        .from('calendar_plans')
        .update({
          outfit_id: payload.outfitId,
          occasion_note: payload.occasionNote || '',
          is_completed: false,
        })
        .eq('id', existingPlan.id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(`Failed to update calendar schedule: ${error?.message || 'Update failed'}`);
      }
      resultPlan = data as DatabaseCalendarPlanRow;
    } else {
      const { data, error } = await supabase
        .from('calendar_plans')
        .insert({
          user_id: user.id,
          date: payload.date,
          outfit_id: payload.outfitId,
          occasion_note: payload.occasionNote || '',
          is_completed: false,
        })
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(`Failed to schedule outfit: ${error?.message || 'Insert failed'}`);
      }
      resultPlan = data as DatabaseCalendarPlanRow;
    }

    return { plan: mapDatabaseCalendarPlanRowToItem(resultPlan) };
  },

  async removeCalendarPlan(id: string): Promise<void> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to remove a calendar plan.');
    }

    const { error } = await supabase
      .from('calendar_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to remove calendar plan: ${error.message}`);
    }
  },

  async logWear(payload: {
    date: string;
    outfitId: string | null;
    itemIds?: string[];
    occasion: string;
    weatherNote: string;
    notes: string;
    calendarPlanId?: string;
  }): Promise<{
    entry: WearLogEntry;
    wardrobe: ClothingItem[];
    outfits: Outfit[];
    calendar: CalendarPlan[];
  }> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error(authError?.message || 'Authentication required to log wear.');
    }

    let outfitName = 'Custom Look';
    let resolvedItemIds: string[] = Array.isArray(payload.itemIds) ? payload.itemIds : [];

    // 1. If outfitId is provided, look up outfit name and items if needed
    if (payload.outfitId) {
      const { data: outfitRow } = await supabase
        .from('outfits')
        .select('name, wear_count, outfit_items(clothing_item_id)')
        .eq('id', payload.outfitId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (outfitRow) {
        outfitName = outfitRow.name || outfitName;
        if (resolvedItemIds.length === 0 && Array.isArray(outfitRow.outfit_items)) {
          resolvedItemIds = outfitRow.outfit_items.map((oi) => oi.clothing_item_id);
        }

        // Increment outfit wear count and update last_worn_date
        const currentCount = Number(outfitRow.wear_count) || 0;
        await supabase
          .from('outfits')
          .update({
            wear_count: currentCount + 1,
            last_worn_date: payload.date,
          })
          .eq('id', payload.outfitId)
          .eq('user_id', user.id);
      }
    }

    // 2. Increment garment wear counts for all worn items
    if (resolvedItemIds.length > 0) {
      for (const itemId of resolvedItemIds) {
        const { data: itemRow } = await supabase
          .from('clothing_items')
          .select('wear_count')
          .eq('id', itemId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (itemRow) {
          const count = Number(itemRow.wear_count) || 0;
          await supabase
            .from('clothing_items')
            .update({
              wear_count: count + 1,
              last_worn_date: payload.date,
            })
            .eq('id', itemId)
            .eq('user_id', user.id);
        }
      }
    }

    // 3. Insert row into public.wear_logs
    const insertPayload = {
      user_id: user.id,
      date: payload.date,
      outfit_id: payload.outfitId || null,
      outfit_name: outfitName,
      item_ids: resolvedItemIds,
      occasion: payload.occasion || 'Daily Studio',
      weather_note: payload.weatherNote || 'Mild',
      notes: payload.notes ? payload.notes.trim() : '',
    };

    const { data: insertedLog, error: logError } = await supabase
      .from('wear_logs')
      .insert(insertPayload)
      .select('*')
      .single();

    if (logError || !insertedLog) {
      throw new Error(`Failed to log wear: ${logError?.message || 'Database insert failed'}`);
    }

    // 4. If calendarPlanId is provided, mark plan as completed
    if (payload.calendarPlanId) {
      await supabase
        .from('calendar_plans')
        .update({ is_completed: true })
        .eq('id', payload.calendarPlanId)
        .eq('user_id', user.id);
    }

    // 5. Fetch fresh workspace snapshot to keep all views in sync
    const freshWorkspace = await outdrobeApi.getWorkspace();

    return {
      entry: mapDatabaseWearLogRowToItem(insertedLog as DatabaseWearLogRow),
      wardrobe: freshWorkspace.wardrobe,
      outfits: freshWorkspace.outfits,
      calendar: freshWorkspace.calendar,
    };
  },

  async getSuggestions(
    occasion: string,
    climate: string,
    customWardrobe?: ClothingItem[]
  ): Promise<{ suggestions: OutfitSuggestion[] }> {
    try {
      const wardrobe =
        Array.isArray(customWardrobe) && customWardrobe.length > 0
          ? customWardrobe
          : (await outdrobeApi.getWorkspace()).wardrobe;

      const tops = wardrobe.filter((g) => g.category === 'Tops');
      const bottoms = wardrobe.filter((g) => g.category === 'Bottoms');
      const shoes = wardrobe.filter((g) => g.category === 'Footwear');
      const layers = wardrobe.filter((g) => g.category === 'Outerwear');

      const suggestions: OutfitSuggestion[] = [];

      if (tops.length > 0 && bottoms.length > 0) {
        const primaryPieces: string[] = [tops[0].id, bottoms[0].id];
        if (shoes.length > 0) primaryPieces.push(shoes[0].id);
        if (layers.length > 0) primaryPieces.push(layers[0].id);

        suggestions.push({
          id: 'sugg_core_ensemble',
          title: `${occasion} Architectural Capsule`,
          rationale: `Curated for ${climate.toLowerCase()} weather: combines ${tops[0].name} with ${bottoms[0].name} for optimal color balance.`,
          occasion: (occasion as OccasionTag) || 'Daily Studio',
          season: 'All Seasons',
          temperatureLabel: `${climate} Weather Selection`,
          itemIds: primaryPieces,
          harmonyLabel: 'Monochromatic Warm Minimalist',
          rotationBenefit: 'Balances piece utilization',
        });

        if (tops.length > 1 || bottoms.length > 1) {
          const altPieces: string[] = [
            tops[tops.length - 1].id,
            bottoms[bottoms.length - 1].id,
          ];
          if (shoes.length > 1) altPieces.push(shoes[shoes.length - 1].id);

          suggestions.push({
            id: 'sugg_relaxed_alt',
            title: `${occasion} Alternate Silhouette`,
            rationale: `Relaxed contrast pairing designed to rotate underutilized pieces while maintaining sharp proportions.`,
            occasion: (occasion as OccasionTag) || 'Daily Studio',
            season: 'All Seasons',
            temperatureLabel: `${climate} Weather Selection`,
            itemIds: altPieces,
            harmonyLabel: 'Textural Contrast Silhouette',
            rotationBenefit: 'Activates least worn pieces',
          });
        }
      }

      return { suggestions };
    } catch {
      return { suggestions: [] };
    }
  },
};

// --- DEVELOPMENT-ONLY TEST LISTENER FOR CHECKPOINT C1.5 ---
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.addEventListener('outdrobe:test-profile-update', async (event: Event) => {
    const customEvent = event as CustomEvent<{
      displayName?: unknown;
      styleNote?: unknown;
    }>;

    const detail = customEvent?.detail;

    // Validate detail object
    if (!detail || typeof detail !== 'object') {
      if (typeof console !== 'undefined') {
        console.warn('[Profile Test Listener] Rejected: detail object is required.');
      }
      return;
    }

    const { displayName, styleNote } = detail;

    // Validate types
    if (displayName !== undefined && typeof displayName !== 'string') {
      if (typeof console !== 'undefined') {
        console.warn('[Profile Test Listener] Rejected: displayName must be a string if provided.');
      }
      return;
    }

    if (styleNote !== undefined && typeof styleNote !== 'string') {
      if (typeof console !== 'undefined') {
        console.warn('[Profile Test Listener] Rejected: styleNote must be a string if provided.');
      }
      return;
    }

    const trimmedName = displayName?.trim();
    const trimmedStyle = styleNote?.trim();

    if (!trimmedName && !trimmedStyle) {
      if (typeof console !== 'undefined') {
        console.warn('[Profile Test Listener] Rejected: empty update payload.');
      }
      return;
    }

    try {
      await outdrobeApi.updateProfile({
        displayName: trimmedName !== undefined ? trimmedName : undefined,
        styleNote: trimmedStyle !== undefined ? trimmedStyle : undefined,
      });

      if (typeof console !== 'undefined') {
        console.info('[Profile Test Listener] Profile update completed successfully.');
      }
    } catch (err: unknown) {
      if (typeof console !== 'undefined') {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Profile Test Listener] Profile update failed: ${message}`);
      }
    }
  });
}
