'use client'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { AuthService } from '@/features/auth/services/auth.service'

export default function LandingPage() {
  const router = useRouter()
  const viniloImage = '/assets/cd-disk-iconscout.png'

  const fadeUp = {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' },
    viewport: { once: true, amount: 0.2 },
  } as const

  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  } as const

  const artists = useMemo(
    () => [
      { rank: '01', name: 'Radiohead', minutes: '4,820 min', width: '85%', highlight: true },
      { rank: '02', name: 'Daft Punk', minutes: '3,140 min', width: '60%' },
      { rank: '03', name: 'Tame Impala', minutes: '2,900 min', width: '45%' },
    ],
    []
  )

  const genres = useMemo(
    () => [
      { label: 'SYNTH', value: '42%', color: 'text-[var(--accent-primary)]' },
      { label: 'LO-FI', value: '28%', color: 'text-[var(--app-text)]' },
      { label: 'JAZZ', value: '15%', color: 'text-[var(--app-muted)]' },
      { label: 'OTHER', value: '15%', color: 'text-[var(--app-muted)]' },
    ],
    []
  )

  const concerts = useMemo(
    () => [
      { date: '12 OCT', title: 'Primavera Sound', place: 'Barcelona, ES' },
      { date: '15 NOV', title: 'Desert Sessions', place: 'Joshua Tree, CA' },
    ],
    []
  )

  const collection = useMemo(
    () => [
      { title: 'Random Access Memories', artist: 'Daft Punk' },
      { title: 'In Rainbows', artist: 'Radiohead' },
      { title: 'Currents', artist: 'Tame Impala' },
    ],
    []
  )

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-app-background text-[var(--app-text)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_31px,rgba(240,237,230,0.04)_32px),linear-gradient(90deg,transparent_31px,rgba(240,237,230,0.04)_32px)] bg-[length:32px_32px]" />
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.18, 0.28, 0.18], scale: [1, 1.04, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-20 right-[-140px] h-[360px] w-[360px] rounded-full bg-[rgba(224,108,26,0.16)] blur-[100px]"
      />

      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-40 border-b border-[var(--app-border)] bg-[var(--app-bg)]/90 backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-[1536px] items-center justify-between px-6 py-5 md:px-12">
          <h1 className="font-display text-5xl leading-none tracking-tight text-[var(--app-text)]">
            Music<span className="text-[var(--accent-primary)]">Twins</span>
          </h1>

          <nav className="hidden items-center gap-8 text-sm uppercase tracking-[0.08em] text-[var(--app-muted)] md:flex">
            <a href="#plataforma" className="hover:text-[var(--accent-primary)]">The Platform</a>
            <a href="#features" className="hover:text-[var(--accent-primary)]">Features</a>
            <a href="#conecta" className="hover:text-[var(--accent-primary)]">Connect</a>
            <a href="#contacto" className="hover:text-[var(--accent-primary)]">Contact</a>
          </nav>

          <button
            onClick={() => AuthService.loginWithSpotify()}
            className="border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.14)] px-5 py-2 text-sm font-black uppercase tracking-[0.06em] text-[var(--app-text)] transition-colors hover:bg-[rgba(224,108,26,0.22)]"
          >
            Join the Pulse
          </button>
        </div>
      </motion.header>

      <section id="plataforma" className="relative mx-auto grid w-full max-w-[1536px] grid-cols-1 gap-10 px-6 pb-20 pt-8 md:grid-cols-2 md:gap-16 md:px-12 md:pt-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="order-2 flex flex-col items-start gap-6 md:order-1 md:pt-8"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} className="border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.12)] px-4 py-1 text-[10px] font-medium tracking-[0.24em] text-[var(--accent-primary)]">
            ARCHIVO SONORO PERSONAL
          </motion.div>

          <motion.h2 variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }} className="text-[64px] font-black leading-[0.9] tracking-[-0.04em] md:text-[110px] xl:text-[128px]">
            <span className="block">Tu</span>
            <span className="block">Identidad</span>
            <span className="block italic text-[var(--accent-primary)]">Musical</span>
          </motion.h2>

          <motion.p variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="max-w-xl text-base leading-relaxed text-[var(--app-muted)] md:text-lg">
            Descubre como suenas. Encuentra tus twins. Trasciende el algoritmo y revela tu ADN sonoro con estadisticas reales y conexiones humanas.
          </motion.p>

          <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-4">
            <motion.button
              onClick={() => AuthService.loginWithSpotify()}
              className="border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.14)] px-8 py-4 text-base font-black uppercase tracking-[0.06em] text-[var(--app-text)] hover:bg-[rgba(224,108,26,0.22)]"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Comenzar Ahora
            </motion.button>
          </motion.div>
        </motion.div>

        <motion.div {...fadeUp} className="order-1 flex items-center justify-center md:order-2">
          <div className="relative grid place-items-center">
            <div className="absolute h-[360px] w-[360px] rounded-full bg-[rgba(224,108,26,0.16)] blur-[90px] md:h-[480px] md:w-[480px]" />

            <motion.div
              animate={{ rotate: 360, y: [0, -8, 0] }}
              transition={{ rotate: { duration: 24, repeat: Infinity, ease: 'linear' }, y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' } }}
              className="relative z-10 h-[320px] w-[320px] rounded-full border border-[var(--app-border)] bg-[#050505] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.35)] md:h-[500px] md:w-[500px]"
            >
              <div className="relative h-full w-full rounded-full border border-white/5">
                <div className="absolute inset-[8%] rounded-full border border-white/5" />
                <div className="absolute inset-[18%] rounded-full border border-white/5" />
                <div className="absolute inset-[30%] rounded-full border border-white/5" />
                <div className="absolute inset-[34%] overflow-hidden rounded-full border-4 border-[#0e0e11]">
                  <img src={viniloImage} alt="Music Identity Cover" className="h-full w-full object-cover" />
                </div>
              </div>
            </motion.div>

            <div className="absolute right-[-4px] top-[-16px] h-[190px] w-[12px] rotate-12 rounded-full bg-[var(--app-surface)] md:right-[-18px] md:h-[256px] md:w-[16px]" />
          </div>
        </motion.div>
      </section>

      <motion.section {...fadeUp} id="features" className="mx-auto flex w-full max-w-[1536px] flex-col gap-12 px-6 py-20 md:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.3em] text-[var(--accent-primary)]">VISUALIZACION DE DATOS</p>
            <h3 className="mt-2 text-4xl font-black tracking-[-0.03em] md:text-5xl">Tu Pulso en Numeros.</h3>
          </div>
          <p className="max-w-sm text-right text-xs tracking-[0.12em] text-[var(--app-muted)] md:text-sm">
            METRICAS DE FIDELIDAD ULTRA-ALTA PARA COLECCIONISTAS DE MOMENTOS.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <motion.article whileHover={{ y: -4 }} className="rounded-xl border border-white/10 bg-[#1f1f23]/70 p-6 md:col-span-8">
            <p className="text-xs tracking-[0.2em] text-white/50">ARTISTAS MAS ESCUCHADOS</p>
            <div className="mt-6 space-y-5">
              {artists.map((artist) => (
                <motion.div key={artist.rank} className="flex items-center gap-4" initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
                  <span className={artist.highlight ? 'w-12 text-4xl font-black italic text-[var(--accent-primary)]' : 'w-12 text-4xl font-black text-white/20'}>{artist.rank}</span>
                  <div className="flex-1">
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold">{artist.name}</p>
                      <p className="text-sm text-[var(--accent-primary)]">{artist.minutes}</p>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-[#131316]">
                      <motion.div
                        className="h-full rounded-full bg-[var(--accent-primary)]"
                        initial={{ width: 0 }}
                        whileInView={{ width: artist.width }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.article>

          <motion.article whileHover={{ y: -4, scale: 1.01 }} className="rounded-xl border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.12)] p-6 text-[var(--app-text)] md:col-span-4">
            <p className="text-xs font-bold tracking-[0.2em]">TIEMPO TOTAL</p>
            <p className="mt-4 text-6xl font-black leading-none">52k+</p>
            <p className="mt-2 text-sm font-medium tracking-[0.1em]">MINUTOS DE PURA EUFORIA</p>
            <p className="mt-8 text-xs font-medium">ACTUALIZADO HACE 2 MIN</p>
          </motion.article>

          <motion.article whileHover={{ y: -4 }} className="rounded-xl border border-white/10 bg-[#1f1f23]/70 p-6 md:col-span-4">
            <p className="text-xs tracking-[0.2em] text-white/50">ADN DE GENERO</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {genres.map((genre) => (
                <motion.div key={genre.label} whileHover={{ scale: 1.03 }} className="rounded-lg bg-[#1a1a1f] p-4">
                  <p className={`text-xs font-medium ${genre.color}`}>{genre.label}</p>
                  <p className="mt-1 text-2xl font-bold">{genre.value}</p>
                </motion.div>
              ))}
            </div>
          </motion.article>

          <motion.article whileHover={{ y: -4 }} className="relative overflow-hidden rounded-xl border border-white/10 bg-[#1f1f23]/70 p-6 md:col-span-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,141,137,0.18),transparent_45%)]" />
            <div className="relative">
              <p className="text-xs tracking-[0.3em] text-[var(--accent-primary)]">LIVE EXPERIENCE</p>
              <h4 className="mt-2 text-3xl font-black">Proximos Conciertos</h4>
              <div className="mt-5 flex flex-wrap gap-4">
                {concerts.map((concert) => (
                  <motion.div key={concert.title} whileHover={{ y: -3 }} className="min-w-[190px] rounded-lg border border-white/10 bg-[#25252a]/70 p-4">
                    <p className="text-xs text-[var(--accent-primary)]">{concert.date}</p>
                    <p className="mt-1 font-bold">{concert.title}</p>
                    <p className="text-xs text-white/45">{concert.place}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.article>
        </div>
      </motion.section>

      <motion.section {...fadeUp} id="conecta" className="bg-[#131316] py-24">
        <div className="mx-auto grid w-full max-w-[1536px] grid-cols-1 items-center gap-16 px-6 md:grid-cols-2 md:px-12">
          <motion.div whileHover={{ y: -4 }} className="mx-auto w-full max-w-md rounded-[36px] border border-white/10 bg-[#1f1f23]/70 p-6">
            <div className="flex items-center justify-between">
              <h5 className="text-lg font-bold">Actividad</h5>
              <span className="h-1 w-4 rounded-full bg-white/30" />
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-black/20 p-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-rose-400/60" />
                <div>
                  <p className="text-sm">Empezaste a escuchar New Moon</p>
                  <p className="text-xs text-white/45">Now Playing</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-black/20 p-3">
                <div className="mt-1 h-8 w-8 rounded-full bg-cyan-400/60" />
                <div>
                  <p className="text-sm">Match con tu twin musical</p>
                  <p className="text-xs text-white/45">Hace 3 min</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <p className="text-xs tracking-[0.3em] text-[var(--accent-primary)]">SOCIAL EXPERIENCE</p>
            <h5 className="mt-2 text-5xl font-black leading-tight">
              Musica que nos <span className="text-[var(--accent-primary)] italic">Une.</span>
            </h5>
            <p className="mt-6 max-w-xl text-[var(--app-muted)]">
              Encuentra a tu MusicTwins, comparte historias musicales y crea playlists colaborativas que son bandas sonoras para tu tribu.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" /> Twin Matchmaking System</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--app-text)]" /> Instant Share Vibe Cards</li>
            </ul>
          </div>
        </div>
      </motion.section>

      <motion.section {...fadeUp} className="mx-auto w-full max-w-[1536px] px-6 py-24 md:px-12">
        <p className="text-xs tracking-[0.3em] text-[var(--accent-primary)]">YOUR VINYL ARCHIVE</p>
        <h5 className="mt-2 text-5xl font-black">Tu Coleccion <span className="italic text-[var(--accent-primary)]">Digital.</span></h5>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {collection.map((item) => (
            <motion.article key={item.title} whileHover={{ y: -5 }} className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/20 bg-black">
                  <img src={viniloImage} alt={`Vinilo ${item.title}`} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h6 className="text-lg font-bold leading-tight">{item.title}</h6>
                  <p className="text-sm text-[var(--app-muted)]">{item.artist}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeUp} id="contacto" className="mx-auto flex w-full max-w-[1536px] flex-col items-center px-6 pb-24 pt-4 text-center md:px-12">
        <h5 className="text-5xl font-black leading-tight md:text-7xl">
          Listo para el <span className="text-[var(--accent-primary)]">Ritmo?</span>
        </h5>
        <p className="mt-6 max-w-xl text-[var(--app-muted)]">Unete a la comunidad de melomanos mas avanzada del mundo.</p>
        <motion.button
          onClick={() => AuthService.loginWithSpotify()}
          className="mt-10 border border-[var(--accent-primary)] bg-[rgba(224,108,26,0.14)] px-9 py-4 text-base font-black uppercase tracking-[0.06em] text-[var(--app-text)]"
          whileHover={{ y: -3, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Crear Mi Perfil
        </motion.button>
      </motion.section>

      <footer className="border-t border-white/10 px-6 py-6 text-xs text-[#7d7d85] md:px-12">
        <div className="mx-auto flex w-full max-w-[1536px] flex-wrap items-center justify-between gap-3">
          <p className="font-black text-[var(--accent-primary)]">MusicTwins</p>
          <p>hello@musictwins.com</p>
          <p>2026 ALL RIGHTS RESERVED</p>
        </div>
        <p className="mx-auto mt-3 w-full max-w-[1536px] text-[11px] text-[#6f6f78]">
          CD Disk icon by{' '}
          <a href="https://iconscout.com/contributors/ilustroflat" target="_blank" rel="noreferrer" className="text-[#a0a0ac] underline-offset-2 hover:underline">
            ilustroflat
          </a>{' '}
          from{' '}
          <a href="https://iconscout.com/icons/cd-disk" target="_blank" rel="noreferrer" className="text-[#a0a0ac] underline-offset-2 hover:underline">
            IconScout
          </a>
          .
        </p>
      </footer>
    </main>
  )
}
