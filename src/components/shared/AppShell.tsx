"use client"

import React, { useEffect, useState } from 'react'
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
import { AuthService, PlayerService } from '../../services/api'
import { useAuthStore } from '../../services/store'

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
  { icon: UilUsersAlt, label: 'Twin Match', view: 'twin-match' },
  { icon: UilUser, label: 'Perfil', view: 'profile' },
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
  const [nowPlaying, setNowPlaying] = useState<any>(null)

  useEffect(() => {
    PlayerService.getNowPlaying()
      .then(res => setNowPlaying(res))
      .catch((e) => console.warn("No playback available", e))
  }, [pathname]) // refresh on route changes

  function navigateTo(view: AppView) {
    if (view === 'feed') router.push('/feed')
    if (view === 'messages') router.push('/messages')
    if (view === 'twin-match') router.push('/twin-match')
    if (view === 'profile') router.push('/profile')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0e0e11] text-[#fff8ef] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(103, 232, 249,0.32),transparent_34%),radial-gradient(circle_at_80%_25%,rgba(255, 141, 137,0.22),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(103, 232, 249,0.2),transparent_35%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] pb-20 md:pb-0">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/5 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-[#22d3ee] to-[#67e8f9] text-slate-100 shadow-[0_0_24px_rgba(103, 232, 249,0.4)]">
              <UilHeadphones size={20} />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold tracking-[0.08em]">MusicTwins</p>
              <p className="text-[11px] uppercase tracking-[0.25em] text-[#67e8f9]/80">Audio Society</p>
            </div>
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

          <div className="mx-4 mb-4 rounded-md border border-[#67e8f9]/25 bg-black/25 p-4">
            <div className="mb-2 flex items-center gap-2 text-[#e5be85]">
              <UilMusic size={16} />
              <span className="text-xs uppercase tracking-[0.18em]">Escucha activa</span>
            </div>
            <p className="font-display text-sm text-white">{nowPlaying?.title || 'No playback activo'}</p>
            <p className="text-xs text-slate-300/70">{nowPlaying?.artist ? `${nowPlaying.artist} · ${nowPlaying.album}` : 'Esperando música'}</p>
            <div className="mt-3 flex h-4 items-end gap-1">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`eq-bar ${!nowPlaying ? 'animate-none h-1' : ''}`} style={{ animationDelay: `${i * 0.08}s` }} />
              ))}
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
        </aside>

        <main className="relative flex-1 overflow-y-auto">
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
