import { supabase } from '../lib/supabaseClient';

export const STORAGE_BUCKET = 'clothing-images';
export const SIGNED_URL_EXPIRES_IN_SECONDS = 86400; // 24 hours

/**
 * Determines whether a given string is a private Supabase Storage object path
 * (e.g., `<user_id>/<file_uuid>.jpg`), rather than an inline Base64 Data URL,
 * external HTTP/HTTPS URL, or empty value.
 */
export function isStoragePath(pathOrUrl: string | null | undefined): pathOrUrl is string {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return false;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('data:')) return false;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return false;
  if (trimmed.startsWith('blob:')) return false;
  // Valid user-scoped storage path contains a folder separator: <userId>/<filename>
  return trimmed.includes('/');
}

/**
 * Helper to convert a Base64 data URL (e.g. from canvas.toDataURL) into a binary Blob
 * for efficient transmission and storage.
 */
function dataUrlToBlob(dataUrl: string): { blob: Blob; contentType: string } {
  const parts = dataUrl.split(',');
  if (parts.length < 2) {
    throw new Error('Invalid data URL format.');
  }
  const match = parts[0].match(/:(.*?);/);
  const contentType = match ? match[1] : 'image/jpeg';
  const binaryString = atob(parts[1]);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: contentType });
  return { blob, contentType };
}

/**
 * Uploads a garment image to the private `clothing-images` bucket.
 * - Extracts the authenticated user's ID directly from the active Supabase session.
 * - Never trusts a caller-supplied user ID.
 * - Stores the file inside `${user.id}/${uuid}.jpg`.
 * - Returns the relative Storage object path.
 */
export async function uploadGarmentImage(
  fileOrBlobOrDataUrl: File | Blob | string
): Promise<{ path: string }> {
  // 1. Authenticate user from active session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Authentication required to upload garment images.');
  }

  // 2. Prepare binary Blob and content-type
  let uploadBlob: Blob;
  let contentType = 'image/jpeg';

  if (typeof fileOrBlobOrDataUrl === 'string') {
    if (fileOrBlobOrDataUrl.startsWith('data:')) {
      const converted = dataUrlToBlob(fileOrBlobOrDataUrl);
      uploadBlob = converted.blob;
      contentType = converted.contentType;
    } else {
      throw new Error('String input to uploadGarmentImage must be a data URL (data:image/...).');
    }
  } else if (fileOrBlobOrDataUrl instanceof Blob) {
    uploadBlob = fileOrBlobOrDataUrl;
    contentType = fileOrBlobOrDataUrl.type || 'image/jpeg';
  } else {
    throw new Error('Unsupported image input type for uploadGarmentImage.');
  }

  // 3. Generate secure scoped path: ${user.id}/${uuid}.${extension}
  const extension = contentType.includes('png')
    ? 'png'
    : contentType.includes('webp')
    ? 'webp'
    : 'jpg';

  const fileId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

  const storagePath = `${user.id}/${fileId}.${extension}`;

  // 4. Upload to private bucket using publishable client credentials and active session JWT
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, uploadBlob, {
      contentType,
      upsert: false,
    });

  if (error || !data) {
    throw new Error(`Failed to upload garment image: ${error?.message || 'Storage upload failed'}`);
  }

  return { path: storagePath };
}

/**
 * Generates a signed URL for a single private Storage object.
 * - If the path is a legacy data URL or an external HTTP URL, returns it as-is for backward compatibility.
 * - Uses an expiry of 86400 seconds (24 hours).
 * - Handles missing paths or errors gracefully without throwing.
 */
export async function getSignedGarmentUrl(
  storagePath: string | null | undefined
): Promise<string | undefined> {
  if (!storagePath) return undefined;
  const trimmed = storagePath.trim();
  if (!trimmed) return undefined;

  // Backward compatibility: pass through legacy data URLs and external web URLs untouched
  if (!isStoragePath(trimmed)) {
    return trimmed;
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(trimmed, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error || !data?.signedUrl) {
      console.warn(`[Storage] Could not create signed URL for path "${trimmed}":`, error?.message);
      return undefined;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn(`[Storage] Exception generating signed URL for path "${trimmed}":`, err);
    return undefined;
  }
}

/**
 * Generates signed URLs in a single batch using the official Supabase SDK.
 * - Returns a Map associating each input Storage path to its corresponding signed URL.
 * - Skips null, empty, and legacy Data/HTTP URLs (mapping them directly to themselves).
 */
export async function getBatchSignedGarmentUrls(
  storagePaths: (string | null | undefined)[]
): Promise<Map<string, string>> {
  const resultMap = new Map<string, string>();
  const validStoragePaths: string[] = [];

  for (const raw of storagePaths) {
    if (!raw) continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (!isStoragePath(trimmed)) {
      // Legacy data URL or external URL maps directly to itself
      resultMap.set(trimmed, trimmed);
    } else {
      if (!validStoragePaths.includes(trimmed)) {
        validStoragePaths.push(trimmed);
      }
    }
  }

  if (validStoragePaths.length === 0) {
    return resultMap;
  }

  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrls(validStoragePaths, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error || !Array.isArray(data)) {
      console.warn('[Storage] Batch signed URL generation error:', error?.message);
      return resultMap;
    }

    for (const item of data) {
      if (item.path && item.signedUrl) {
        resultMap.set(item.path, item.signedUrl);
      }
    }
  } catch (err) {
    console.warn('[Storage] Batch signed URL exception:', err);
  }

  return resultMap;
}

/**
 * Deletes a garment image from the private `clothing-images` bucket.
 * - Strictly enforces that the target path belongs to the authenticated user's own folder.
 * - Prevents deletion of objects outside the user's folder.
 * - Safely ignores legacy data URLs and external URLs without error.
 */
export async function deleteGarmentImage(
  storagePath: string | null | undefined
): Promise<{ success: boolean }> {
  if (!storagePath) return { success: true };
  const trimmed = storagePath.trim();
  if (!trimmed) return { success: true };

  // Do not attempt to delete legacy data URLs or external URLs
  if (!isStoragePath(trimmed)) {
    return { success: true };
  }

  // 1. Authenticate user from active session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(authError?.message || 'Authentication required to delete garment images.');
  }

  // 2. Strict folder isolation security check
  const userFolderPrefix = `${user.id}/`;
  if (!trimmed.startsWith(userFolderPrefix)) {
    throw new Error('Access denied: Cannot delete storage objects outside your authenticated user folder.');
  }

  // 3. Remove file from private storage
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([trimmed]);

  if (error) {
    throw new Error(`Failed to delete garment image from storage: ${error.message}`);
  }

  return { success: true };
}
