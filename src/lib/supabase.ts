import { createClient } from '@supabase/supabase-js';
import { UserProfile, TradeMatch } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isPlaceholder = supabaseUrl.includes('tu-proyecto') || supabaseAnonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !isPlaceholder);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── AUTH FUNCTIONS ─────────────────────────────────────────────

export async function signUp(username: string, password: string, phoneWhatsapp?: string): Promise<{ success: boolean; error?: string; userId?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Configurá la URL y Key reales de tu proyecto de Supabase en .env.local'
    };
  }

  // We use a fake email derived from the username for Supabase Auth
  const email = `${username.toLowerCase().replace(/[^a-z0-9_]/g, '')}@figucheck.app`;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          phone_whatsapp: phoneWhatsapp || null
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return { success: false, error: 'Ese nombre de usuario ya está registrado.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, userId: data.user?.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión con Supabase (verificá tu URL en .env.local).' };
  }
}

export async function signIn(username: string, password: string): Promise<{ success: boolean; error?: string; userId?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Configurá la URL y Key reales de tu proyecto de Supabase en .env.local'
    };
  }

  const email = `${username.toLowerCase().replace(/[^a-z0-9_]/g, '')}@figucheck.app`;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login')) {
        return { success: false, error: 'Usuario o contraseña incorrectos.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true, userId: data.user?.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de conexión con Supabase (verificá tu URL en .env.local).' };
  }
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!supabase) return null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, phone_whatsapp')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      username: profile?.username || user.user_metadata?.username || 'Coleccionista',
      phoneWhatsapp: profile?.phone_whatsapp || undefined
    };
  } catch (err) {
    return null;
  }
}

// ─── PROFILE UPDATE ─────────────────────────────────────────────

export async function updateUserProfile(userId: string, phoneWhatsapp?: string): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('profiles')
    .update({
      phone_whatsapp: phoneWhatsapp || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  return !error;
}

// ─── STICKER SYNC FUNCTIONS ────────────────────────────────────

export async function syncUserStickersToSupabase(userId: string, userStickers: Record<number, number>): Promise<boolean> {
  if (!supabase || !userId) return false;

  try {
    const rowsToUpsert = Object.entries(userStickers).map(([numStr, count]) => ({
      user_id: userId,
      sticker_number: Number(numStr),
      count: count,
      updated_at: new Date().toISOString()
    }));

    if (rowsToUpsert.length === 0) return true;

    const { error } = await supabase
      .from('user_stickers')
      .upsert(rowsToUpsert, { onConflict: 'user_id,sticker_number' });

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

export async function fetchUserStickersFromSupabase(userId: string): Promise<Record<number, number> | null> {
  if (!supabase || !userId) return null;

  try {
    const { data, error } = await supabase
      .from('user_stickers')
      .select('sticker_number, count')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching stickers:', error);
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

// ─── TRADE MATCHMAKING ENGINE ──────────────────────────────────

export async function fetchTradeMatches(
  myUserId: string,
  myUserStickers: Record<number, number>
): Promise<TradeMatch[]> {
  if (!supabase) return [];

  try {
    const myMissingSet = new Set<number>();
    const myRepeatedSet = new Set<number>();

    for (let i = 1; i <= 252; i++) {
      const count = myUserStickers[i] || 0;
      if (count === 0) myMissingSet.add(i);
      else if (count > 1) myRepeatedSet.add(i);
    }

    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, username, phone_whatsapp')
      .neq('id', myUserId);

    if (pError || !profiles || profiles.length === 0) return [];

    const { data: allStickersData, error: sError } = await supabase
      .from('user_stickers')
      .select('user_id, sticker_number, count')
      .neq('user_id', myUserId);

    if (sError || !allStickersData) return [];

    const otherUsersMap: Record<string, Record<number, number>> = {};
    allStickersData.forEach((row) => {
      if (!otherUsersMap[row.user_id]) otherUsersMap[row.user_id] = {};
      otherUsersMap[row.user_id][row.sticker_number] = row.count;
    });

    const matches: TradeMatch[] = [];

    profiles.forEach((p) => {
      const uStickers = otherUsersMap[p.id] || {};

      const stickersTheyHaveThatINeed: number[] = [];
      const stickersIHaveThatTheyNeed: number[] = [];

      Object.entries(uStickers).forEach(([numStr, count]) => {
        const num = Number(numStr);
        if (count >= 1 && myMissingSet.has(num)) {
          stickersTheyHaveThatINeed.push(num);
        }
      });

      myRepeatedSet.forEach((num) => {
        const theirCount = uStickers[num] || 0;
        if (theirCount === 0) {
          stickersIHaveThatTheyNeed.push(num);
        }
      });

      const matchScore = stickersTheyHaveThatINeed.length + stickersIHaveThatTheyNeed.length;

      if (matchScore > 0) {
        matches.push({
          userId: p.id,
          username: p.username || 'Coleccionista',
          phoneWhatsapp: p.phone_whatsapp || undefined,
          stickersTheyHaveThatINeed,
          stickersIHaveThatTheyNeed,
          matchScore
        });
      }
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  } catch (err) {
    console.error('Error calculating trade matches:', err);
    return [];
  }
}
