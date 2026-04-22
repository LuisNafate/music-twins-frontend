import { fetchWithAuth } from '@/core/api/apiClient';

export interface Friend {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  spotifyId?: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

// ─── Friends / Twin Match ───────────────────────────────────────────────────
export const TwinMatchService = {
  /**
   * Lista todos los amigos actuales del usuario.
   * GET /friends
   */
  getFriends: (): Promise<Friend[]> => {
    return fetchWithAuth('/friends');
  },

  /**
   * Lista las solicitudes de amistad pendientes (recibidas y enviadas).
   * GET /friends/requests
   */
  getPendingRequests: (): Promise<FriendRequest[]> => {
    return fetchWithAuth('/friends/requests');
  },

  /**
   * Envía una solicitud de amistad a un usuario.
   * POST /friends/requests  → { targetUserId }
   */
  sendFriendRequest: (targetUserId: string): Promise<FriendRequest> => {
    return fetchWithAuth('/friends/requests', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  },

  /**
   * Acepta o rechaza una solicitud de amistad.
   * PATCH /friends/requests/:id  → { action: 'ACCEPT' | 'REJECT' }
   */
  respondToRequest: (requestId: string, action: 'ACCEPT' | 'REJECT'): Promise<FriendRequest> => {
    return fetchWithAuth(`/friends/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action })
    });
  },

  /**
   * Busca usuarios por nombre (display_name ILIKE).
   * GET /users/search?q=nombre&limit=10
   */
  searchUsers: (query: string, limit: number = 10): Promise<any[]> => {
    return fetchWithAuth(`/users/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }
};
