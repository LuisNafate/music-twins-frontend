import { useEffect, useState } from 'react'

const SPOTIFY_GREEN = '#1DB954'

interface AuthLoadingProps {
  onComplete: () => void
}

const steps = [
  'Conectando con Spotify...',
  'Analizando tu biblioteca musical...',
  'Calculando tu perfil de escucha...',
  'Buscando tus Music Twins...',
]

const waveHeights = [24, 40, 56, 40, 24, 40, 56, 32, 48, 40, 28, 44, 52, 36, 24]

export default function AuthLoading({ onComplete }: AuthLoadingProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const total = 3000 // ms total
    const tick = 40   // ms per tick
    let elapsed = 0
    let stepTimer = 0

    const interval = setInterval(() => {
      elapsed += tick
      stepTimer += tick
      setProgress(Math.min((elapsed / total) * 100, 100))

      if (stepTimer >= total / steps.length) {
        stepTimer = 0
        setStepIndex(prev => Math.min(prev + 1, steps.length - 1))
      }

      if (elapsed >= total) {
        clearInterval(interval)
        setTimeout(onComplete, 300)
      }
    }, tick)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex flex-col items-center justify-center gap-10 px-6 animate-fade-in">
      {/* Spotify logo animado */}
      <div className="flex flex-col items-center gap-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-ring"
          style={{ backgroundColor: SPOTIFY_GREEN + '22', border: `2px solid ${SPOTIFY_GREEN}44` }}
        >
          <svg viewBox="0 0 24 24" className="w-10 h-10" fill={SPOTIFY_GREEN}>
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            MusicTwins
          </h1>
          <p className="text-slate-400 text-sm">Preparando tu experiencia</p>
        </div>
      </div>

      {/* Visualizador de onda */}
      <div className="flex items-end gap-[3px] h-16">
        {waveHeights.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full"
            style={{
              height: `${h}px`,
              backgroundColor: '#a855f7',
              opacity: 0.4 + (i % 3) * 0.2,
              animation: `wave-bar ${0.6 + (i % 5) * 0.15}s ease-in-out infinite`,
              animationDelay: `${i * 0.06}s`,
              transformOrigin: 'bottom',
            }}
          />
        ))}
      </div>

      {/* Paso actual */}
      <div className="text-center space-y-4">
        <p
          key={stepIndex}
          className="text-slate-300 text-[15px] animate-fade-in-up"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {steps[stepIndex]}
        </p>

        {/* Barra de progreso */}
        <div className="w-64 h-1 bg-[#2a2a35] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
            }}
          />
        </div>

        {/* Steps dots */}
        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: i <= stepIndex ? '#a855f7' : '#2a2a35' }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
