"use client"

import { useEffect, useState, useRef } from 'react'
import html2canvas from 'html2canvas'
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
  const cardRef = useRef<HTMLDivElement>(null)
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

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `musictwins-${title.replace(/\\s+/g, '-').toLowerCase()}.png`;
      a.click();
    } catch(err) {
      console.error('Error taking snapshot', err)
    }
  }

  return (
    <article
      className="animate-fade-in-up border border-[var(--app-border)] bg-[var(--app-surface)] p-4"
      style={{ animationDelay: `${delay}s` }}
    >
      <div ref={cardRef} className="bg-[var(--app-surface)] p-1">
        <div className="mb-4 flex items-center gap-3">
          <AvatarPill name={card.user.displayName} url={card.user.avatarUrl} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold uppercase tracking-[0.04em] text-[var(--app-text)]">{card.user.displayName}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-muted)]">{timeAgo}</p>
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          {card.track.albumImageUrl ? (
            <div className="aspect-square w-24 shrink-0 overflow-hidden border border-[var(--app-border)] sm:w-28">
               <img src={card.track.albumImageUrl} alt={album} className="h-full w-full object-cover" crossOrigin="anonymous" />
            </div>
          ) : (
            <div className="flex aspect-square w-24 shrink-0 items-center justify-center border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)] sm:w-28">
              <UilMusic size={24} />
            </div>
          )}
          <div className="min-w-0 flex-1">
             <h3 className="truncate font-display text-[clamp(1.1rem,1rem+0.4vw,1.3rem)] font-bold uppercase text-[var(--app-text)]">{title}</h3>
             <p className="truncate text-xs text-[var(--app-muted)]">{artist} · {album}</p>
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

        <button onClick={handleShare} className="ml-auto inline-flex items-center gap-1 text-xs text-[var(--app-muted)] transition-colors hover:text-[var(--app-text)]">
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

    const fetchNowPlaying = async () => {
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
        } else {
           setNowPlaying(null);
        }
      } catch(e) {
        console.warn("Could not fetch now playing", e)
      }
    };

    fetchNowPlaying();

    const interval = setInterval(() => {
      FeedService.getSummary()
        .then(summary => setFriendSummary(summary))
        .catch(e => console.warn("Could not refresh friend summary", e))
    }, 30000);

    const npInterval = setInterval(fetchNowPlaying, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(npInterval);
    };
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

  const liveCount = friendSummary.length
  const trendCount = trendingTracks.length
  const activityCount = feedData.length
  const isLive = Boolean(nowPlaying?.name)

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-[1480px] gap-6 px-4 py-6 md:px-8 md:py-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-[clamp(var(--space-8),4vw,var(--space-16))]">
          <article className="grid gap-5 border border-[var(--app-border)] bg-[var(--app-surface)] p-5 md:grid-cols-[1.3fr_1fr] md:p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent-primary)]">Resumen de hoy</p>
              <h1 className="type-page mt-2 font-display font-black uppercase leading-none text-[var(--app-text)]">Tu actividad</h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--app-muted)]">Lo importante de tu día musical, en una vista.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={() => router.push('/twin-match')} className="border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.14)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--app-text)]">
                  Ver twins
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-muted)]">Live</p>
                <p className="font-display text-3xl text-[var(--app-text)]">{liveCount}</p>
                <p className="text-[10px] uppercase text-[var(--accent-primary)]">amigos activos</p>
              </div>
              <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-muted)]">Trends</p>
                <p className="font-display text-3xl text-[var(--app-text)]">{trendCount}</p>
                <p className="text-[10px] uppercase text-[var(--accent-primary)]">tracks en red</p>
              </div>
              <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--app-muted)]">Feed</p>
                <p className="font-display text-3xl text-[var(--app-text)]">{activityCount}</p>
                <p className="text-[10px] uppercase text-[var(--accent-primary)]">eventos</p>
              </div>
            </div>
          </article>

          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="type-section font-display flex items-center gap-2 font-bold uppercase text-[var(--app-text)]">
                <span className="h-2 w-2 bg-[var(--accent-primary)] animate-pulse" />
                Escuchando ahora
              </h2>
              <button onClick={() => router.push('/twin-match')} className="border border-[var(--app-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--app-muted)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--app-text)]">Ver todos</button>
            </div>

            {friendSummary.length === 0 ? (
              <div className="border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-center text-[var(--app-muted)]">
                Tus amigos no están escuchando música en este momento.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {friendSummary.map((friend, i) => (
                  <article key={i} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-3 border border-[var(--app-border)] bg-[var(--app-surface)] p-4 transition-colors hover:bg-[var(--app-surface-2)]">
                    <div className="relative">
                      {friend.avatarUrl ? (
                        <img src={friend.avatarUrl} className="h-16 w-16 border border-[var(--app-border)] object-cover" alt="" />
                      ) : (
                        <div className="h-16 w-16 border border-[var(--app-border)] bg-[var(--app-bg)]" />
                      )}
                      <span className="absolute bottom-0 right-0 h-3 w-3 border border-[var(--app-surface)] bg-[var(--accent-primary)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold uppercase tracking-[0.04em] text-[var(--app-text)]">{friend.displayName}</p>
                      <p className="truncate text-[10px] uppercase tracking-[0.1em] text-[var(--app-muted)]">{friend.trackName || 'Escuchando música'}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {feedData.length > 0 && (
            <section>
              <div className="mb-5 flex items-center gap-2">
                <UilFavorite size={16} className="text-[var(--accent-primary)]" />
                <h2 className="type-section font-display font-bold uppercase text-[var(--app-text)]">Momentos destacados</h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {feedData.slice(0, 2).map((item, i) => (
                  <SongCardItem key={`highlight-${i}`} card={item} delay={i * 0.08} />
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
              <div className="mb-5">
                <h2 className="type-section font-display font-bold uppercase text-[var(--app-text)]">Tus favoritos recientes</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Lo que más has escuchado en Spotify estos días.</p>
              </div>
              {topTracks.length === 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-36 animate-pulse border border-[var(--app-border)] bg-[var(--app-bg)]" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {topTracks.map((track, i) => (
                    <article key={i} className="border border-[var(--app-border)] bg-[var(--app-bg)] p-2">
                      <div className="aspect-square overflow-hidden border border-[var(--app-border)]">
                        {track.imageUrl || track.albumImageUrl ? (
                          <img src={track.imageUrl || track.albumImageUrl} className="h-full w-full object-cover" alt="" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--app-muted)]">
                            <UilMusic size={28} />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 truncate text-xs font-bold uppercase tracking-[0.04em] text-[var(--app-text)]">{track.name}</p>
                      <p className="truncate text-[10px] uppercase text-[var(--app-muted)]">{track.artist}</p>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
              <div className="mb-5">
                <h2 className="type-section font-display font-bold uppercase text-[var(--app-text)]">Lo más escuchado en tu red</h2>
                <p className="mt-1 text-sm text-[var(--app-muted)]">Canciones populares entre tus amigos recientemente.</p>
              </div>

              {trendingTracks.length === 0 ? (
                <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-10 text-center text-[var(--app-muted)]">
                  No hay suficientes datos de tus amigos para mostrar tendencias aún.
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingTracks.map((track, i) => {
                    const maxCount = Math.max(...trendingTracks.map(t => parseInt(t.playCount || '1'))) || 1
                    const percentage = (parseInt(track.playCount || '0') / maxCount) * 100
                    return (
                      <div key={i} className="border-b border-[var(--app-border)] pb-3 last:border-b-0">
                        <div className="mb-2 grid grid-cols-[20px_40px_minmax(0,1fr)_auto] items-center gap-3">
                          <span className="text-xs font-black text-[var(--app-muted)]">{i + 1}</span>
                          <div className="h-10 w-10 overflow-hidden border border-[var(--app-border)]">
                            <img src={track.albumImageUrl || '/song-placeholder.png'} className="h-full w-full object-cover" alt="" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold uppercase tracking-[0.03em] text-[var(--app-text)]">{track.name}</p>
                            <p className="truncate text-[10px] uppercase tracking-[0.1em] text-[var(--app-muted)]">{track.artist}</p>
                          </div>
                          <span className="border border-[var(--app-border)] bg-[var(--app-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--accent-primary)]">{track.playCount} REPROS</span>
                        </div>
                        <div className="relative h-1.5 overflow-hidden bg-[var(--app-bg)]">
                          <div className="absolute left-0 top-0 h-full bg-[var(--accent-primary)]" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </article>
          </section>

          <section>
            <div className="mb-5 flex items-center gap-2">
              <UilPlay size={16} className="text-[var(--accent-primary)]" />
              <h2 className="type-section font-display font-bold uppercase text-[var(--app-text)]">Actividad reciente</h2>
            </div>

            <div className="border border-[var(--app-border)] bg-[var(--app-surface)]">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 animate-pulse border border-[var(--app-border)] bg-[var(--app-bg)]" />
                  ))}
                </div>
              ) : feedData.length === 0 ? (
                <p className="p-10 text-center text-sm text-[var(--app-muted)]">No hay actividad reciente.</p>
              ) : (
                <div className="divide-y divide-[var(--app-border)]">
                  {feedData.map((item, i) => (
                    <article key={i} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-4 p-3 transition-colors hover:bg-[var(--app-surface-2)]">
                      <div className="h-12 w-12 overflow-hidden border border-[var(--app-border)]">
                        <img src={item.track?.albumImageUrl || '/song-placeholder.png'} className="h-full w-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold uppercase tracking-[0.03em] text-[var(--app-text)]">{item.track?.name}</p>
                        <p className="truncate text-xs text-[var(--app-muted)]">{item.track?.artist}</p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[var(--accent-primary)]">Escuchado por {item.user?.displayName}</p>
                        {item.reactions && item.reactions.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.reactions.map(r => (
                              <span key={r.emoji} className="inline-flex items-center gap-1 rounded border border-[var(--app-border)] bg-[var(--app-surface-2)] px-1.5 py-0.5 text-[10px] text-[var(--app-text)]">
                                <span>{r.emoji}</span>
                                <span className="text-[var(--app-muted)]">{r.count}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[var(--app-muted)]">{getTimeAgo(item.playedAt)}</span>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </section>

        <aside className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
          <section className="border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className={`inline-flex items-center gap-2 ${isLive ? 'text-[var(--accent-primary)]' : 'text-[var(--app-muted)]'}`}>
                <UilMusic size={18} />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">{isLive ? 'En vivo (Tú)' : 'Sin reproducción'}</p>
              </div>
              <UilUsersAlt size={16} className="text-[var(--app-muted)]" />
            </div>

            <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              {nowPlaying?.imageUrl ? (
                <div className="mb-4 overflow-hidden border border-[var(--app-border)]">
                  <img src={nowPlaying.imageUrl} className="aspect-square w-full object-cover" alt="" />
                </div>
              ) : (
                <div className="mb-4 flex aspect-square items-center justify-center border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-muted)]">
                  <UilMusic size={40} />
                </div>
              )}
              <p className="truncate font-display text-[clamp(1.1rem,1rem+0.4vw,1.35rem)] font-bold uppercase text-[var(--app-text)]">{nowPlaying?.name || 'Nada sonando'}</p>
              <p className={`truncate text-sm ${isLive ? 'text-[var(--accent-primary)]' : 'text-[var(--app-muted)]'}`}>{isLive ? (nowPlaying?.artist || 'Artista desconocido') : 'Abre Spotify para sincronizar'}</p>

              {nowPlaying && (
                <div className="mt-4 flex h-6 items-end gap-1">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <span key={index} className="eq-bar" style={{ height: `${4 + (index % 5) * 4}px`, animationDelay: `${index * 0.05}s` }} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="border border-[var(--app-border)] bg-[var(--app-surface)] p-5">
            <div className="mb-4 inline-flex items-center gap-2 text-[var(--accent-primary)]">
              <UilMessage size={18} />
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Notificaciones</p>
            </div>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-[var(--app-muted)]">Sin actividad nueva.</p>
              ) : (
                activities.map((act, i) => (
                  <p key={i} className="border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-xs leading-relaxed text-[var(--app-text)]">{act}</p>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  )
}
