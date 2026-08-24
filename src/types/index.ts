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
  stickerCount: number;
  startNumber: number;
}

export interface Sticker {
  number: number;
  teamId: string;
  teamName: string;
  teamShortName: string;
  slotNumber: number;
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
  total: number;
  obtained: number;
  missing: number;
  repeatedTotal: number;
  percentage: number;
}

export interface UserProfile {
  id: string;           // Supabase Auth UUID
  username: string;
  phoneWhatsapp?: string;
}

export interface TradeMatch {
  userId: string;
  username: string;
  phoneWhatsapp?: string;
  stickersTheyHaveThatINeed: number[];
  stickersIHaveThatTheyNeed: number[];
  matchScore: number;
}
