'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { TEAMS, ALL_STICKERS, TOTAL_STICKER_COUNT } from '../data/initialData';
import { Team, Sticker, FilterState, AlbumStats, StickerStatusFilter } from '../types';
import {
  isSupabaseConfigured,
  syncUserStickersToSupabase,
  fetchUserStickersFromSupabase
} from '../lib/supabase';
import confetti from 'canvas-confetti';

interface AlbumContextType {
  teams: Team[];
  stickers: Sticker[];
  userStickers: Record<number, number>;
  filters: FilterState;
  stats: AlbumStats;
  syncCode: string;
  isSyncing: boolean;
  lastSyncTime: string | null;
  setFilterTeam: (teamId: string | 'ALL') => void;
  setFilterStatus: (status: StickerStatusFilter) => void;
  setSearchQuery: (query: string) => void;
  incrementSticker: (number: number) => void;
  decrementSticker: (number: number) => void;
  setStickerCount: (number: number, count: number) => void;
  resetAllStickers: () => void;
  setSyncCode: (code: string) => void;
  syncCloud: () => Promise<boolean>;
  generateWhatsAppShareText: () => string;
  filteredStickers: Sticker[];
  getTeamStats: (teamId: string) => { total: number; obtained: number; percentage: number };
}

const LOCAL_STORAGE_KEY = 'figucheck_user_stickers_v1';
const LOCAL_STORAGE_SYNC_CODE = 'figucheck_sync_code_v1';

const AlbumContext = createContext<AlbumContextType | undefined>(undefined);

function generateRandomSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'FIGU-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const AlbumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStickers, setUserStickers] = useState<Record<number, number>>({});
  const [syncCode, setSyncCodeState] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterState>({
    teamId: 'ALL',
    status: 'ALL',
    searchQuery: ''
  });

  // Load initial data from localStorage
  useEffect(() => {
    try {
      const savedStickers = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStickers) {
        setUserStickers(JSON.parse(savedStickers));
      }

      let savedCode = localStorage.getItem(LOCAL_STORAGE_SYNC_CODE);
      if (!savedCode) {
        savedCode = generateRandomSyncCode();
        localStorage.setItem(LOCAL_STORAGE_SYNC_CODE, savedCode);
      }
      setSyncCodeState(savedCode);
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userStickers));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, [userStickers, isInitialized]);

  // Sync state with cloud
  const syncCloud = useCallback(async () => {
    if (!syncCode || isSyncing) return false;
    setIsSyncing(true);
    try {
      // 1. Fetch remote stickers
      const remoteData = await fetchUserStickersFromSupabase(syncCode);
      
      let merged = { ...userStickers };
      if (remoteData) {
        // Merge strategy: take highest count
        Object.entries(remoteData).forEach(([numStr, count]) => {
          const n = Number(numStr);
          merged[n] = Math.max(merged[n] || 0, count);
        });
      }

      // 2. Upload merged back to remote
      const success = await syncUserStickersToSupabase(syncCode, merged);
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
  }, [syncCode, isSyncing, userStickers]);

  const setSyncCode = (code: string) => {
    const formatted = code.trim().toUpperCase();
    setSyncCodeState(formatted);
    localStorage.setItem(LOCAL_STORAGE_SYNC_CODE, formatted);
  };

  // Sticker modifiers
  const setStickerCount = useCallback((number: number, count: number) => {
    const validCount = Math.max(0, count);
    setUserStickers((prev) => {
      const next = { ...prev };
      if (validCount === 0) {
        delete next[number];
      } else {
        next[number] = validCount;
      }
      return next;
    });
  }, []);

  const incrementSticker = useCallback((number: number) => {
    setUserStickers((prev) => {
      const current = prev[number] || 0;
      const nextCount = current + 1;
      
      // Trigger celebration if reaching 100%
      const newObtainedCount = Object.keys({ ...prev, [number]: nextCount }).length;
      if (newObtainedCount === TOTAL_STICKER_COUNT) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      return {
        ...prev,
        [number]: nextCount
      };
    });
  }, []);

  const decrementSticker = useCallback((number: number) => {
    setUserStickers((prev) => {
      const current = prev[number] || 0;
      if (current <= 0) return prev;
      const next = { ...prev };
      if (current === 1) {
        delete next[number];
      } else {
        next[number] = current - 1;
      }
      return next;
    });
  }, []);

  const resetAllStickers = useCallback(() => {
    setUserStickers({});
  }, []);

  // Filters
  const setFilterTeam = (teamId: string | 'ALL') => {
    setFilters((prev) => ({ ...prev, teamId }));
  };

  const setFilterStatus = (status: StickerStatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const setSearchQuery = (searchQuery: string) => {
    setFilters((prev) => ({ ...prev, searchQuery }));
  };

  // Stats calculation
  const stats: AlbumStats = useMemo(() => {
    let obtained = 0;
    let repeatedTotal = 0;

    Object.values(userStickers).forEach((count) => {
      if (count >= 1) {
        obtained++;
      }
      if (count > 1) {
        repeatedTotal += (count - 1);
      }
    });

    const missing = TOTAL_STICKER_COUNT - obtained;
    const percentage = Math.round((obtained / TOTAL_STICKER_COUNT) * 1000) / 10; // e.g. 74.2

    return {
      total: TOTAL_STICKER_COUNT,
      obtained,
      missing,
      repeatedTotal,
      percentage
    };
  }, [userStickers]);

  // Team stats helper
  const getTeamStats = useCallback((teamId: string) => {
    const teamStickers = ALL_STICKERS.filter((s) => s.teamId === teamId);
    const total = teamStickers.length;
    const obtained = teamStickers.filter((s) => (userStickers[s.number] || 0) >= 1).length;
    const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
    return { total, obtained, percentage };
  }, [userStickers]);

  // Filtered sticker list
  const filteredStickers = useMemo(() => {
    return ALL_STICKERS.filter((sticker) => {
      // 1. Team Filter
      if (filters.teamId !== 'ALL' && sticker.teamId !== filters.teamId) {
        return false;
      }

      // 2. Status Filter
      const count = userStickers[sticker.number] || 0;
      if (filters.status === 'HAVE' && count === 0) return false;
      if (filters.status === 'MISSING' && count > 0) return false;
      if (filters.status === 'REPEATED' && count <= 1) return false;

      // 3. Search Query Filter (Search by sticker number, team name, team short name)
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const numMatch = sticker.number.toString() === q || `#${sticker.number}` === q;
        const slotMatch = `${sticker.teamShortName.toLowerCase()} ${sticker.slotNumber}`.includes(q);
        const teamMatch = sticker.teamName.toLowerCase().includes(q) || sticker.teamShortName.toLowerCase().includes(q);
        return numMatch || slotMatch || teamMatch;
      }

      return true;
    });
  }, [filters, userStickers]);

  // WhatsApp share message generator
  const generateWhatsAppShareText = useCallback(() => {
    const missingList: string[] = [];
    const repeatedList: string[] = [];

    ALL_STICKERS.forEach((sticker) => {
      const count = userStickers[sticker.number] || 0;
      const stickerLabel = `${sticker.teamShortName} #${sticker.slotNumber} (N°${sticker.number})`;

      if (count === 0) {
        missingList.push(stickerLabel);
      } else if (count > 1) {
        repeatedList.push(`${stickerLabel} [x${count - 1}]`);
      }
    });

    let text = `⚽ *FIGUCHECK - ÁLBUM FUTSAL MENDOZA* ⚽\n`;
    text += `📊 Progreso: ${stats.obtained}/${stats.total} (${stats.percentage}%)\n\n`;

    text += `🔁 *MIS REPETIDAS (${repeatedList.length} distintas, ${stats.repeatedTotal} extras):*\n`;
    if (repeatedList.length > 0) {
      text += repeatedList.join(', ') + '\n\n';
    } else {
      text += 'Ninguna por el momento.\n\n';
    }

    text += `❌ *ME FALTAN (${missingList.length}):*\n`;
    if (missingList.length > 0) {
      text += missingList.join(', ') + '\n';
    } else {
      text += '¡Álbum Completo! 🎉\n';
    }

    return text;
  }, [userStickers, stats]);

  return (
    <AlbumContext.Provider
      value={{
        teams: TEAMS,
        stickers: ALL_STICKERS,
        userStickers,
        filters,
        stats,
        syncCode,
        isSyncing,
        lastSyncTime,
        setFilterTeam,
        setFilterStatus,
        setSearchQuery,
        incrementSticker,
        decrementSticker,
        setStickerCount,
        resetAllStickers,
        setSyncCode,
        syncCloud,
        generateWhatsAppShareText,
        filteredStickers,
        getTeamStats
      }}
    >
      {children}
    </AlbumContext.Provider>
  );
};

export const useAlbum = () => {
  const context = useContext(AlbumContext);
  if (!context) {
    throw new Error('useAlbum must be used within an AlbumProvider');
  }
  return context;
};
