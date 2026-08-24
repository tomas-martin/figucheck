export interface Team {
  id: string;
  name: string;
  slug: string;
  shortName: string;
  logoUrl: string;
  city?: string;
  country?: string;
  region?: string;
  isActive: boolean;
  sortOrder: number;
  stickerCount: number; // 15 or 12
  startNumber: number;  // overall sticker number where this team starts
}

export interface Sticker {
  number: number;       // 1 to 252
  teamId: string;
  teamName: string;
  teamShortName: string;
  slotNumber: number;   // 1 to 15 (or 1 to 12 for leyendas)
  playerName?: string;
  isSpecial?: boolean;
}

export type StickerStatusFilter = 'ALL' | 'HAVE' | 'MISSING' | 'REPEATED';

export interface FilterState {
  teamId: string | 'ALL';
  status: StickerStatusFilter;
  searchQuery: string;
}

export interface AlbumStats {
  total: number;         // 252
  obtained: number;      // unique stickers owned (count >= 1)
  missing: number;       // unique stickers missing (count == 0)
  repeatedTotal: number; // sum of extra copies (count > 1 ? count - 1 : 0)
  percentage: number;    // obtained / total * 100
}
