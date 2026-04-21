import { fetchWithAuth, API_BASE_URL } from './apiClient';
import { User, FeedItem, Reaction } from '../types';

export const AuthService = {
  loginWithSpotify: () => {
    // Redirect browser to backend Spotify OAuth endpoint
    if (typeof window !== 'undefined') {
      window.location.href = `${API_BASE_URL}/auth/spotify/login`;
    }
  },

  getProfile: (): Promise<User> => {
    return fetchWithAuth('/auth/me');
  },

  logout: (): Promise<void> => {
    return fetchWithAuth('/auth/logout', { method: 'POST' });
  }
};

export const FeedService = {
  getFeed: (limit: number = 20): Promise<{ items?: FeedItem[] } | FeedItem[]> => {
    return fetchWithAuth(`/feed?limit=${limit}`);
  }
};

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

export const PlayerService = {
  getNowPlaying: (): Promise<any> => {
    return fetchWithAuth('/spotify/now-playing');
  }
};
