import { useState } from 'react'
import AppShell, { type AppView } from './shared/AppShell'

const imgAlex   = 'http://localhost:3845/assets/f8f64cf3a1b2c3d4e5f6a7b8c9d0e1f2.png'
const imgSarah  = 'http://localhost:3845/assets/3d312615b2c3d4e5f6a7b8c9d0e1f2a3.png'
const imgJordan = 'http://localhost:3845/assets/c7213871c3d4e5f6a7b8c9d0e1f2a3b4.png'

interface MessagesProps {
  activeView: AppView
  onNavigate: (v: AppView) => void
  onLogout: () => void
}

type MsgType = 'text' | 'song'

interface Message {
  id: number
  from: 'me' | 'them'
  type: MsgType
  text?: string
  song?: { title: string; artist: string; cover: string }
  time: string
}

interface Conversation {
  id: number
  name: string
  avatar: string
  online: boolean
  lastMsg: string
  time: string
  unread: number
  messages: Message[]
}

const SONG_COVERS = [
  'http://localhost:3845/assets/23a32f17d4e5f6a7b8c9d0e1f2a3b4c5.png',
  'http://localhost:3845/assets/3de8b74de5f6a7b8c9d0e1f2a3b4c5d6.png',
]

const conversations: Conversation[] = [
  {
    id: 1,
    name: 'Alex Rivera',
    avatar: imgAlex,
    online: true,
    lastMsg: '¿Escuchaste lo nuevo de M83?',
    time: '2m',
    unread: 2,
    messages: [
      { id: 1,  from: 'them', type: 'text', text: 'Oye! vi tu feed', time: '12:30' },
      { id: 2,  from: 'me',   type: 'text', text: 'Sí! Qué buen día para música', time: '12:31' },
      { id: 3,  from: 'them', type: 'song', song: { title: 'Midnight City', artist: 'M83', cover: SONG_COVERS[0] }, time: '12:32' },
      { id: 4,  from: 'them', type: 'text', text: '¿Escuchaste lo nuevo de M83?', time: '12:33' },
    ],
  },
  {
    id: 2,
    name: 'Sarah Chen',
    avatar: imgSarah,
    online: false,
    lastMsg: 'Me encantó esa canción 🎵',
    time: '1h',
    unread: 0,
    messages: [
      { id: 1, from: 'me',   type: 'song', song: { title: 'Levitating', artist: 'Dua Lipa', cover: SONG_COVERS[1] }, time: '11:10' },
      { id: 2, from: 'them', type: 'text', text: 'Me encantó esa canción 🎵', time: '11:15' },
    ],
  },
  {
    id: 3,
    name: 'Jordan Smith',
    avatar: imgJordan,
    online: true,
    lastMsg: 'Let\'s make a playlist!',
    time: '3h',
    unread: 1,
    messages: [
      { id: 1, from: 'them', type: 'text', text: "Let's make a playlist!", time: '09:00' },
    ],
  },
]

function Avatar({ src, name, online, size = 10 }: { src: string; name: string; online: boolean; size?: number }) {
  return (
    <div className="relative flex-shrink-0">
      <img
        src={src} alt={name}
        className={`w-${size} h-${size} rounded-full object-cover bg-[#2a2a35]`}
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
        onError={e => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e2e&color=a855f7&size=80`
        }}
      />
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#141418] animate-pulse-ring" />
      )}
    </div>
  )
}

function SongCard({ song }: { song: NonNullable<Message['song']> }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="flex items-center gap-3 bg-[#1a1a22] border border-[#2a2a35] rounded-xl p-3 max-w-[260px]">
      <img
        src={song.cover} alt={song.title}
        className="w-10 h-10 rounded-lg object-cover bg-[#2a2a35] flex-shrink-0"
        onError={e => { (e.target as HTMLImageElement).style.background = '#2a2a35' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{song.title}</p>
        <p className="text-xs text-slate-500 truncate">{song.artist}</p>
      </div>
      <button
        onClick={() => setPlaying(p => !p)}
        className="w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        {playing ? (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        ) : (
          <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
      </button>
    </div>
  )
}

export default function Messages({ activeView, onNavigate, onLogout }: MessagesProps) {
  const [activeConv, setActiveConv] = useState(conversations[0])
  const [input, setInput] = useState('')
  const [convs, setConvs] = useState(conversations)

  function sendMessage() {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now(),
      from: 'me',
      type: 'text',
      text: input.trim(),
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    }
    setConvs(prev =>
      prev.map(c =>
        c.id === activeConv.id
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: newMsg.text ?? '' }
          : c
      )
    )
    setActiveConv(prev => ({ ...prev, messages: [...prev.messages, newMsg] }))
    setInput('')
  }

  return (
    <AppShell activeView={activeView} onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex h-full">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 border-r border-[#2a2a35] h-full flex flex-col">
          <div className="p-4 border-b border-[#2a2a35]">
            <h2 className="text-lg font-bold text-slate-100 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Mensajes
            </h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                className="w-full bg-[#1a1a22] border border-[#2a2a35] rounded-xl pl-9 pr-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                placeholder="Buscar conversación..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convs.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setActiveConv(c)}
                className={`w-full flex items-center gap-3 p-4 border-b border-[#1a1a22] transition-all duration-150 text-left animate-fade-in-up stagger-${i + 1} ${
                  activeConv.id === c.id ? 'bg-purple-500/10' : 'hover:bg-white/3'
                }`}
              >
                <Avatar src={c.avatar} name={c.name} online={c.online} size={10} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-sm font-semibold text-slate-200 truncate">{c.name}</span>
                    <span className="text-xs text-slate-600 flex-shrink-0 ml-2">{c.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat thread */}
        <div className="flex-1 flex flex-col h-full">
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-[#2a2a35] bg-[#0f0f13]">
            <Avatar src={activeConv.avatar} name={activeConv.name} online={activeConv.online} size={9} />
            <div>
              <h3 className="text-sm font-semibold text-slate-200">{activeConv.name}</h3>
              <p className="text-xs text-slate-500">{activeConv.online ? 'En línea' : 'Desconectado'}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-purple-400 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConv.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[70%] ${msg.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.type === 'song' && msg.song ? (
                    <SongCard song={msg.song} />
                  ) : (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'me'
                          ? 'bg-purple-600 text-white rounded-tr-sm'
                          : 'bg-[#1e1e2a] text-slate-200 border border-[#2a2a35] rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}
                  <span className="text-xs text-slate-600">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#2a2a35] bg-[#0f0f13]">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-white/5 text-slate-500 hover:text-purple-400 transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-[#1a1a22] border border-[#2a2a35] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
