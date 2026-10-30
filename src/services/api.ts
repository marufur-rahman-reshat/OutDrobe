import type {
  CalendarPlan,
  ClothingItem,
  Outfit,
  OutfitSuggestion,
  UserProfile,
  WearLogEntry,
} from '../types/outdrobe';
import { supabase } from '../lib/supabaseClient';

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

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } finally {
      setSavedToken(null);
    }
  },

  async getWorkspace(): Promise<WorkspaceSnapshot> {
    try {
      const snap = await requestJson<WorkspaceSnapshot>('/api/workspace');
      return {
        wardrobe: Array.isArray(snap?.wardrobe) ? snap.wardrobe : [],
        outfits: Array.isArray(snap?.outfits) ? snap.outfits : [],
        calendar: Array.isArray(snap?.calendar) ? snap.calendar : [],
        wearLogs: Array.isArray(snap?.wearLogs) ? snap.wearLogs : [],
      };
    } catch (err) {
      console.warn('[Workspace] Falling back to clean archive state:', err);
      return {
        wardrobe: [],
        outfits: [],
        calendar: [],
        wearLogs: [],
      };
    }
  },

  async createGarment(payload: Partial<ClothingItem>): Promise<{ item: ClothingItem }> {
    return requestJson<{ item: ClothingItem }>('/api/wardrobe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateGarment(id: string, payload: Partial<ClothingItem>): Promise<{ item: ClothingItem }> {
    return requestJson<{ item: ClothingItem }>(`/api/wardrobe/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async deleteGarment(id: string): Promise<void> {
    await requestJson(`/api/wardrobe/${id}`, { method: 'DELETE' });
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
