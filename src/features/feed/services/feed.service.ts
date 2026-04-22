import { fetchWithAuth } from '@/core/api/apiClient';
import { FeedItem, Reaction, Note } from '@/features/feed/types/feed.types';

// ─── Feed ──────────────────────────────────────────────────────────────────
export const FeedService = {
  getFeed: (limit: number = 20): Promise<{ items?: FeedItem[] } | FeedItem[]> => {
    return fetchWithAuth(`/feed?limit=${limit}`);
  },
  getSummary: (): Promise<any[]> => {
    return fetchWithAuth('/feed/summary');
  }
};

// ─── Reactions ─────────────────────────────────────────────────────────────
export const InteractionService = {
  reactToEvent: (playbackEventId: number, emoji: string): Promise<any> => {
    return fetchWithAuth('/reactions', {
      method: 'POST',
      body: JSON.stringify({ playbackEventId, emoji })
    });
  },

  getReactions: (playbackEventId: number): Promise<Reaction[]> => {
    return fetchWithAuth(`/reactions/${playbackEventId}`);
  }
};

// ─── Player / Spotify ──────────────────────────────────────────────────────
export const PlayerService = {
  getNowPlaying: (): Promise<any> => {
    return fetchWithAuth('/spotify/now-playing');
  },
  getRecentTracks: (limit: number = 20): Promise<any> => {
    return fetchWithAuth(`/spotify/recent?limit=${limit}`);
  }
};

// ─── Notes (musical notes on playback events) ──────────────────────────────
export const NotesService = {
  /**
   * Crea una nota musical asociada a un evento de reproducción.
   * POST /notes  → { playbackEventId, content }
   */
  createNote: (playbackEventId: string, content: string): Promise<Note> => {
    return fetchWithAuth('/notes', {
      method: 'POST',
      body: JSON.stringify({ playbackEventId, content })
    });
  },

  /**
   * Obtiene todas las notas de un evento de reproducción específico.
   * GET /notes/:playbackEventId
   */
  getNotesByEvent: (playbackEventId: string): Promise<Note[]> => {
    return fetchWithAuth(`/notes/${playbackEventId}`);
  }
};
