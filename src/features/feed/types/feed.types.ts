export interface Reaction {
  emoji: string;
  count: number;
  userReacted?: boolean;
}

export interface FeedItem {
  playbackEventId: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  track: {
    trackId: string;
    name: string;
    artist: string;
    albumName: string | null;
    albumImageUrl: string | null;
  };
  playedAt: string;
  reactions: Reaction[];
  notesCount: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  displayName: string;
  avatarUrl: string | null;
}
