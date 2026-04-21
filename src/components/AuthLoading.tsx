"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { UilMusic, UilSpinnerAlt } from '@iconscout/react-unicons'
import { AuthService } from '../services/api'
import { useAuthStore } from '../services/store'

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

        const user = await AuthService.getProfile()
        if (!isMounted) return

        setStepIndex(2)
        setProgress(60)

        if (user) {
          setUser(user)
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app-background px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_22%,rgba(120,22,53,0.42),transparent_30%),radial-gradient(circle_at_78%_20%,rgba(228,80,74,0.26),transparent_28%),radial-gradient(circle_at_50%_90%,rgba(212,162,89,0.2),transparent_35%)]" />

      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/12 bg-slate-950/35 p-6 text-slate-100 shadow-[0_20px_55px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8">
        <div className="mb-6 flex items-center justify-center">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#781635] via-[#e4504a] to-[#d4a259] text-slate-950 shadow-[0_10px_30px_rgba(244,114,182,0.45)]">
            <UilMusic size={30} />
          </div>
        </div>

        <h1 className="text-center font-display text-3xl font-black text-white">MusicTwins</h1>
        <p className="mt-2 text-center text-sm text-slate-300/75">Preparando un feed unico para tu perfil sonoro</p>

        <div className="mt-8 space-y-4">
          <div className="overflow-hidden rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#781635] via-[#e4504a] to-[#d4a259] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-300/65">
            <span>{Math.round(progress)}%</span>
            <span>{steps.length} etapas</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-[#f2cab4]">
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
    <Suspense fallback={<div className="min-h-screen bg-app-background" />}>
      <AuthLoadingContent />
    </Suspense>
  )
}
