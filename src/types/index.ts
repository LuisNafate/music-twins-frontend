export interface User {
  id: number;
  email?: string;
  username: string;
  spotifyId?: string;
  avatar?: string;
}

export interface AuthSession {
  user: User;
  token?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted?: boolean;
}

export interface FeedItem {
  id: number;
  friend: string;
  title: string;
  artistAlbum: string;
  mood: string;
  timeAgo: string;
  reactions: Reaction[];
}
