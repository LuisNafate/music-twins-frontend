"use client"

import { useState, useEffect } from 'react'
import { UilBell, UilMusic, UilFavorite } from '@iconscout/react-unicons'
import AppShell from '@/core/components/AppShell'
import { useAuthStore } from '@/core/store/auth.store'
import { SpotifyProfileService } from '@/features/profile/services/profile.service'

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
      <p className="font-display text-[clamp(1.4rem,1.2rem+0.8vw,2rem)] font-black uppercase text-[var(--app-text)]">{value}</p>
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--app-muted)]">{label}</p>
      {sub && <p className="mt-1 text-xs text-[var(--accent-primary)]">{sub}</p>}
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
        <p className="text-sm font-medium text-[var(--app-text)]">{label}</p>
        <p className="text-xs text-[var(--app-muted)]">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative h-6 w-11 border border-[var(--app-border)] transition-colors ${value ? 'bg-[rgba(224,108,26,0.2)]' : 'bg-[var(--app-bg)]'}`}
      >
        <span className={`absolute top-1 h-4 w-4 bg-[var(--app-text)] transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
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
        <section className="border border-[var(--app-border)] bg-[var(--app-surface)] p-5 md:p-6">
          <div className="flex flex-wrap items-start gap-4">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="h-20 w-20 border border-[var(--app-border)] object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center border border-[var(--app-border)] bg-[var(--app-surface-2)] font-display text-3xl font-bold text-[var(--app-text)]">
                {initial}
              </div>
            )}
            <div className="min-w-[250px] flex-1">
              <h1 className="type-page font-display font-black uppercase leading-none text-[var(--app-text)]">{displayName}</h1>
              <p className="text-sm text-[var(--app-muted)]">{user?.email || 'Cuenta Vinculada'} · Spotify Linked</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.14)] px-3 py-1 text-xs uppercase text-[var(--app-text)]">Cuenta Oficial</span>
              </div>
            </div>

            <button className="border border-[var(--app-border)] px-4 py-2 text-sm uppercase tracking-[0.05em] text-[var(--app-text)] transition-colors hover:border-[var(--accent-primary)] hover:bg-[rgba(224,108,26,0.1)]">
              Editar perfil
            </button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <h2 className="type-section mb-4 font-display font-bold uppercase text-[var(--app-text)]">Detalles de la Cuenta</h2>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)]">ID de Usuario</p>
                <p className="mt-1 text-xs text-[var(--app-text)]">{user?.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)]">Correo Electrónico</p>
                <p className="mt-1 text-sm text-[var(--app-text)]">{user?.email || 'No proporcionado'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)]">Proveedor de Identidad</p>
                <p className="mt-1 text-sm text-[var(--app-text)]">Spotify Social Auth</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-primary)]">Miembro desde</p>
                <p className="mt-1 text-sm text-[var(--app-text)]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Desconocido'}</p>
              </div>
            </div>
          </article>

          <article className="border border-[var(--app-border)] bg-[var(--app-surface)] p-6">
            <h2 className="type-section mb-4 font-display font-bold uppercase text-[var(--app-text)]">Estadísticas MusicTwins</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                <p className="text-2xl font-black text-[var(--app-text)]">100%</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--app-muted)]">Match Score</p>
              </div>
              <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                <p className="text-2xl font-black text-[var(--app-text)]">Activo</p>
                <p className="text-[10px] uppercase tracking-widest text-[var(--app-muted)]">Estado</p>
              </div>
            </div>
            <div className="mt-6 border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
              <p className="text-xs leading-relaxed text-[var(--app-muted)]">
                Tu cuenta está vinculada correctamente. MusicTwins utiliza tus datos de escucha para conectarte con personas que comparten tu ADN musical.
              </p>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  )
}
