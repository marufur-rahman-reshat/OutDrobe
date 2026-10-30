import type {
  CalendarPlan,
  ClothingCategory,
  ClothingItem,
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

    // Outfits, calendar, wearLogs remain as empty array or fallback until their respective checkpoints
    let outfits: Outfit[] = [];
    let calendar: CalendarPlan[] = [];
    let wearLogs: WearLogEntry[] = [];

    try {
      const snap = await requestJson<WorkspaceSnapshot>('/api/workspace');
      if (Array.isArray(snap?.outfits)) outfits = snap.outfits;
      if (Array.isArray(snap?.calendar)) calendar = snap.calendar;
      if (Array.isArray(snap?.wearLogs)) wearLogs = snap.wearLogs;
      if (wardrobe.length === 0 && Array.isArray(snap?.wardrobe) && !user) {
        wardrobe = snap.wardrobe;
      }
    } catch {
      // In-memory server is offline or user is authenticated via Supabase
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

    // 2. Delete database row using authenticated user scope
    const { error: dbError } = await supabase
      .from('clothing_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (dbError) {
      throw new Error(`Failed to delete garment: ${dbError.message}`);
    }

    // 3. Only after successful database deletion, attempt to remove its Storage object
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
    return requestJson<{ outfit: Outfit }>('/api/outfits', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateOutfit(id: string, payload: Partial<Outfit>): Promise<{ outfit: Outfit }> {
    return requestJson<{ outfit: Outfit }>(`/api/outfits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteOutfit(id: string): Promise<void> {
    await requestJson(`/api/outfits/${id}`, { method: 'DELETE' });
  },

  async scheduleOutfit(payload: {
    date: string;
    outfitId: string;
    occasionNote: string;
  }): Promise<{ plan: CalendarPlan }> {
    return requestJson<{ plan: CalendarPlan }>('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async removeCalendarPlan(id: string): Promise<void> {
    await requestJson(`/api/calendar/${id}`, { method: 'DELETE' });
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
    return requestJson('/api/wear-logs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getSuggestions(occasion: string, climate: string): Promise<{ suggestions: OutfitSuggestion[] }> {
    const params = new URLSearchParams({ occasion, climate });
    return requestJson<{ suggestions: OutfitSuggestion[] }>(`/api/suggestions?${params.toString()}`);
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
