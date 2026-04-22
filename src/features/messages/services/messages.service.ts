import { fetchWithAuth } from '@/core/api/apiClient';
import { Conversation, MessageObj } from '@/features/messages/types/messages.types';

// ─── Conversations ─────────────────────────────────────────────────────────
export const ConversationService = {
  /**
   * Lista todas las conversaciones del usuario autenticado.
   * GET /conversations
   */
  getConversations: (): Promise<Conversation[]> => {
    return fetchWithAuth('/conversations');
  },

  /**
   * Crea una nueva conversación con un amigo (por su userId).
   * POST /conversations  → { targetUserId }
   * Usado desde TwinMatch o Profile al presionar "Enviar mensaje".
   */
  createConversation: (targetUserId: string): Promise<Conversation> => {
    return fetchWithAuth('/conversations', {
      method: 'POST',
      body: JSON.stringify({ targetUserId })
    });
  }
};

// ─── Messages ─────────────────────────────────────────────────────────────
export const MessageService = {
  /**
   * Obtiene los mensajes de una conversación específica.
   * GET /conversations/:conversationId/messages
   */
  getMessages: (conversationId: string): Promise<MessageObj[]> => {
    return fetchWithAuth(`/conversations/${conversationId}/messages`);
  },

  /**
   * Marca mensajes como leídos.
   * POST /messages/read  → { conversationId }
   */
  markAsRead: (conversationId: string): Promise<any> => {
    return fetchWithAuth('/messages/read', {
      method: 'POST',
      body: JSON.stringify({ conversationId })
    });
  }
};
