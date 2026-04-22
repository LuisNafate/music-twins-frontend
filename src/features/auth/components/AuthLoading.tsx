"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UilMusic, UilSpinnerAlt } from '@iconscout/react-unicons'
import { AuthService } from '@/features/auth/services/auth.service'
import { useAuthStore } from '@/core/store/auth.store'

const steps = [
  'Conectando con Spotify',
  'Procesando patrones de escucha',
  'Calculando afinidades musicales',
  'Activando tu espacio social',
]

function AuthLoadingContent() {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setAuthenticated } = useAuthStore()

  useEffect(() => {
    let isMounted = true

    async function handleAuth() {
      try {
        const token = searchParams.get('token')
        if (token) {
          localStorage.setItem('access_token', token)
          window.history.replaceState({}, document.title, '/auth-loading')
        }

        setStepIndex(1)
        setProgress(30)

        const rawRes = await AuthService.getProfile()
        if (!isMounted) return

        setStepIndex(2)
        setProgress(60)

        const u = (rawRes as any)?.user || (rawRes as any)?.data || rawRes;
        if (u) {
          setUser(u)
          setAuthenticated(true)
        }

        setTimeout(() => {
          if (!isMounted) return
          setStepIndex(3)
          setProgress(100)
          setTimeout(() => router.push('/feed'), 600)
        }, 800)

      } catch (error) {
        console.error('Session failed:', error)
        if (isMounted) router.push('/')
      }
    }

    handleAuth()

    return () => {
      isMounted = false
    }
  }, [router, searchParams, setUser, setAuthenticated])

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-background px-4 py-8 text-[var(--app-text)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_31px,rgba(240,237,230,0.04)_32px),linear-gradient(90deg,transparent_31px,rgba(240,237,230,0.04)_32px)] bg-[length:32px_32px]" />

      <section className="relative w-full max-w-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-text)] md:p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="grid h-16 w-16 place-items-center border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.12)] text-[var(--app-text)]">
            <UilMusic size={30} />
          </div>
        </div>

        <h1 className="type-page text-center font-display font-black uppercase leading-none text-[var(--app-text)]">MusicTwins</h1>
        <p className="mt-2 text-center text-sm text-[var(--app-muted)]">Preparando un feed unico para tu perfil sonoro</p>

        <div className="mt-8 space-y-4">
          <div className="overflow-hidden border border-[var(--app-border)] bg-[var(--app-bg)]">
            <div
              className="h-2 bg-[var(--accent-primary)] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--app-muted)]">
            <span>{Math.round(progress)}%</span>
            <span>{steps.length} etapas</span>
          </div>

          <div className="border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-primary)]">
              <UilSpinnerAlt size={16} className="animate-spin" />
              <span className="text-sm font-medium">{steps[stepIndex]}...</span>
            </div>

            <div className="mt-4 flex h-10 items-end gap-1">
              {Array.from({ length: 16 }).map((_, index) => (
                <span
                  key={index}
                  className="eq-bar"
                  style={{
                    height: `${8 + (index % 5) * 6}px`,
                    animationDelay: `${index * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function AuthLoading() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]" />}>
      <AuthLoadingContent />
    </Suspense>
  )
}
