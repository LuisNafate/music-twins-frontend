"use client"

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  UilFavorite,
  UilHeartRate,
  UilShareAlt,
  UilMessage,
  UilMusic,
  UilPlay,
  UilUsersAlt,
} from '@iconscout/react-unicons'
import AppShell from '@/core/components/AppShell'
import { FeedService, InteractionService, PlayerService } from '@/features/feed/services/feed.service'
import { socketService } from '@/core/realtime/socket'
import { FeedItem } from '@/features/feed/types/feed.types'

function AvatarPill({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    return <img src={url} alt={name} className="h-10 w-10 border border-[var(--app-border)] object-cover" />
  }

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span className="inline-flex h-10 w-10 items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface-2)] font-display text-sm font-bold text-[var(--app-text)]">
      {initials}
    </span>
  )
}

function getTimeAgo(date: string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
}

function SongCardItem({ card, delay = 0 }: { card: FeedItem; delay?: number }) {
  const [reactions, setReactions] = useState(card.reactions || [])
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  const handleReact = async (emoji: string) => {
    const alreadyLiked = liked[emoji]
    
    // Optimistic UI update
    setLiked(prev => ({ ...prev, [emoji]: !alreadyLiked }))
    setReactions(prev => {
      const existing = prev.find(r => r.emoji === emoji)
      if (existing) {
        return prev.map(item =>
          item.emoji === emoji ? { ...item, count: alreadyLiked ? item.count - 1 : item.count + 1 } : item
        )
      } else {
        return [...prev, { emoji, count: 1 }]
      }
    })

    try {
      if (!alreadyLiked) {
        await InteractionService.reactToEvent(card.playbackEventId as any, emoji)
      }
    } catch (error) {
      console.error('Failed to react', error)
    }
  }

  const title = card.track?.name || 'Unknown Title'
  const timeAgo = getTimeAgo(card.playedAt)
  const artist = card.track?.artist || 'Unknown Artist'
  const album = card.track?.albumName || 'Unknown Album'

  return (
    <article
      className="animate-fade-in-up border border-[var(--app-border)] bg-[var(--app-surface)] p-5"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-3">
        <AvatarPill name={card.user.displayName} url={card.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-[clamp(1.2rem,1.1rem+0.5vw,1.6rem)] font-bold uppercase text-[var(--app-text)]">{title}</h3>
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--app-muted)]">{timeAgo}</span>
          </div>
          <p className="text-sm text-[var(--app-muted)]">{artist} · {album}</p>
          {card.track.albumImageUrl && (
            <div className="mt-3 overflow-hidden border border-[var(--app-border)]">
               <img src={card.track.albumImageUrl} alt={album} className="w-full object-cover max-h-48" />
            </div>
          )}
          <div className="mt-2 inline-flex items-center gap-1 border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.12)] px-2 py-1 text-xs text-[var(--accent-primary)]">
            <UilHeartRate size={13} />
            Listening now
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--app-border)] pt-4">
        {reactions.map(item => (
          <button
            key={item.emoji}
            onClick={() => handleReact(item.emoji)}
            className={`inline-flex items-center gap-1 border px-3 py-1.5 text-xs transition-transform active:scale-95 ${
              liked[item.emoji]
                ? 'border-[var(--accent-primary)] bg-[rgba(224,108,26,0.18)] text-[var(--app-text)]'
                : 'border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-muted)] hover:bg-[var(--app-surface-2)]'
            }`}
          >
            <span>{item.emoji}</span>
            <span>{item.count}</span>
          </button>
        ))}

        {/* Example to add new reaction */}
        <button 
          onClick={() => handleReact('🔥')}
          className="inline-flex items-center gap-1 border border-[var(--app-border)] bg-[var(--app-panel)] px-2 py-1.5 text-xs text-[var(--app-muted)] transition-colors hover:bg-[var(--app-surface-2)]"
        >
          +
        </button>

        <button className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)]">
          <UilShareAlt size={14} />
          Compartir
        </button>
      </div>
    </article>
  )
}

export default function MainFeed() {
  const [loading, setLoading] = useState(true)
  const [feedData, setFeedData] = useState<FeedItem[]>([])
  const [nowPlaying, setNowPlaying] = useState<any>(null)
  const [friendSummary, setFriendSummary] = useState<any[]>([])
  const [topTracks, setTopTracks] = useState<any[]>([])
  const [trendingTracks, setTrendingTracks] = useState<any[]>([])
  const [activities, setActivities] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const feedRes = await FeedService.getFeed()
        setFeedData(Array.isArray(feedRes) ? feedRes : (feedRes.items || []))
        
        try {
          const np = await PlayerService.getNowPlaying()
          const data = np?.data || np;
          if (data) {
             setNowPlaying({
               name: data.name || data.item?.name,
               artist: data.artist || (data.item?.artists ? data.item.artists[0]?.name : undefined),
               album: data.album || data.item?.album?.name,
               imageUrl: data.imageUrl || data.item?.album?.images?.[0]?.url
             });
          }
        } catch(e) {
          console.warn("Could not fetch now playing", e)
        }

        try {
          const summary = await FeedService.getSummary();
          setFriendSummary(summary);
        } catch(e) {
          console.warn("Could not fetch friend summary", e)
        }

        try {
          // Use the profile service to get top tracks for the feed
          const { SpotifyProfileService } = await import('@/features/profile/services/profile.service');
          const tops = await SpotifyProfileService.getTopTracks(5);
          setTopTracks(tops);
        } catch(e) {
          console.warn("Could not fetch top tracks for feed", e)
        }

        try {
          const trending = await FeedService.getTrending();
          setTrendingTracks(trending);
        } catch(e) {
          console.warn("Could not fetch trending tracks", e)
        }
      } catch (err) {
        console.error("Error loading feed", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()

    const interval = setInterval(() => {
      FeedService.getSummary()
        .then(summary => setFriendSummary(summary))
        .catch(e => console.warn("Could not refresh friend summary", e))
    }, 30000);

    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    const socket = socketService.connect()

    // Authenticate WS
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
      socket.emit('message', { type: 'AUTH', token })
    }
    
    const handleWs = (data: any) => {
      if (data.type === 'MESSAGE_RECEIVED' && data.payload) {
        setActivities(prev => [`Nuevo mensaje: ${data.payload.content || ''}`, ...prev].slice(0, 5))
      }
    }

    socket.on('message', handleWs)

    return () => {
      socket.off('message', handleWs)
    }
  }, [])

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-6 md:px-8 md:py-10">
        <section className="space-y-[clamp(var(--space-8),4vw,var(--space-20))]">
          {/* Section 1: Friends Live */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="type-section font-display flex items-center gap-2 font-bold uppercase tracking-[0.02em] text-[var(--app-text)]">
                 <span className="h-2 w-2 bg-[var(--accent-primary)] animate-pulse" />
                 Escuchando ahora
              </h2>
              <button onClick={() => router.push('/twin-match')} className="border border-[var(--app-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--app-text)]">Ver todos</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {friendSummary.length === 0 ? (
                <div className="flex-1 border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center text-[var(--app-muted)]">
                  Tus amigos no están escuchando música en este momento.
                </div>
              ) : friendSummary.map((friend, i) => (
                <div key={i} className="flex min-w-[200px] shrink-0 flex-col items-center gap-3 border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition-colors hover:bg-[var(--app-surface-2)]">
                  <div className="relative">
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} className="h-16 w-16 border border-[var(--app-border)] object-cover" alt="" />
                    ) : (
                      <div className="h-16 w-16 border border-[var(--app-border)] bg-[var(--app-bg)]" />
                    )}
                    <span className="absolute bottom-0 right-0 h-4 w-4 border border-[var(--app-surface)] bg-[var(--accent-primary)]" />
                  </div>
                  <div className="text-center min-w-0 w-full mt-2">
                    <p className="truncate text-sm font-bold uppercase tracking-[0.04em] text-[var(--app-text)]">{friend.displayName}</p>
                    <p className="truncate text-[10px] text-[var(--app-muted)]">
                      {friend.trackName || 'Escuchando música'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: User Favorites / Top Tracks */}
          <div>
            <div className="mb-6">
              <h2 className="type-section font-display font-bold uppercase text-[var(--app-text)]">Tus favoritos recientes</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">Lo que más has escuchado en Spotify estos días.</p>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
              {topTracks.length === 0 ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="h-40 min-w-[120px] animate-pulse border border-[var(--app-border)] bg-[var(--app-surface)]" />
                ))
              ) : topTracks.map((track, i) => (
                <div key={i} className="group relative min-w-[155px] max-w-[155px] shrink-0">
                  <div className="aspect-square overflow-hidden border border-[var(--app-border)] transition-transform group-hover:scale-[1.01]">
                    {track.imageUrl || track.albumImageUrl ? (
                       <img src={track.imageUrl || track.albumImageUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--app-bg)] text-[var(--app-muted)]">
                        <UilMusic size={32} />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 min-w-0">
                    <p className="truncate text-sm font-bold uppercase tracking-[0.03em] text-[var(--app-text)]">{track.name}</p>
                    <p className="truncate text-xs text-[var(--app-muted)]">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Trending in Network */}
          <div>
            <div className="mb-6">
              <h2 className="type-section font-display font-bold uppercase text-[var(--app-text)]">Lo más escuchado en tu red</h2>
              <p className="mt-1 text-sm text-[var(--app-muted)]">Canciones populares entre tus amigos recientemente.</p>
              <div className="mt-5 space-y-6 border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
              {trendingTracks.length === 0 ? (
                <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-12 text-center text-[var(--app-muted)]">
                  No hay suficientes datos de tus amigos para mostrar tendencias aún.
                </div>
              ) : (
                trendingTracks.map((track, i) => {
                  const maxCount = Math.max(...trendingTracks.map(t => parseInt(t.playCount || '1'))) || 1;
                  const percentage = (parseInt(track.playCount || '0') / maxCount) * 100;
                  return (
                    <div key={i} className="group relative">
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                           <span className="w-4 text-xs font-black text-[var(--app-muted)]">{i + 1}</span>
                           <div className="h-10 w-10 shrink-0 overflow-hidden border border-[var(--app-border)]">
                             <img src={track.albumImageUrl || '/song-placeholder.png'} className="h-full w-full object-cover" alt="" />
                           </div>
                           <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold uppercase tracking-[0.03em] text-[var(--app-text)] group-hover:text-[var(--accent-primary)] transition-colors">{track.name}</p>
                              <p className="truncate text-[10px] uppercase tracking-wider text-[var(--app-muted)]">{track.artist}</p>
                           </div>
                        </div>
                        <div className="text-right">
                          <span className="border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-0.5 text-xs font-bold text-[var(--accent-primary)]">{track.playCount} <span className="text-[10px] opacity-70">REPROS</span></span>
                        </div>
                      </div>
                      <div className="relative h-1.5 w-full overflow-hidden bg-[var(--app-bg)]">
                         <div 
                           className="absolute left-0 top-0 h-full bg-[var(--accent-primary)] transition-all duration-1000 ease-out"
                           style={{ width: `${percentage}%` }}
                         />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            </div>
          </div>

          {/* Section 4: Vertical Activity Feed */}
          <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="type-section font-display font-bold uppercase text-[var(--app-text)]">Actividad reciente</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Historial de música de tu red social.</p>
              </div>

          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-20 animate-pulse border border-[var(--app-border)] bg-[var(--app-surface)]" />
              ))
            ) : feedData.length === 0 ? (
              <p className="p-10 text-center text-sm text-[var(--app-muted)]">No hay actividad reciente.</p>
            ) : (
              feedData.map((item, i) => (
                <article key={i} className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--app-border)] bg-[var(--app-surface)] p-3 transition-colors hover:bg-[var(--app-surface-2)]">
                  <div className="h-12 w-12 shrink-0 overflow-hidden border border-[var(--app-border)]">
                    <img src={item.track?.albumImageUrl || '/song-placeholder.png'} className="h-full w-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold uppercase tracking-[0.03em] text-[var(--app-text)]">{item.track?.name}</p>
                    <p className="truncate text-xs text-[var(--app-muted)]">{item.track?.artist}</p>
                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[var(--accent-primary)]">Escuchado por {item.user?.displayName}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <aside className="sticky top-0 space-y-8 self-start">
          <section className="border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-[var(--accent-primary)]">
                <UilMusic size={18} />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">En vivo (Tú)</p>
              </div>
            </div>

            <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              {nowPlaying?.imageUrl ? (
                 <div className="mb-4 overflow-hidden border border-[var(--app-border)]">
                   <img src={nowPlaying.imageUrl} className="w-full object-cover aspect-square" alt="" />
                 </div>
              ) : (
                <div className="mb-4 flex aspect-square items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]">
                  <UilMusic size={40} />
                </div>
              )}
              <p className="truncate font-display text-[clamp(1.1rem,1rem+0.4vw,1.35rem)] font-bold uppercase text-[var(--app-text)]">{nowPlaying?.name || 'Nada sonando'}</p>
              <p className="truncate text-sm text-[var(--accent-primary)]">{nowPlaying?.artist || 'Abre Spotify'}</p>
              
              {nowPlaying && (
                <div className="mt-4 flex h-6 items-end gap-1">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <span
                      key={index}
                      className="eq-bar"
                      style={{ height: `${4 + (index % 5) * 4}px`, animationDelay: `${index * 0.05}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <div className="mb-4 inline-flex items-center gap-2 text-[var(--accent-primary)]">
              <UilMessage size={18} />
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Notificaciones</p>
            </div>
            <div className="space-y-3">
              {activities.length === 0 ? (
                 <p className="text-xs text-[var(--app-muted)]">Sin actividad nueva.</p>
              ) : activities.map((act, i) => (
                 <p key={i} className="border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-xs leading-relaxed text-[var(--app-text)]">{act}</p>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </section>
  </div>
</AppShell>
  )
}
