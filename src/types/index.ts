// ─── Vistas de la aplicación ───────────────────────────────────────────────
export type AppView = 'feed' | 'twin-match' | 'messages' | 'profile';

// ─── Entidades de dominio musical ──────────────────────────────────────────
export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  genres?: string[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  durationMs?: number;
  previewUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  coverUrl?: string;
  trackCount: number;
  ownerId: string;
}

// ─── Compatibilidad musical (TwinMatch) ────────────────────────────────────
export interface GenreScore {
  genre: string;
  scoreA: number;
  scoreB: number;
}

export interface CompatibilityBreakdown {
  label: string;
  score: number;
  color: string;
}

export interface TwinProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  compatibilityScore: number;
  sharedGenres: GenreScore[];
  breakdown: CompatibilityBreakdown[];
  sharedArtists: Artist[];
}

// ─── Mensajería ────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'song';
  track?: Track;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  isOnline: boolean;
}

// ─── Usuario ────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  spotifyId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  country?: string;
  joinedAt: Date;
  stats: {
    totalTwins: number;
    hoursListened: number;
    topGenre: string;
    songsShared: number;
  };
  settings: {
    shareListening: boolean;
    publicProfile: boolean;
    notifications: boolean;
  };
}

// ─── Feed / Actividad ───────────────────────────────────────────────────────
export interface FeedItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'listening' | 'shared' | 'matched';
  track?: Track;
  message?: string;
  reactions: { emoji: string; count: number }[];
  createdAt: Date;
}
