export interface MessageObj {
  id: string;
  senderId: number;
  text: string;
  timestamp: string;
  isMine?: boolean; // mapped locally
}

export interface Conversation {
  id: string;
  friendName: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  online?: boolean;
}
