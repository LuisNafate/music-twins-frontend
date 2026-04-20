"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UilLocationArrow,
  UilMessage,
  UilMusic,
  UilPlay,
  UilSearch,
  UilUserCircle,
} from '@iconscout/react-unicons'
import AppShell from './shared/AppShell'

type MsgType = 'text' | 'song'

interface Message {
  id: number
  from: 'me' | 'them'
  type: MsgType
  text?: string
  song?: { title: string; artist: string }
  time: string
}

interface Conversation {
  id: number
  name: string
  online: boolean
  lastMsg: string
  time: string
  unread: number
  messages: Message[]
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: 'Alex Rivera',
    online: true,
    lastMsg: 'Escucha esta version de M83',
    time: '2m',
    unread: 2,
    messages: [
      { id: 1, from: 'them', type: 'text', text: 'Oye, vi tu feed de hoy', time: '12:30' },
      { id: 2, from: 'me', type: 'text', text: 'Fue una buena sesion nocturna', time: '12:31' },
      { id: 3, from: 'them', type: 'song', song: { title: 'Midnight City', artist: 'M83' }, time: '12:32' },
      { id: 4, from: 'them', type: 'text', text: 'Escucha esta version de M83', time: '12:33' },
    ],
  },
  {
    id: 2,
    name: 'Sarah Chen',
    online: false,
    lastMsg: 'Me encanto ese track',
    time: '1h',
    unread: 0,
    messages: [
      { id: 1, from: 'me', type: 'song', song: { title: 'Levitating', artist: 'Dua Lipa' }, time: '11:10' },
      { id: 2, from: 'them', type: 'text', text: 'Me encanto ese track', time: '11:15' },
    ],
  },
  {
    id: 3,
    name: 'Jordan Smith',
    online: true,
    lastMsg: 'Armemos un playlist juntos',
    time: '3h',
    unread: 1,
    messages: [{ id: 1, from: 'them', type: 'text', text: 'Armemos un playlist juntos', time: '09:00' }],
  },
]

function InitialBadge({ name, online, size = 'h-10 w-10' }: { name: string; online: boolean; size?: string }) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative shrink-0">
      <div className={`grid ${size} place-items-center rounded-2xl bg-gradient-to-br from-[#781635]/60 to-[#d4a259]/35 font-display text-xs font-bold text-white`}>
        {initials}
      </div>
      {online && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-[#d4a259]" />}
    </div>
  )
}

function SongCard({ song }: { song: NonNullable<Message['song']> }) {
  return (
    <div className="flex max-w-[260px] items-center gap-2 rounded-2xl border border-[#e7b18f]/25 bg-[#781635]/25 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#781635]/35 text-[#f7e2d5]">
        <UilMusic size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">{song.title}</p>
        <p className="truncate text-xs text-slate-300/75">{song.artist}</p>
      </div>
      <span className="rounded-full bg-white/10 p-1 text-slate-200">
        <UilPlay size={14} />
      </span>
    </div>
  )
}

export default function Messages() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeConvId, setActiveConvId] = useState(initialConversations[0].id)
  const [query, setQuery] = useState('')
  const [input, setInput] = useState('')
  const router = useRouter()

  const filteredConversations = useMemo(
    () => conversations.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [conversations, query],
  )

  const activeConversation =
    conversations.find(item => item.id === activeConvId) ?? conversations[0]

  function sendMessage() {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      from: 'me',
      type: 'text',
      text: input.trim(),
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    }

    setConversations(prev =>
      prev.map(item =>
        item.id === activeConversation.id
          ? {
              ...item,
              messages: [...item.messages, newMessage],
              lastMsg: newMessage.text ?? '',
              time: 'ahora',
            }
          : item,
      ),
    )

    setInput('')
  }

  return (
    <AppShell>
      <div className="mx-auto grid h-full min-h-screen w-full max-w-6xl gap-4 px-4 py-5 md:px-6 md:py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-white/12 bg-white/[0.04]">
          <div className="border-b border-white/10 p-4">
            <h1 className="font-display text-2xl font-black text-white">Mensajes</h1>

            <label className="relative mt-3 block">
              <UilSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300/65" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4a259]"
                placeholder="Buscar conversacion"
              />
            </label>
          </div>

          <div className="max-h-[65vh] overflow-y-auto">
            {filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setActiveConvId(conversation.id)}
                className={`flex w-full items-center gap-3 border-b border-white/5 p-4 text-left transition-colors ${
                  conversation.id === activeConversation.id ? 'bg-white/10' : 'hover:bg-white/6'
                }`}
              >
                <InitialBadge name={conversation.name} online={conversation.online} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">{conversation.name}</p>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300/60">{conversation.time}</span>
                  </div>
                  <p className="truncate text-xs text-slate-300/75">{conversation.lastMsg}</p>
                </div>
                {conversation.unread > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#781635] px-1 text-[11px] font-semibold text-white">
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col rounded-3xl border border-white/12 bg-slate-950/35">
          <header className="flex items-center gap-3 border-b border-white/10 p-4">
            <InitialBadge name={activeConversation.name} online={activeConversation.online} size="h-9 w-9" />
            <div>
              <p className="font-display text-lg font-bold text-white">{activeConversation.name}</p>
              <p className="text-xs text-slate-300/65">{activeConversation.online ? 'En linea' : 'Desconectado'}</p>
            </div>
              <button className="ml-auto rounded-xl bg-white/10 p-2 text-slate-100" onClick={() => router.push('/feed')}>
              <UilMessage size={16} />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {activeConversation.messages.map(message => (
              <div key={message.id} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${message.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {message.type === 'song' && message.song ? (
                    <SongCard song={message.song} />
                  ) : (
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        message.from === 'me'
                          ? 'rounded-tr-sm bg-gradient-to-r from-[#781635] to-[#e4504a] text-white'
                          : 'rounded-tl-sm border border-white/15 bg-white/8 text-slate-100'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}
                  <span className="text-[11px] uppercase tracking-[0.12em] text-slate-300/55">{message.time}</span>
                </div>
              </div>
            ))}
          </div>

          <footer className="border-t border-white/10 p-4">
            <div className="flex items-center gap-2">
              <button className="rounded-xl bg-white/10 p-2 text-slate-100 transition-colors hover:bg-white/15" aria-label="Adjuntar pista">
                <UilUserCircle size={18} />
              </button>
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') sendMessage()
                }}
                placeholder="Escribe un mensaje"
                className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4a259]"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-[#781635] to-[#d4a259] px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <UilLocationArrow size={15} />
                Enviar
              </button>
            </div>
          </footer>
        </section>
      </div>
    </AppShell>
  )
}
