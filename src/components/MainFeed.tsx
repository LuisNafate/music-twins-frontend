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
import AppShell from './shared/AppShell'
import { FeedService, InteractionService, PlayerService } from '../services/api'
import { socketService } from '../services/socket'
import { FeedItem } from '../types'

function AvatarPill({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#781635]/60 to-[#d4a259]/35 font-display text-sm font-bold text-white">
      {initials}
    </span>
  )
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
        await InteractionService.reactToEvent(card.id, emoji)
      }
    } catch (error) {
      console.error('Failed to react', error)
      // Revert optimistic if needed...
    }
  }

  // Fallbacks if mapping is not exact
  const title = card.title || 'Unknown Title'
  const timeAgo = card.timeAgo || 'recent'
  const artistAlbum = card.artistAlbum || 'Unknown Artist'
  const mood = card.mood || 'Vibe'

  return (
    <article
      className="animate-fade-in-up rounded-3xl border border-white/12 bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start gap-3">
        <AvatarPill name={card.friend || 'A'} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl font-bold text-white">{title}</h3>
            <span className="text-xs uppercase tracking-[0.14em] text-slate-300/60">{timeAgo}</span>
          </div>
          <p className="text-sm text-slate-300/80">{artistAlbum}</p>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#d4a259]/30 bg-[#d4a259]/18 px-2 py-1 text-xs text-[#e5be85]">
            <UilHeartRate size={13} />
            {mood}
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
                ? 'border-[#e7b18f]/40 bg-[#781635]/35 text-[#f7e2d5]'
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
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(43)
  const [feedData, setFeedData] = useState<FeedItem[]>([])
  const [nowPlaying, setNowPlaying] = useState<any>(null)
  const [activities, setActivities] = useState<string[]>([
    "Alex agrego 3 tracks al mix de noche.",
    "Sarah reacciono a tu playlist chillwave.",
    "Jordan te invito a una listening room."
  ])
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const feedRes = await FeedService.getFeed()
        setFeedData(Array.isArray(feedRes) ? feedRes : (feedRes.items || []))
        
        try {
          const np = await PlayerService.getNowPlaying()
          if (np) setNowPlaying(np)
        } catch(e) {
          console.warn("Could not fetch now playing", e)
        }
      } catch (err) {
        console.error("Error loading feed", err)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const socket = socketService.connect()
    
    socket.on('MESSAGE_RECEIVED', (data) => {
      setActivities(prev => [`Nuevo mensaje de ${data.sender || 'un twin'}: ${data.text || ''}`, ...prev].slice(0, 5))
    })

    socket.on('activity', (data) => {
      setActivities(prev => [data.message, ...prev].slice(0, 5))
    })

    return () => {
      socket.off('MESSAGE_RECEIVED')
      socket.off('activity')
    }
  }, [])

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      setProgress(value => (value >= 100 ? 0 : value + 0.08))
    }, 160)

    return () => clearInterval(id)
  }, [isPlaying])

  const progressLabel = useMemo(() => {
    const totalSeconds = Math.floor((progress / 100) * 243)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [progress])

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 md:px-6 md:py-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-5">
          <header className="rounded-3xl border border-white/12 bg-white/[0.04] p-5 md:p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f2cab4]">Music activity feed</p>
            <h1 className="mt-2 font-display text-3xl font-black text-white md:text-4xl">Movimiento social en tiempo real</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200/75 md:text-base">
              Explora lo que tus amigos estan escuchando y reacciona al instante. Tu timeline se adapta al ritmo comun de la red.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_290px]">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push('/twin-match')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#781635] to-[#e4504a] px-4 py-2 text-sm font-semibold text-white"
                >
                  <UilUsersAlt size={16} />
                  Ver Twin Match
                </button>
                <button
                  onClick={() => router.push('/messages')}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10"
                >
                  <UilMessage size={16} />
                  Abrir mensajes
                </button>
              </div>

              <div className="rounded-2xl border border-[#d4a259]/20 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[#f2cab4]/85">Compartir snapshot</p>
                  <span className="rounded-full bg-[#d4a259]/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#f2dec2]">
                    Hoy
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-xl bg-white/5 px-2 py-2">
                    <p className="text-[#f2cab4]">84%</p>
                    <p className="mt-1 text-slate-300/60">Match</p>
                  </div>
                  <div className="rounded-xl bg-white/5 px-2 py-2">
                    <p className="text-[#f2cab4]">27</p>
                    <p className="mt-1 text-slate-300/60">Amigos</p>
                  </div>
                  <div className="rounded-xl bg-white/5 px-2 py-2">
                    <p className="text-[#f2cab4]">3</p>
                    <p className="mt-1 text-slate-300/60">Twins</p>
                  </div>
                </div>
                <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-100 transition-colors hover:bg-white/10">
                  <UilShareAlt size={14} />
                  Compartir resumen
                </button>
              </div>
            </div>
          </header>

          <div className="space-y-4">
            {feedData.length === 0 && (
               <div className="p-8 text-center text-slate-400">Loading feed...</div>
            )}
            {feedData.map((card, index) => (
              <SongCardItem key={card.id || index} card={card} delay={index * 0.07} />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-[#e5be85]">Now playing</p>
              <span className="rounded-full bg-[#d4a259]/28 px-2 py-1 text-[11px] text-[#f2dec2]">Live</span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-display text-xl font-bold text-white">{nowPlaying?.title || 'Midnight City'}</p>
              <p className="text-sm text-[#f2cab4]">{nowPlaying?.artist || 'M83'}</p>
              <p className="text-xs text-slate-300/65">{nowPlaying?.album || "Hurry Up, We're Dreaming"}</p>

              <div className="mt-4 flex items-end gap-1">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span
                    key={index}
                    className="eq-bar"
                    style={{ height: `${6 + (index % 5) * 5}px`, animationDelay: `${index * 0.05}s` }}
                  />
                ))}
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-300/70">
                  <span>{progressLabel}</span>
                  <span>4:03</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#781635] via-[#e4504a] to-[#d4a259]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setIsPlaying(value => !value)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-slate-100 transition-colors hover:bg-white/10"
              >
                {isPlaying ? <UilFavorite size={16} /> : <UilPlay size={16} />}
                {isPlaying ? 'Pausar session' : 'Reanudar session'}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/12 bg-white/[0.04] p-5">
            <div className="mb-3 inline-flex items-center gap-2 text-[#f0b7a9]">
              <UilMusic size={16} />
              <p className="text-xs uppercase tracking-[0.16em]">Actividad de sala</p>
            </div>
            <div className="space-y-2 text-sm text-slate-200/85">
              {activities.map((act, i) => (
                 <p key={i} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">{act}</p>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  )
}
