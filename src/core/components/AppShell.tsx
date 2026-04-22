"use client"

import React, { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  UilEstate,
  UilHeadphones,
  UilMessage,
  UilMusic,
  UilSignOutAlt,
  UilUsersAlt,
  UilUser,
} from '@iconscout/react-unicons'
import { AuthService } from '@/features/auth/services/auth.service'
import { PlayerService } from '@/features/feed/services/feed.service'
import { useAuthStore } from '@/core/store/auth.store'

export type AppView = 'feed' | 'twin-match' | 'messages' | 'profile'

interface NavItemProps {
  icon: React.ComponentType<{ size?: string | number; className?: string }>
  label: string
  active: boolean
  onClick: () => void
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group ${
        active
          ? 'bg-white/15 text-white border border-white/20 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]'
          : 'text-slate-300/80 hover:text-white hover:bg-white/10 border border-transparent'
      }`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={18} className={`transition-opacity ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
      <span>{label}</span>
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#67e8f9] animate-pulse" />
      )}
    </button>
  )
}

interface AppShellProps {
  children: React.ReactNode
}

const navItems: Array<{
  icon: React.ComponentType<{ size?: string | number; className?: string }>
  label: string
  view: AppView
}> = [
  { icon: UilEstate, label: 'Feed', view: 'feed' },
  { icon: UilMessage, label: 'Mensajes', view: 'messages' },
  { icon: UilUsersAlt, label: 'Amigos / Match', view: 'twin-match' },
  { icon: UilUser, label: 'Perfil', view: 'profile' }
]

const viewHeadline: Record<AppView, string> = {
  feed: 'FEED',
  messages: 'MENSAJES',
  'twin-match': 'TWIN MATCH',
  profile: 'PERFIL',
}

function pathnameToView(pathname: string): AppView {
  if (pathname.startsWith('/messages')) return 'messages'
  if (pathname.startsWith('/twin-match')) return 'twin-match'
  if (pathname.startsWith('/profile')) return 'profile'
  return 'feed'
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const activeView = pathnameToView(pathname)
  const { user, setUser } = useAuthStore()
  const [nowPlaying, setNowPlaying] = useState<any>(null)
  const lastTrackId = useRef<string | null>(null)

  // Provide strict auth guarding
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    if (!user) {
      if (!token) {
        // Ghost user without token
        router.replace('/');
      } else {
        // Token exists but store was wiped (refresh), try restoring
        AuthService.getProfile()
          .then(res => {
            const u = (res as any)?.user || (res as any)?.data || res;
            if (u) setUser(u);
            else router.replace('/');
          })
          .catch(err => {
            console.warn("Session expired or invalid:", err);
            localStorage.removeItem('access_token');
            router.replace('/');
          });
      }
    }
  }, [user, setUser, router])

  useEffect(() => {
    const fetchNowPlaying = () => {
      PlayerService.getNowPlaying()
        .then(res => {
          const data = res?.data || res;
          if(!data) {
            setNowPlaying(null);
            lastTrackId.current = null;
            return;
          }
          
          const trackName = data.name || data.item?.name;
          // El backend usa 'trackId' según la interfaz de NestJS
          const trackId = data.trackId || data.id || data.item?.id || data.uri; 
          const artist = data.artist || (data.item?.artists ? data.item.artists[0]?.name : undefined);
          const album = data.album || data.item?.album?.name;
          const imageUrl = data.imageUrl || data.item?.album?.images?.[0]?.url;

          console.log("[MusicTwins] Detectado:", trackName, "ID:", trackId);

          setNowPlaying({
            name: trackName,
            artist,
            album,
            imageUrl
          });

          // Sincronizar si es una canción nueva y tenemos ID
          if (trackId && trackId !== lastTrackId.current) {
            console.log("[MusicTwins] Sincronizando nueva canción con el servidor...");
            lastTrackId.current = trackId;
            PlayerService.syncPlayback({
              trackId,
              name: trackName,
              artist,
              albumName: album,
              albumImageUrl: imageUrl
            })
            .then(() => console.log("[MusicTwins] Sincronización exitosa"))
            .catch(e => console.error("[MusicTwins] Error al sincronizar:", e));
          }
        })
        .catch((e) => console.warn("No playback available", e))
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, [pathname])

  function navigateTo(view: AppView) {
    if (view === 'feed') router.push('/feed')
    if (view === 'messages') router.push('/messages')
    if (view === 'twin-match') router.push('/twin-match')
    if (view === 'profile') router.push('/profile')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0e0e11] text-[#fff8ef] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(103, 232, 249,0.32),transparent_34%),radial-gradient(circle_at_80%_25%,rgba(255, 141, 137,0.22),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(103, 232, 249,0.2),transparent_35%)]" />

      <div className="relative mx-auto flex h-screen w-full max-w-[1500px] overflow-hidden pb-20 md:pb-0">
        <aside className="hidden w-64 min-w-[16rem] max-w-[16rem] shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl md:flex md:flex-col sticky top-0 h-screen overflow-hidden">
          <div className="flex h-full flex-col justify-between py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 border-b border-white/10 px-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-[#22d3ee] to-[#67e8f9] text-slate-100 shadow-[0_0_24px_rgba(103, 232, 249,0.4)]">
                <UilHeadphones size={20} />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tracking-[0.08em]">MusicTwins</p>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#67e8f9]/80">Audio Society</p>
              </div>
            </div>

            {/* User Profile Hook */}
            {user && (
              <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/5 p-3 outline outline-1 outline-white/10">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover shadow-md" />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#22d3ee]/60 to-[#67e8f9]/35 text-xs font-bold text-white">
                    {(user.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="truncate text-sm font-semibold text-white">{user.displayName || 'Twin User'}</p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 px-4 py-4">
            {navItems.map(item => (
              <NavItem
                key={item.view}
                icon={item.icon}
                label={item.label}
                active={activeView === item.view}
                onClick={() => navigateTo(item.view)}
              />
            ))}
          </nav>

          <div className="mx-3 mb-2 rounded-xl border border-[#67e8f9]/20 bg-black/30 p-3">
            <div className="mb-1.5 flex items-center gap-2 text-[#e5be85]">
              <UilMusic size={14} />
              <span className="text-[10px] uppercase tracking-[0.15em]">En vivo</span>
            </div>
            <div className="flex items-center gap-3">
              {nowPlaying?.imageUrl && (
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10">
                  <img src={nowPlaying.imageUrl} alt={nowPlaying.album} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{nowPlaying?.name || 'Silencio'}</p>
                <p className="truncate text-[10px] text-slate-400">{nowPlaying?.artist || 'Spotify'}</p>
              </div>
            </div>
          </div>

          </div>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={() => {
                AuthService.logout();
                router.push('/');
              }}
              className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm text-slate-300/80 transition-all duration-200 hover:border-[#ff8d89]/50 hover:bg-[#ff8d89]/20 hover:text-[#ffd9cc]"
            >
              <UilSignOutAlt size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

        <main className="relative flex-1 h-screen overflow-y-auto custom-scrollbar">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-56 bg-[linear-gradient(180deg,rgba(255, 141, 137,0.15),transparent)]" />
          <p className="pointer-events-none absolute left-10 top-4 z-0 hidden select-none font-display text-8xl font-semibold tracking-[0.08em] text-[#67e8f9]/[0.08] md:block">
            {viewHeadline[activeView]}
          </p>
          <div className="relative z-10">{children}</div>
        </main>

        <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-2 rounded-2xl border border-white/15 bg-slate-950/80 p-2 backdrop-blur-xl md:hidden">
          {navItems.map(item => {
            const Icon = item.icon
            const active = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => navigateTo(item.view)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] transition-all ${
                  active ? 'bg-white/15 text-white' : 'text-slate-300/70'
                }`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => {
              AuthService.logout();
              router.push('/');
            }}
            className="rounded-xl px-3 py-2 text-red-200/90"
            aria-label="Cerrar sesión"
          >
            <UilSignOutAlt size={18} />
          </button>
        </nav>
      </div>
    </div>
  )
}
