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
  const { user } = useAuthStore()

  useEffect(() => {
    // Solo info de cuenta, no necesitamos Spotify aquí por ahora según solicitud
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

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-3xl border border-white/12 bg-[#25252a]/70 p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-white">Detalles de la Cuenta</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#67e8f9]">ID de Usuario</p>
                <p className="mt-1 font-mono text-xs text-slate-300">{user?.userId || user?.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#67e8f9]">Correo Electrónico</p>
                <p className="mt-1 text-sm text-white">{user?.email || 'No proporcionado'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#67e8f9]">Proveedor de Identidad</p>
                <p className="mt-1 text-sm text-white">Spotify Social Auth</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#67e8f9]">Miembro desde</p>
                <p className="mt-1 text-sm text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Desconocido'}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-white/12 bg-[#1f1f23]/70 p-6">
            <h2 className="mb-4 font-display text-xl font-bold text-white">Estadísticas MusicTwins</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Match Score</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-2xl font-black text-white">Activo</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400">Estado</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-2xl border border-[#67e8f9]/20 bg-[#67e8f9]/5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Tu cuenta está vinculada correctamente. MusicTwins utiliza tus datos de escucha para conectarte con personas que comparten tu ADN musical.
              </p>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  )
}
