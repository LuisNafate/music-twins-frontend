import { fetchWithAuth } from '@/core/api/apiClient';
import { User } from '@/features/auth/types/auth.types';

// ─── User Profile ──────────────────────────────────────────────────────────
export const ProfileService = {
  /**
   * Obtiene el perfil del usuario autenticado.
   * GET /auth/me
   */
  getProfile: (): Promise<User> => {
    return fetchWithAuth('/auth/me');
  }
};

// ─── Spotify Player (consumido desde el perfil) ────────────────────────────
export const SpotifyProfileService = {
  /**
   * Obtiene las pistas recientes del usuario.
   * GET /spotify/recent?limit=N
   */
  getRecentTracks: (limit: number = 20): Promise<any> => {
    return fetchWithAuth(`/spotify/recent?limit=${limit}`);
  },

  /**
   * Obtiene la pista en reproducción actual.
   * GET /spotify/now-playing
   */
  getNowPlaying: (): Promise<any> => {
    return fetchWithAuth('/spotify/now-playing');
  },

  /**
   * Obtiene las pistas top del usuario.
   * GET /spotify/top-tracks?limit=N
   */
  getTopTracks: (limit: number = 20): Promise<any> => {
    return fetchWithAuth(`/spotify/top-tracks?limit=${limit}`);
  }
};
