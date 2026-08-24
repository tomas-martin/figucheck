import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Remote Sync Functions
export async function syncUserStickersToSupabase(syncCode: string, userStickers: Record<number, number>) {
  if (!supabase || !syncCode) return false;

  try {
    const rowsToUpsert = Object.entries(userStickers).map(([numStr, count]) => ({
      user_sync_code: syncCode,
      sticker_number: Number(numStr),
      count: count,
      updated_at: new Date().toISOString()
    }));

    if (rowsToUpsert.length === 0) return true;

    const { error } = await supabase
      .from('user_stickers')
      .upsert(rowsToUpsert, { onConflict: 'user_sync_code,sticker_number' });

    if (error) {
      console.error('Error uploading stickers to Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase sync error:', err);
    return false;
  }
}

export async function fetchUserStickersFromSupabase(syncCode: string): Promise<Record<number, number> | null> {
  if (!supabase || !syncCode) return null;

  try {
    const { data, error } = await supabase
      .from('user_stickers')
      .select('sticker_number, count')
      .eq('user_sync_code', syncCode);

    if (error) {
      console.error('Error fetching stickers from Supabase:', error);
      return null;
    }

    if (!data) return {};

    const map: Record<number, number> = {};
    data.forEach((row) => {
      if (row.count > 0) {
        map[row.sticker_number] = row.count;
      }
    });

    return map;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}
