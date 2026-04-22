"use client"

import { useState, useEffect } from 'react'
import { UilBell, UilMusic, UilFavorite } from '@iconscout/react-unicons'
import AppShell from '@/core/components/AppShell'
import { useAuthStore } from '@/core/store/auth.store'
import { SpotifyProfileService } from '@/features/profile/services/profile.service'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-[#25252a]/70 p-4">
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
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? 'bg-[#67e8f9]' : 'bg-white/20'}`}
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
  const [realRecent, setRealRecent] = useState<any[]>([])
  const [topTracks, setTopTracks] = useState<any[]>([])

  useEffect(() => {
    SpotifyProfileService.getRecentTracks(15)
      .then(res => {
         const data = res?.items || res?.data || res || [];
         if (Array.isArray(data)) setRealRecent(data);
      })
      .catch(e => console.warn(e));

    SpotifyProfileService.getTopTracks(10)
      .then(res => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        setTopTracks(data);
      })
      .catch(e => console.warn(e));
  }, [])

  const displayName = user?.displayName || 'Usuario '
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 md:px-6 md:py-8">
        <section className="rounded-3xl border border-white/12 bg-[#1f1f23]/70 p-5 md:p-6">
          <div className="flex flex-wrap items-start gap-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-20 w-20 rounded-3xl object-cover shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[#22d3ee]/70 to-[#67e8f9]/35 text-white font-display text-3xl font-bold">
                {initial}
              </div>
            )}
            <div className="min-w-[250px] flex-1">
              <h1 className="font-display text-3xl font-black text-white">{displayName}</h1>
              <p className="text-sm text-slate-300/75">{user?.email || 'Cuenta Vinculada'} · Spotify Linked</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#ff8d89]/30 bg-[#22d3ee]/30 px-3 py-1 text-xs text-[#fff8ef]">Cuenta Oficial</span>
              </div>
            </div>

            <button className="rounded-2xl border border-white/20 px-4 py-2 text-sm text-slate-100 transition-colors hover:bg-white/10">
              Editar perfil
            </button>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr]">
          <div className="space-y-4">
            <article className="rounded-3xl border border-white/12 bg-[#25252a]/70 p-5">
              <div className="mb-4 inline-flex items-center gap-2 text-[#e5be85]">
                <UilMusic size={16} />
                <p className="text-xs uppercase tracking-[0.16em]">Reciente de Spotify</p>
              </div>
              <div className="space-y-2.5">
                {realRecent.map((trackObj, idx) => {
                   const track = trackObj?.track || trackObj;
                   return (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#22d3ee]/35 text-[#fff8ef]">
                      <UilMusic size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{track?.name || 'Unknown Track'}</p>
                      <p className="text-xs text-slate-300/65">{track?.artists?.[0]?.name || 'Spotify Session'}</p>
                    </div>
                  </div>
                )})}
                {realRecent.length === 0 && <p className="text-sm text-slate-400">Aún no hay reproducciones recientes.</p>}
              </div>
            </article>

            <article className="rounded-3xl border border-white/12 bg-[#1f1f23]/70 p-5">
              <div className="mb-4 inline-flex items-center gap-2 text-[#67e8f9]">
                <UilFavorite size={16} />
                <p className="text-xs uppercase tracking-[0.16em]">Tus favoritas (Top Spotify)</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {topTracks.map((track, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <img 
                      src={track.imageUrl || '/song-placeholder.png'} 
                      alt={track.name} 
                      className="h-10 w-10 rounded-lg object-cover" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{track.name}</p>
                      <p className="truncate text-xs text-slate-300/65">{track.artist}</p>
                    </div>
                  </div>
                ))}
                {topTracks.length === 0 && <p className="text-sm text-slate-400">Sin datos de favoritos aún.</p>}
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-white/12 bg-[#1f1f23]/70 p-5">
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
