"use client"

import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  UilLocationArrow,
  UilMessage,
  UilMusic,
  UilPlay,
  UilSearch,
  UilUserCircle,
} from '@iconscout/react-unicons'
import AppShell from '@/core/components/AppShell'
import { ConversationService, MessageService } from '@/features/messages/services/messages.service'
import { socketService } from '@/core/realtime/socket'
import { useAuthStore } from '@/core/store/auth.store'

type MsgType = 'text' | 'song'

interface Message {
  id: number | string
  from: 'me' | 'them'
  type: MsgType
  text?: string
  song?: { title: string; artist: string }
  time: string
}

interface Conversation {
  id: number | string
  otherUserId: string
  name: string
  avatarUrl?: string | null
  online: boolean
  lastMsg: string
  time: string
  unread: number
}

function InitialBadge({ name, avatarUrl, online, size = 'h-10 w-10' }: { name: string; avatarUrl?: string | null; online: boolean; size?: string }) {
  if (avatarUrl) {
    return (
      <div className="relative shrink-0">
        <img src={avatarUrl} alt={name} className={`${size} rounded-2xl object-cover`} />
        {online && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-[#67e8f9]" />}
      </div>
    )
  }

  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative shrink-0">
      <div className={`grid ${size} place-items-center rounded-2xl bg-gradient-to-br from-[#22d3ee]/60 to-[#67e8f9]/35 font-display text-xs font-bold text-white`}>
        {initials}
      </div>
      {online && <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-[#67e8f9]" />}
    </div>
  )
}

function SongCard({ song }: { song: NonNullable<Message['song']> }) {
  return (
    <div className="flex max-w-[260px] items-center gap-2 rounded-2xl border border-[#ff8d89]/25 bg-[#22d3ee]/25 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#22d3ee]/35 text-[#fff8ef]">
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
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | number | null>(null)
  const [activeMessages, setActiveMessages] = useState<Message[]>([])
  const [query, setQuery] = useState('')
  const [input, setInput] = useState('')
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Fetch Conversations on Mount
  useEffect(() => {
    async function fetchList() {
      try {
        const raw = await ConversationService.getConversations()
        const list = Array.isArray(raw) ? raw : (raw as any).items || []
        
        // Map backend format: { id, user: { id, displayName, avatarUrl }, lastMessage, unreadCount }
        const mapped = list.map((c: any, index: number) => {
          // Si el backend no envía lastMessage, pero hay actividad, evitamos el texto de error.
          const lastText = c.lastMessage || (c.unreadCount > 0 ? 'Tienes mensajes nuevos' : 'Chat activo');
          return {
            id: c.id || index.toString(),
            otherUserId: c.user?.id || '',
            name: c.user?.displayName || `Usuario ${index}`,
            avatarUrl: c.user?.avatarUrl || null,
            online: false, 
            lastMsg: lastText, 
            time: 'reciente',
            unread: c.unreadCount || 0,
          };
        })
        setConversations(mapped)
        if (mapped.length > 0 && !activeConvId) {
          setActiveConvId(mapped[0].id)
        }
      } catch (err) {
        console.error("Error al obtener conversaciones", err)
      }
    }
    fetchList()
  }, [])

  // 2. Load Messages when Active Conversation switches
  useEffect(() => {
    if (!activeConvId) return

    async function loadThread() {
      try {
        const res = await MessageService.getMessages(String(activeConvId))
        const items = Array.isArray(res) ? res : (res as any).items || []
        const mapped = items.map((m: any) => ({
          id: m.id || m._id || Date.now() + Math.random(),
          from: (String(m.senderId) === String(user?.id) || m.isMine) ? 'me' : 'them',
          type: m.song ? 'song' : 'text',
          text: m.content || m.text || '',
          song: m.song,
          time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('es', {hour: '2-digit', minute:'2-digit'}) : 'reciente',
        })) as Message[]
        
        // Revertimos para que los más antiguos queden arriba y los nuevos abajo (scroll bottom)
        setActiveMessages(mapped.reverse())
        MessageService.markAsRead(String(activeConvId)).catch(() => {})
        
        // Remove unread bubble
        setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unread: 0 } : c))
      } catch (err) {
        console.error("Error en hilo de chat", err)
        setActiveMessages([])
      }
    }
    loadThread()
  }, [activeConvId, user?.id])

  // 3. Setup WebSockets — Backend uses single 'message' event with { type, payload }
  useEffect(() => {
    const socket = socketService.connect()

    // Authenticate via WS after connecting
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
      socket.emit('message', { type: 'AUTH', token })
    }
    
    const handleWsMessage = (data: any) => {
      if (data.type === 'MESSAGE_RECEIVED' && data.payload) {
        const p = data.payload
        const convId = p.conversationId || null
        const incomingMsg: Message = {
          id: p.id || Date.now(),
          from: (String(p.senderId) === String(user?.id)) ? 'me' : 'them',
          type: 'text',
          text: p.content || '',
          time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : 'ahora'
        }

        if (String(convId) === String(activeConvId)) {
          setActiveMessages(prev => [...prev, incomingMsg])
        } else if (convId) {
          setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread: c.unread + 1, lastMsg: incomingMsg.text || 'Nuevo msg' } : c))
        }
      }
    }

    socket.on('message', handleWsMessage)

    return () => {
      socket.off('message', handleWsMessage)
    }
  }, [activeConvId, user?.id])

  // Scroll bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeMessages])


  const filteredConversations = useMemo(
    () => conversations.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [conversations, query],
  )

  const activeConversation = conversations.find(item => item.id === activeConvId) || null

  function sendMessage() {
    if (!input.trim() || !activeConvId) return

    const newMessage: Message = {
      id: Date.now(),
      from: 'me',
      type: 'text',
      text: input.trim(),
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
    }

    // Optimistic UI update
    setActiveMessages(prev => [...prev, newMessage])
    
    // Send via socket — backend expects { type: 'MESSAGE_SEND', payload: { ... } }
    const socket = socketService.getSocket()
    if (socket) {
      const conv = conversations.find(c => c.id === activeConvId)
      socket.emit('message', {
        type: 'MESSAGE_SEND',
        payload: {
          conversationId: activeConvId,
          content: input.trim(),
          toUserId: conv?.otherUserId || '',
        }
      })
    }

    setInput('')
  }

  return (
    <AppShell>
      <div className="mx-auto grid h-[calc(100vh-8rem)] w-full max-w-6xl gap-4 px-4 py-5 md:px-6 md:py-8 lg:grid-cols-[320px_minmax(0,1fr)] overflow-hidden">
        <aside className="rounded-3xl border border-white/12 bg-[#25252a]/70">
          <div className="border-b border-white/10 p-4">
            <h1 className="font-display text-2xl font-black text-white">Mensajes</h1>

            <label className="relative mt-3 block">
              <UilSearch size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300/65" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67e8f9]"
                placeholder="Buscar conversacion"
              />
            </label>
          </div>

          <div className="h-[calc(100%-120px)] overflow-y-auto no-scrollbar">
            {filteredConversations.length === 0 && <p className="p-4 text-center text-sm text-slate-400">0 conversaciones encontradas</p>}
            {filteredConversations.map(conversation => (
              <button
                key={conversation.id}
                onClick={() => setActiveConvId(conversation.id)}
                className={`flex w-full items-center gap-3 border-b border-white/5 p-4 text-left transition-colors ${
                  conversation.id === activeConvId ? 'bg-white/10' : 'hover:bg-white/6'
                }`}
              >
                <InitialBadge name={conversation.name} avatarUrl={conversation.avatarUrl} online={conversation.online} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">{conversation.name}</p>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-slate-300/60">{conversation.time}</span>
                  </div>
                  <p className="truncate text-xs text-slate-300/75">{conversation.lastMsg}</p>
                </div>
                {conversation.unread > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#22d3ee] px-1 text-[11px] font-semibold text-white">
                    {conversation.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        <section className="flex h-full flex-col rounded-3xl border border-white/12 bg-[#1f1f23]/70 overflow-hidden">
          {activeConversation ? (
            <>
              <header className="flex items-center gap-3 border-b border-white/10 p-4">
                <InitialBadge name={activeConversation.name} avatarUrl={activeConversation.avatarUrl} online={activeConversation.online} size="h-9 w-9" />
                <div>
                  <p className="font-display text-lg font-bold text-white">{activeConversation.name}</p>
                  <p className="text-xs text-slate-300/65">{activeConversation.online ? 'En linea' : 'Desconectado'}</p>
                </div>
                <button className="ml-auto rounded-xl bg-white/10 p-2 text-slate-100" onClick={() => router.push('/feed')}>
                  <UilMessage size={16} />
                </button>
              </header>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {activeMessages.length === 0 && <div className="text-center text-sm text-slate-500 mt-10">Comienza a chatear.</div>}
                {activeMessages.map(message => (
                  <div key={message.id} className={`flex ${message.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${message.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {message.type === 'song' && message.song ? (
                        <SongCard song={message.song} />
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            message.from === 'me'
                              ? 'rounded-tr-sm bg-gradient-to-r from-[#22d3ee] to-[#ff8d89] text-white'
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
                    className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#67e8f9]"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="inline-flex items-center gap-1 rounded-2xl bg-[#ff8d89] px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <UilLocationArrow size={15} />
                    Enviar
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-10 text-center text-slate-400">
               <p>No tienes conversaciones activas.<br/>Busca nuevos gemelos musicales en tu feed.</p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
