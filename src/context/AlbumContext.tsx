'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { TEAMS, ALL_STICKERS, TOTAL_STICKER_COUNT } from '../data/initialData';
import { Team, Sticker, FilterState, AlbumStats, StickerStatusFilter, UserProfile, TradeMatch } from '../types';
import {
  isSupabaseConfigured,
  supabase,
  getCurrentUser,
  signUp as authSignUp,
  signIn as authSignIn,
  signOut as authSignOut,
  updateUserProfile,
  syncUserStickersToSupabase,
  fetchUserStickersFromSupabase,
  fetchTradeMatches
} from '../lib/supabase';
import confetti from 'canvas-confetti';

interface AlbumContextType {
  // Data
  teams: Team[];
  stickers: Sticker[];
  userStickers: Record<number, number>;
  filters: FilterState;
  stats: AlbumStats;
  filteredStickers: Sticker[];

  // Auth
  user: UserProfile | null;
  isAuthLoading: boolean;
  authError: string | null;
  signUp: (username: string, password: string, phoneWhatsapp?: string) => Promise<boolean>;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updatePhone: (phone: string) => Promise<boolean>;

  // Sync
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncCloud: () => Promise<boolean>;

  // Filters
  setFilterTeam: (teamId: string | 'ALL') => void;
  setFilterStatus: (status: StickerStatusFilter) => void;
  setSearchQuery: (query: string) => void;

  // Sticker actions
  incrementSticker: (number: number) => void;
  decrementSticker: (number: number) => void;
  setStickerCount: (number: number, count: number) => void;
  resetAllStickers: () => void;

  // Trade
  getTradeMatches: () => Promise<TradeMatch[]>;
  generateWhatsAppShareText: () => string;
  generateTradeProposalWhatsAppText: (match: TradeMatch) => string;

  // Stats
  getTeamStats: (teamId: string) => { total: number; obtained: number; percentage: number };
}

const LOCAL_STORAGE_KEY = 'figucheck_user_stickers_v1';

const AlbumContext = createContext<AlbumContextType | undefined>(undefined);

export const AlbumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStickers, setUserStickers] = useState<Record<number, number>>({});
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    teamId: 'ALL',
    status: 'ALL',
    searchQuery: ''
  });

  // ─── INIT: Load localStorage + Check Supabase Auth Session ───
  useEffect(() => {
    const init = async () => {
      // Load local stickers
      try {
        const savedStickers = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedStickers) {
          setUserStickers(JSON.parse(savedStickers));
        }
      } catch (e) {
        console.error('Error loading localStorage:', e);
      }

      // Check existing session
      if (isSupabaseConfigured) {
        const profile = await getCurrentUser();
        if (profile) {
          setUser(profile);
          // Fetch remote stickers and merge
          const remote = await fetchUserStickersFromSupabase(profile.id);
          if (remote) {
            setUserStickers((prev) => {
              const merged = { ...prev };
              Object.entries(remote).forEach(([numStr, count]) => {
                const n = Number(numStr);
                merged[n] = Math.max(merged[n] || 0, count);
              });
              return merged;
            });
          }
        }
      }

      setIsAuthLoading(false);
      setIsInitialized(true);
    };

    init();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await getCurrentUser();
          setUser(profile);
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userStickers));
    } catch (e) {
      console.error('Error saving localStorage:', e);
    }
  }, [userStickers, isInitialized]);

  // ─── AUTH ────────────────────────────────────────────────────

  const signUp = async (username: string, password: string, phoneWhatsapp?: string): Promise<boolean> => {
    setAuthError(null);
    const result = await authSignUp(username, password, phoneWhatsapp);
    if (!result.success) {
      setAuthError(result.error || 'Error al registrarse.');
      return false;
    }
    // After signup, fetch user
    const profile = await getCurrentUser();
    if (profile) {
      setUser(profile);
      // Sync existing local stickers to new account
      await syncUserStickersToSupabase(profile.id, userStickers);
    }
    return true;
  };

  const signIn = async (username: string, password: string): Promise<boolean> => {
    setAuthError(null);
    const result = await authSignIn(username, password);
    if (!result.success) {
      setAuthError(result.error || 'Error al iniciar sesión.');
      return false;
    }
    const profile = await getCurrentUser();
    if (profile) {
      setUser(profile);
      // Merge remote stickers with local
      const remote = await fetchUserStickersFromSupabase(profile.id);
      if (remote) {
        setUserStickers((prev) => {
          const merged = { ...prev };
          Object.entries(remote).forEach(([numStr, count]) => {
            const n = Number(numStr);
            merged[n] = Math.max(merged[n] || 0, count);
          });
          return merged;
        });
      }
    }
    return true;
  };

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
    setAuthError(null);
  };

  const updatePhone = async (phone: string): Promise<boolean> => {
    if (!user) return false;
    const success = await updateUserProfile(user.id, phone);
    if (success) {
      setUser({ ...user, phoneWhatsapp: phone || undefined });
    }
    return success;
  };

  // ─── CLOUD SYNC ──────────────────────────────────────────────

  const syncCloud = useCallback(async () => {
    if (!user || isSyncing) return false;
    setIsSyncing(true);
    try {
      const remote = await fetchUserStickersFromSupabase(user.id);
      let merged = { ...userStickers };
      if (remote) {
        Object.entries(remote).forEach(([numStr, count]) => {
          const n = Number(numStr);
          merged[n] = Math.max(merged[n] || 0, count);
        });
      }

      const success = await syncUserStickersToSupabase(user.id, merged);
      if (success) {
        setUserStickers(merged);
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      return success;
    } catch (err) {
      console.error('Cloud sync failed:', err);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing, userStickers]);

  // ─── STICKER MODIFIERS ──────────────────────────────────────

  const setStickerCount = useCallback((number: number, count: number) => {
    const validCount = Math.max(0, count);
    setUserStickers((prev) => {
      const next = { ...prev };
      if (validCount === 0) delete next[number];
      else next[number] = validCount;
      return next;
    });
  }, []);

  const incrementSticker = useCallback((number: number) => {
    setUserStickers((prev) => {
      const current = prev[number] || 0;
      const nextCount = current + 1;
      const newState = { ...prev, [number]: nextCount };

      if (Object.keys(newState).length === TOTAL_STICKER_COUNT && current === 0) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }

      return newState;
    });
  }, []);

  const decrementSticker = useCallback((number: number) => {
    setUserStickers((prev) => {
      const current = prev[number] || 0;
      if (current <= 0) return prev;
      const next = { ...prev };
      if (current === 1) delete next[number];
      else next[number] = current - 1;
      return next;
    });
  }, []);

  const resetAllStickers = useCallback(() => {
    setUserStickers({});
  }, []);

  // ─── FILTERS ─────────────────────────────────────────────────

  const setFilterTeam = (teamId: string | 'ALL') => setFilters((p) => ({ ...p, teamId }));
  const setFilterStatus = (status: StickerStatusFilter) => setFilters((p) => ({ ...p, status }));
  const setSearchQuery = (searchQuery: string) => setFilters((p) => ({ ...p, searchQuery }));

  // ─── STATS ───────────────────────────────────────────────────

  const stats: AlbumStats = useMemo(() => {
    let obtained = 0;
    let repeatedTotal = 0;
    Object.values(userStickers).forEach((count) => {
      if (count >= 1) obtained++;
      if (count > 1) repeatedTotal += (count - 1);
    });
    const missing = TOTAL_STICKER_COUNT - obtained;
    const percentage = Math.round((obtained / TOTAL_STICKER_COUNT) * 1000) / 10;
    return { total: TOTAL_STICKER_COUNT, obtained, missing, repeatedTotal, percentage };
  }, [userStickers]);

  const getTeamStats = useCallback((teamId: string) => {
    const teamStickers = ALL_STICKERS.filter((s) => s.teamId === teamId);
    const total = teamStickers.length;
    const obtained = teamStickers.filter((s) => (userStickers[s.number] || 0) >= 1).length;
    const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
    return { total, obtained, percentage };
  }, [userStickers]);

  // ─── FILTERED LIST ───────────────────────────────────────────

  const filteredStickers = useMemo(() => {
    return ALL_STICKERS.filter((sticker) => {
      if (filters.teamId !== 'ALL' && sticker.teamId !== filters.teamId) return false;

      const count = userStickers[sticker.number] || 0;
      if (filters.status === 'HAVE' && count === 0) return false;
      if (filters.status === 'MISSING' && count > 0) return false;
      if (filters.status === 'REPEATED' && count <= 1) return false;

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const numMatch = sticker.number.toString() === q || `#${sticker.number}` === q;
        const slotMatch = `${sticker.teamShortName.toLowerCase()} ${sticker.slotNumber}`.includes(q);
        const teamMatch = sticker.teamName.toLowerCase().includes(q) || sticker.teamShortName.toLowerCase().includes(q);
        return numMatch || slotMatch || teamMatch;
      }

      return true;
    });
  }, [filters, userStickers]);

  // ─── TRADE MATCHMAKING ──────────────────────────────────────

  const getTradeMatches = useCallback(async (): Promise<TradeMatch[]> => {
    if (!user) return [];
    return await fetchTradeMatches(user.id, userStickers);
  }, [user, userStickers]);

  // ─── SHARE TEXT ──────────────────────────────────────────────

  const generateWhatsAppShareText = useCallback(() => {
    const missingList: string[] = [];
    const repeatedList: string[] = [];

    ALL_STICKERS.forEach((sticker) => {
      const count = userStickers[sticker.number] || 0;
      const label = `${sticker.teamShortName} #${sticker.slotNumber} (N°${sticker.number})`;
      if (count === 0) missingList.push(label);
      else if (count > 1) repeatedList.push(`${label} [x${count - 1}]`);
    });

    let text = `⚽ *FIGUCHECK - ÁLBUM FUTSAL MENDOZA* ⚽\n`;
    if (user?.username) text += `👤 ${user.username}\n`;
    text += `📊 Progreso: ${stats.obtained}/${stats.total} (${stats.percentage}%)\n\n`;
    text += `🔁 *MIS REPETIDAS (${repeatedList.length}):*\n`;
    text += repeatedList.length > 0 ? repeatedList.join(', ') + '\n\n' : 'Ninguna.\n\n';
    text += `❌ *ME FALTAN (${missingList.length}):*\n`;
    text += missingList.length > 0 ? missingList.join(', ') + '\n' : '¡Álbum Completo! 🎉\n';
    return text;
  }, [userStickers, stats, user]);

  const generateTradeProposalWhatsAppText = useCallback((match: TradeMatch) => {
    const fmt = (num: number) => {
      const s = ALL_STICKERS.find((item) => item.number === num);
      return s ? `${s.teamShortName} #${s.slotNumber} (N°${num})` : `N°${num}`;
    };

    let text = `🤝 *PROPUESTA DE CANJE - FIGUCHECK* 🤝\n\n`;
    text += `Hola *${match.username}*! Vi en FiguCheck que podemos cambiar figuritas:\n\n`;
    if (match.stickersTheyHaveThatINeed.length > 0) {
      text += `📌 *Tenés y a mí me faltan (${match.stickersTheyHaveThatINeed.length}):*\n`;
      text += match.stickersTheyHaveThatINeed.map(fmt).join(', ') + '\n\n';
    }
    if (match.stickersIHaveThatTheyNeed.length > 0) {
      text += `🔁 *Tengo repetidas que a vos te faltan (${match.stickersIHaveThatTheyNeed.length}):*\n`;
      text += match.stickersIHaveThatTheyNeed.map(fmt).join(', ') + '\n\n';
    }
    text += `¿Coordinamos para cambiar? ¡Saludos!`;
    return text;
  }, []);

  return (
    <AlbumContext.Provider
      value={{
        teams: TEAMS,
        stickers: ALL_STICKERS,
        userStickers,
        filters,
        stats,
        filteredStickers,
        user,
        isAuthLoading,
        authError,
        signUp,
        signIn,
        signOut: handleSignOut,
        updatePhone,
        isSyncing,
        lastSyncTime,
        syncCloud,
        setFilterTeam,
        setFilterStatus,
        setSearchQuery,
        incrementSticker,
        decrementSticker,
        setStickerCount,
        resetAllStickers,
        getTradeMatches,
        generateWhatsAppShareText,
        generateTradeProposalWhatsAppText,
        getTeamStats
      }}
    >
      {children}
    </AlbumContext.Provider>
  );
};

export const useAlbum = () => {
  const context = useContext(AlbumContext);
  if (!context) throw new Error('useAlbum must be used within AlbumProvider');
  return context;
};
