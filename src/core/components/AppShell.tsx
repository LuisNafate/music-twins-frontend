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
      className={`group grid w-full grid-cols-[18px_minmax(0,1fr)_10px] items-center gap-3 border-l-2 px-3 py-3 text-left text-sm uppercase tracking-[0.08em] transition-colors duration-150 ${
        active
          ? 'border-l-[var(--accent-primary)] bg-[var(--app-surface-2)] text-[var(--app-text)]'
          : 'border-l-transparent text-[var(--app-muted)] hover:border-l-[var(--app-border)] hover:bg-[var(--app-panel)] hover:text-[var(--app-text)]'
      }`}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={18} className={`transition-opacity ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
      <span>{label}</span>
      {active && (
        <span className="ml-auto h-2 w-2 bg-[var(--accent-primary)]" />
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
  const isLive = Boolean(nowPlaying?.name)

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
    <div className="relative min-h-screen w-full overflow-hidden bg-app-background text-[var(--app-text)]">

      <div className="relative mx-auto grid h-screen w-full max-w-[1600px] grid-cols-1 overflow-hidden pb-20 md:grid-cols-[260px_minmax(0,1fr)] md:pb-0">
        <aside className="sticky top-0 hidden h-screen overflow-hidden border-r border-[var(--app-border)] bg-[var(--app-surface)] md:flex md:flex-col">
          <div className="flex h-full flex-col justify-between py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 border-b border-[var(--app-border)] px-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]">
                <UilHeadphones size={20} />
              </div>
              <div>
                <p className="font-display text-3xl leading-none tracking-[0.08em]">MusicTwins</p>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--app-muted)]">Audio Society</p>
              </div>
            </div>

            {/* User Profile Hook */}
            {user && (
              <div className="mt-2 flex items-center gap-3 border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-9 w-9 object-cover" />
                ) : (
                  <div className="grid h-9 w-9 place-items-center border border-[var(--app-border)] bg-[var(--app-surface-2)] text-xs font-bold text-[var(--app-text)]">
                    {(user.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <p className="truncate text-sm font-semibold uppercase tracking-[0.05em] text-[var(--app-text)]">{user.displayName || 'Twin User'}</p>
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

          <div className="mx-3 mb-2 border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
            <div className={`mb-2 flex items-center gap-2 ${isLive ? 'text-[var(--accent-primary)]' : 'text-[var(--app-muted)]'}`}>
              <UilMusic size={14} />
              <span className="text-[10px] uppercase tracking-[0.15em]">{isLive ? 'En vivo' : 'Sin reproducción'}</span>
            </div>
            <div className="flex items-center gap-3">
              {nowPlaying?.imageUrl && (
                <div className="h-10 w-10 shrink-0 overflow-hidden border border-[var(--app-border)]">
                  <img src={nowPlaying.imageUrl} alt={nowPlaying.album} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold uppercase tracking-[0.03em] text-[var(--app-text)]">{nowPlaying?.name || 'Silencio'}</p>
                <p className="truncate text-[10px] text-[var(--app-muted)]">{isLive ? (nowPlaying?.artist || 'Artista desconocido') : 'Abre Spotify para sincronizar'}</p>
              </div>
            </div>
          </div>

          </div>

          <div className="border-t border-[var(--app-border)] p-4">
            <button
              onClick={() => {
                AuthService.logout();
                router.push('/');
              }}
              className="flex w-full items-center gap-3 border border-[var(--app-border)] px-3 py-2.5 text-sm uppercase tracking-[0.08em] text-[var(--app-muted)] transition-colors duration-150 hover:border-[var(--accent-primary)] hover:bg-[rgba(224,108,26,0.12)] hover:text-[var(--app-text)]"
            >
              <UilSignOutAlt size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

        <main className="relative h-screen overflow-y-auto custom-scrollbar">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(transparent_31px,rgba(240,237,230,0.04)_32px),linear-gradient(90deg,transparent_31px,rgba(240,237,230,0.04)_32px)] bg-[length:32px_32px]" />
          <p className="pointer-events-none absolute left-10 top-4 z-0 hidden select-none font-display text-[clamp(4.5rem,8vw,8.5rem)] leading-none tracking-[0.08em] text-[rgba(232,230,224,0.05)] md:block">
            {viewHeadline[activeView]}
          </p>
          <div className="relative z-10">{children}</div>
        </main>

        <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-between gap-1 border border-[var(--app-border)] bg-[var(--app-surface)] p-2 md:hidden">
          {navItems.map(item => {
            const Icon = item.icon
            const active = activeView === item.view
            return (
              <button
                key={item.view}
                onClick={() => navigateTo(item.view)}
                className={`flex flex-1 flex-col items-center gap-1 border px-2 py-2 text-[11px] uppercase tracking-[0.08em] transition-colors ${
                  active ? 'border-[var(--accent-primary)] bg-[rgba(224,108,26,0.16)] text-[var(--app-text)]' : 'border-transparent text-[var(--app-muted)]'
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
            className="border border-[var(--app-border)] px-3 py-2 text-[var(--app-muted)]"
            aria-label="Cerrar sesión"
          >
            <UilSignOutAlt size={18} />
          </button>
        </nav>
      </div>
    </div>
  )
}
