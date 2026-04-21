"use client"

import { useState } from 'react'
import { UilBell, UilChartLine, UilFire, UilMusic, UilShieldCheck, UilStar, UilUser } from '@iconscout/react-unicons'
import AppShell from './shared/AppShell'
import { useAuthStore } from '../services/store'

const topArtists = [
  { name: 'M83', genre: 'Synthwave', plays: 348 },
  { name: 'Tame Impala', genre: 'Psychedelic', plays: 290 },
  { name: 'Bon Iver', genre: 'Folk', plays: 241 },
  { name: 'Radiohead', genre: 'Alt Rock', plays: 198 },
  { name: 'The National', genre: 'Indie Rock', plays: 177 },
]

const recentTracks = [
  { title: 'Midnight City', artist: 'M83', time: 'Hace 5 min' },
  { title: 'Let It Happen', artist: 'Tame Impala', time: 'Hace 22 min' },
  { title: 'Holocene', artist: 'Bon Iver', time: 'Hace 1h' },
  { title: 'Fake Plastic Trees', artist: 'Radiohead', time: 'Hace 2h' },
]

const badges = [
  { icon: UilMusic, label: 'Oyente compulsivo', desc: '+1000h escuchadas' },
  { icon: UilStar, label: 'Twin Finder', desc: '5+ matches perfectos' },
  { icon: UilFire, label: 'Racha de 30 dias', desc: '30 dias consecutivos' },
  { icon: UilShieldCheck, label: 'Perfil verificado', desc: 'Actividad saludable' },
]

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
      <p className="font-display text-2xl font-black text-white">{value}</p>
      <p className="text-xs uppercase tracking-[0.12em] text-slate-300/65">{label}</p>
      {sub && <p className="mt-1 text-xs text-[#e5be85]">{sub}</p>}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm font-medium text-slate-100">{label}</p>
        <p className="text-xs text-slate-300/65">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-[#d4a259]' : 'bg-white/20'}`}
      >
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function Profile() {
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [shareEnabled, setShareEnabled] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)
  const { user } = useAuthStore()

  const displayName = user?.username || 'Luis Navarro'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 md:px-6 md:py-8">
        <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5 md:p-6">
          <div className="flex flex-wrap items-start gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[#781635]/70 to-[#d4a259]/35 text-white font-display text-3xl font-bold">
              {initial}
            </div>
            <div className="min-w-[250px] flex-1">
              <h1 className="font-display text-3xl font-black text-white">{displayName}</h1>
              <p className="text-sm text-slate-300/75">@{user?.username?.toLowerCase() || 'luisnavarro'} · Mexico</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#e7b18f]/30 bg-[#781635]/30 px-3 py-1 text-xs text-[#f7e2d5]">Oyente premium</span>
                <span className="rounded-full border border-[#d4a259]/30 bg-[#d4a259]/25 px-3 py-1 text-xs text-[#f2dec2]">Nivel 12</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200/80">
                <span><strong className="text-white">47</strong> amigos</span>
                <span><strong className="text-white">12</strong> twins</span>
                <span><strong className="text-white">823</strong> canciones compartidas</span>
              </div>
            </div>

            <button className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate-100 transition-colors hover:bg-white/10">
              Editar perfil
            </button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Horas escuchadas" value="1,248h" sub="Este ano" />
          <StatCard label="Twin matches" value="12" sub="3 nuevos" />
          <StatCard label="Genero favorito" value="Indie" />
          <StatCard label="Streak" value="30" sub="dias" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl border border-white/12 bg-white/[0.04] p-5">
            <div className="mb-4 inline-flex items-center gap-2 text-[#f0b7a9]">
              <UilChartLine size={16} />
              <p className="text-xs uppercase tracking-[0.16em]">Top artistas</p>
            </div>

            <div className="space-y-2.5">
              {topArtists.map((artist, index) => (
                <div key={artist.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                  <span className="w-5 text-right text-xs text-slate-300/65">{index + 1}</span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#781635]/30 to-[#d4a259]/30 text-xs font-bold text-white">
                    {artist.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{artist.name}</p>
                    <p className="text-xs text-slate-300/65">{artist.genre}</p>
                  </div>
                  <span className="text-xs text-slate-200/75">{artist.plays}</span>
                </div>
              ))}
            </div>
          </article>

          <div className="space-y-4">
            <article className="rounded-3xl border border-white/12 bg-white/[0.04] p-5">
              <div className="mb-4 inline-flex items-center gap-2 text-[#e5be85]">
                <UilMusic size={16} />
                <p className="text-xs uppercase tracking-[0.16em]">Reciente</p>
              </div>
              <div className="space-y-2.5">
                {recentTracks.map(track => (
                  <div key={track.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#781635]/35 text-[#f7e2d5]">
                      <UilMusic size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                      <p className="text-xs text-slate-300/65">{track.artist}</p>
                    </div>
                    <span className="text-xs text-slate-300/65">{track.time}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/12 bg-white/[0.04] p-5">
              <div className="mb-4 inline-flex items-center gap-2 text-[#f2cab4]">
                <UilStar size={16} />
                <p className="text-xs uppercase tracking-[0.16em]">Insignias</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {badges.map(badge => {
                  const Icon = badge.icon
                  return (
                    <div key={badge.label} className="rounded-2xl border border-white/12 bg-white/5 p-3">
                      <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#781635]/30 to-[#d4a259]/30 text-[#f7e2d5]">
                        <Icon size={15} />
                      </span>
                      <p className="text-xs font-semibold text-white">{badge.label}</p>
                      <p className="text-xs text-slate-300/65">{badge.desc}</p>
                    </div>
                  )
                })}
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-white/12 bg-slate-950/35 p-5">
          <div className="mb-3 inline-flex items-center gap-2 text-amber-200">
            <UilBell size={16} />
            <p className="text-xs uppercase tracking-[0.16em]">Configuracion</p>
          </div>

          <div className="divide-y divide-white/10">
            <ToggleRow
              label="Notificaciones de nuevos twins"
              description="Recibe alertas cuando aparezcan coincidencias relevantes"
              value={notifEnabled}
              onChange={setNotifEnabled}
            />
            <ToggleRow
              label="Compartir historial de escucha"
              description="Tus amigos pueden ver tu actividad reciente"
              value={shareEnabled}
              onChange={setShareEnabled}
            />
            <ToggleRow
              label="Perfil publico"
              description="Cualquier usuario puede descubrir tu perfil musical"
              value={publicProfile}
              onChange={setPublicProfile}
            />
          </div>
        </section>
      </div>
    </AppShell>
  )
}
