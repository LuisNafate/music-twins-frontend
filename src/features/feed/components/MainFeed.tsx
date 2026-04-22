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
    return <img src={url} alt={name} className="h-10 w-10 rounded-2xl object-cover" />
  }

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22d3ee]/60 to-[#67e8f9]/35 font-display text-sm font-bold text-white">
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
      className="animate-fade-in-up rounded-3xl border border-white/12 bg-[#25252a]/70 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-3">
        <AvatarPill name={card.user.displayName} url={card.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl font-bold text-white">{title}</h3>
            <span className="text-xs uppercase tracking-[0.14em] text-slate-300/60">{timeAgo}</span>
          </div>
          <p className="text-sm text-slate-300/80">{artist} · {album}</p>
          {card.track.albumImageUrl && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
               <img src={card.track.albumImageUrl} alt={album} className="w-full object-cover max-h-48" />
            </div>
          )}
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#67e8f9]/30 bg-[#67e8f9]/18 px-2 py-1 text-xs text-[#e5be85]">
            <UilHeartRate size={13} />
            Listening now
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        {reactions.map(item => (
          <button
            key={item.emoji}
            onClick={() => handleReact(item.emoji)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-transform active:scale-95 ${
              liked[item.emoji]
                ? 'border-[#ff8d89]/40 bg-[#22d3ee]/35 text-[#fff8ef]'
                : 'border-white/15 bg-white/5 text-slate-200/85 hover:bg-white/10'
            }`}
          >
            <span>{item.emoji}</span>
            <span>{item.count}</span>
          </button>
        ))}

        {/* Example to add new reaction */}
        <button 
          onClick={() => handleReact('🔥')}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10"
        >
          +
        </button>

        <button className="ml-auto inline-flex items-center gap-1 text-xs text-slate-300/70 transition-colors hover:text-white">
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
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-6 md:px-8 md:py-10">
        <section className="space-y-12">
          {/* Section 1: Friends Live */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                 <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                 Escuchando ahora
              </h2>
              <button onClick={() => router.push('/twin-match')} className="text-xs font-semibold text-[#67e8f9] uppercase tracking-wider hover:underline">Ver todos</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {friendSummary.length === 0 ? (
                <div className="flex-1 rounded-3xl border border-white/5 bg-white/5 p-8 text-center text-slate-500 italic">
                  Tus amigos no están escuchando música en este momento.
                </div>
              ) : friendSummary.map((friend, i) => (
                <div key={i} className="flex min-w-[200px] shrink-0 flex-col items-center gap-3 rounded-3xl border border-white/10 bg-[#1f1f23]/60 p-4 transition-transform hover:scale-[1.02]">
                  <div className="relative">
                    {friend.avatarUrl ? (
                      <img src={friend.avatarUrl} className="h-16 w-16 rounded-full object-cover shadow-lg" alt="" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-white/10 to-white/5" />
                    )}
                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#1f1f23] bg-green-500 shadow-sm" />
                  </div>
                  <div className="text-center min-w-0 w-full">
                    <p className="truncate text-sm font-bold text-white">{friend.displayName}</p>
                    <p className="truncate text-[10px] uppercase tracking-widest text-[#67e8f9]/60">Activo ahora</p>
                    <p className="mt-1 truncate text-[11px] font-medium text-white">
                      {friend.trackName || 'Escuchando música...'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: User Favorites / Top Tracks */}
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-white">Tus favoritos recientes</h2>
              <p className="text-sm text-slate-400 mt-1">Lo que más has escuchado en Spotify estos días.</p>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
              {topTracks.length === 0 ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={i} className="h-40 min-w-[120px] animate-pulse rounded-3xl bg-white/5" />
                ))
              ) : topTracks.map((track, i) => (
                <div key={i} className="group relative min-w-[120px] shrink-0">
                  <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-lg transition-transform group-hover:scale-105">
                    {track.imageUrl || track.albumImageUrl ? (
                       <img src={track.imageUrl || track.albumImageUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/5 text-slate-600">
                        <UilMusic size={32} />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 min-w-0">
                    <p className="truncate text-sm font-bold text-white">{track.name}</p>
                    <p className="truncate text-xs text-slate-400">{track.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Trending in Network */}
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-white">Lo más escuchado en tu red</h2>
              <p className="text-sm text-slate-400 mt-1">Canciones populares entre tus amigos recientemente.</p>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
              {trendingTracks.length === 0 ? (
                <div className="flex-1 rounded-3xl border border-white/5 bg-white/5 p-8 text-center text-slate-500 italic">
                  No hay suficientes datos para mostrar tendencias aún.
                </div>
              ) : trendingTracks.map((track, i) => (
                <div key={i} className="group relative min-w-[160px] shrink-0">
                  <div className="aspect-square overflow-hidden rounded-3xl border border-white/10 shadow-lg transition-transform group-hover:scale-105">
                    {track.albumImageUrl ? (
                       <img src={track.albumImageUrl} className="h-full w-full object-cover" alt="" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/5 text-slate-600">
                        <UilMusic size={32} />
                      </div>
                    )}
                  </div>
                  <div className="mt-3 min-w-0">
                    <p className="truncate text-sm font-bold text-white">{track.name}</p>
                    <p className="truncate text-xs text-slate-400">{track.artist}</p>
                    <p className="mt-1 text-[10px] text-[#67e8f9] font-bold uppercase tracking-wider">{track.playCount} repros</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Vertical Activity Feed */}
          <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <div className="mb-2">
                <h2 className="font-display text-2xl font-bold text-white">Actividad reciente</h2>
                <p className="text-sm text-slate-400 mt-1">Historial de música de tu red social.</p>
              </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {loading && (
               <div className="p-8 text-center text-slate-400">Loading feed...</div>
            )}
            {!loading && feedData.length === 0 && (
               <div className="p-8 text-center text-slate-400">No hay actividad reciente en tu red.</div>
            )}
            {!loading && feedData.map((item, i) => (
              <article key={i} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/2 p-3 transition-colors hover:bg-white/5">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                  <img src={item.track?.albumImageUrl || '/song-placeholder.png'} className="h-full w-full object-cover" alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{item.track?.name}</p>
                  <p className="truncate text-xs text-slate-400">{item.track?.artist}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-[#67e8f9]/70">Escuchado por {item.user?.displayName || 'Alguien'}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-8">
          <section className="rounded-3xl border border-white/12 bg-[#1f1f23]/70 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-[#e5be85]">
                <UilMusic size={18} />
                <p className="text-xs font-bold uppercase tracking-[0.2em]">En vivo (Tú)</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#25252a]/40 p-4">
              {nowPlaying?.imageUrl ? (
                 <div className="mb-4 overflow-hidden rounded-xl shadow-lg">
                   <img src={nowPlaying.imageUrl} className="w-full object-cover aspect-square" alt="" />
                 </div>
              ) : (
                <div className="mb-4 flex aspect-square items-center justify-center rounded-xl bg-white/5 text-slate-600">
                  <UilMusic size={40} />
                </div>
              )}
              <p className="truncate font-display text-lg font-bold text-white">{nowPlaying?.name || 'Nada sonando'}</p>
              <p className="truncate text-sm text-[#67e8f9]">{nowPlaying?.artist || 'Abre Spotify'}</p>
              
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

          <section className="rounded-3xl border border-white/12 bg-[#25252a]/70 p-6">
            <div className="mb-4 inline-flex items-center gap-2 text-[#f0b7a9]">
              <UilMessage size={18} />
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Notificaciones</p>
            </div>
            <div className="space-y-3">
              {activities.length === 0 ? (
                 <p className="text-slate-500 text-xs italic">Sin actividad nueva.</p>
              ) : activities.map((act, i) => (
                 <p key={i} className="rounded-2xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-slate-200">{act}</p>
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
