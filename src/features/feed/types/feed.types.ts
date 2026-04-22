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

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  displayName: string;
  avatarUrl: string | null;
}
