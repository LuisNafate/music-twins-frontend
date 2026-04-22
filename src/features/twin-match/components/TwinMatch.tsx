"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// @ts-ignore - icons exist at runtime, type defs may be stale
import { UilCommentAltLines, UilUserCheck, UilUserPlus, UilHeadphonesAlt, UilUsersAlt } from '@iconscout/react-unicons'
import AppShell from '@/core/components/AppShell'
import { TwinMatchService, Friend, FriendRequest } from '@/features/twin-match/services/twin-match.service'
import { ConversationService } from '@/features/messages/services/messages.service'
import { useAuthStore } from '@/core/store/auth.store'

function InitialTwin({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22d3ee]/70 to-[#67e8f9]/35 font-display text-sm font-bold text-white">
      {initials || 'MT'}
    </span>
  )
}

export default function TwinMatch() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    async function loadNetwork() {
      try {
        const [friendsRes, requestsRes] = await Promise.all([
          TwinMatchService.getFriends(),
          TwinMatchService.getPendingRequests()
        ])
        const fList = Array.isArray(friendsRes) ? friendsRes : (friendsRes as any).items || []
        const rList = Array.isArray(requestsRes) ? requestsRes : (requestsRes as any).items || []
        
        setFriends(fList)
        setRequests(rList)
        if (fList.length > 0) {
          setSelectedFriend(fList[0])
        }
      } catch (err) {
        console.error('Error fetching network:', err)
      } finally {
        setLoading(false)
      }
    }
    loadNetwork()
  }, [])

  const handleSendMessage = async (twinId: string) => {
    try {
      await ConversationService.createConversation(twinId)
      router.push('/messages')
    } catch (err) {
      router.push('/messages')
    }
  }

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await TwinMatchService.searchUsers(q.trim())
      const list = Array.isArray(res) ? res : (res as any).items || []
      setSearchResults(list)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSendRequest = async (targetId: string) => {
    try {
      await TwinMatchService.sendFriendRequest(targetId)
      // Mark as sent in results
      setSearchResults(prev => prev.map(u => u.id === targetId ? { ...u, status: 'PENDING' } : u))
    } catch (err) {
      alert('Error enviando la solicitud')
    }
  }

  const handleRespond = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await TwinMatchService.respondToRequest(requestId, action)
      setRequests(prev => prev.filter(r => r.id !== requestId))
      if (action === 'ACCEPT') {
        const [friendsRes] = await Promise.all([TwinMatchService.getFriends()])
        setFriends(Array.isArray(friendsRes) ? friendsRes : (friendsRes as any).items || [])
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-5 px-4 py-5 md:px-6 md:py-8">
        <header className="rounded-3xl border border-white/12 bg-[#25252a]/70 p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-[#67e8f9]">Red Musical</p>
          <h1 className="mt-2 font-display text-3xl font-black text-white md:text-4xl">Tus Twins y Conexiones</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-200/75 md:text-base">
            Gestiona tus amigos actuales y descubre quienes quieren conectar con tu frecuencia musical (Datos Reales).
          </p>

          <div className="mt-6 max-w-lg">
            <input 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar usuarios por nombre..."
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-[#67e8f9]"
            />
            {searching && <p className="mt-2 text-xs text-slate-400">Buscando...</p>}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-black/30 p-3">
                {searchResults.map(u => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <div className="flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <InitialTwin name={u.displayName || '?'} />
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{u.displayName}</p>
                        <p className="text-[10px] text-slate-400">{u.isFriend ? 'Ya son amigos' : u.status === 'PENDING' ? 'Solicitud enviada' : 'Disponible'}</p>
                      </div>
                    </div>
                    {!u.isFriend && u.status !== 'PENDING' && u.status !== 'ACCEPTED' && (
                      <button
                        onClick={() => handleSendRequest(u.id)}
                        className="rounded-xl bg-[#67e8f9] px-3 py-1.5 text-xs font-bold text-slate-900"
                      >
                        Agregar
                      </button>
                    )}
                    {u.status === 'PENDING' && (
                      <span className="text-xs text-[#e5be85]">Pendiente</span>
                    )}
                    {u.isFriend && (
                      <span className="text-xs text-[#10b981]">✓ Amigos</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="mt-2 text-xs text-slate-500">No se encontraron usuarios con ese nombre.</p>
            )}
          </div>
        </header>

        {requests.length > 0 && (
          <section className="rounded-3xl border border-[#ff8d89]/30 bg-[#ff8d89]/10 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#ff8d89]">Solicitudes Pendientes ({requests.length})</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {requests.map(req => (
                <div key={req.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-300">De: <span className="font-bold text-white">{(req as any).displayName || req.fromUserId}</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRespond(req.id, 'ACCEPT')} className="rounded-full bg-[#10b981] p-2 text-white hover:brightness-110">
                      <UilUserCheck size={16} />
                    </button>
                    <button onClick={() => handleRespond(req.id, 'REJECT')} className="rounded-full bg-red-500 p-2 text-white hover:brightness-110">
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-3 rounded-3xl border border-white/12 bg-[#25252a]/70 p-4 min-h-[500px]">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Lista de Amigos</h3>
            {loading && <p className="text-center text-sm text-slate-500">Cargando red...</p>}
            {!loading && friends.length === 0 && <p className="text-center text-sm text-slate-500">Aun no tienes amigos.</p>}
            {friends.map(friend => (
              <button
                key={friend.id}
                onClick={() => setSelectedFriend(friend)}
                className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                  selectedFriend?.id === friend.id
                    ? 'border-[#ff8d89]/35 bg-[#22d3ee]/30'
                    : 'border-white/12 bg-white/4 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  {friend.avatarUrl ? (
                    <img src={friend.avatarUrl} className="h-10 w-10 shrink-0 rounded-2xl object-cover" />
                  ) : (
                    <InitialTwin name={friend.displayName || 'Twin'} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-bold text-white">{friend.displayName || 'Usuario'}</p>
                    <p className="text-[10px] text-slate-400">Twin ID: {friend.id.slice(0,6)}...</p>
                  </div>
                </div>
              </button>
            ))}
          </aside>

          <section className="space-y-4">
            {selectedFriend ? (
              <article className="rounded-3xl border border-white/12 bg-[#1f1f23]/70 p-5 md:p-6">
                <div className="flex flex-wrap items-center gap-5">
                  {selectedFriend.avatarUrl ? (
                    <img src={selectedFriend.avatarUrl} className="h-28 w-28 rounded-3xl object-cover" />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-white/5 text-4xl text-white">
                      <UilUserPlus size={40} />
                    </div>
                  )}
                  <div className="min-w-[240px] flex-1">
                    <h2 className="font-display text-3xl font-black text-white">{selectedFriend.displayName}</h2>
                    <p className="mt-1 text-sm text-slate-300/75 tracking-wider">Membro oficial de tu red</p>

                    <div className="mt-6 flex flex-wrap gap-2">
                       <button
                        onClick={() => handleSendMessage(selectedFriend.id)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[#22d3ee]/40 bg-[#22d3ee]/10 px-4 py-2 text-sm text-[#67e8f9] transition-colors hover:bg-[#22d3ee]/20"
                      >
                        <UilCommentAltLines size={16} />
                        Conversar en chat
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#22d3ee] to-[#ff8d89] px-4 py-2 text-sm font-semibold text-white">
                        <UilHeadphonesAlt size={16} />
                        Compartir sesion Spotify
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-center">
                   <p className="text-sm text-slate-400">Las metricas deep-learning de afinidad musical (tempo, generos, moods) estaran disponibles proximamente cuando Spotify procese el historial base.</p>
                </div>
              </article>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/12 bg-[#1f1f23]/70 p-5 text-center text-slate-400">
                <UilUsersAlt size={48} className="mb-4 opacity-50" />
                <p>Selecciona un amigo para ver sus detalles</p>
                <p className="text-xs max-w-sm mt-2 opacity-60">O envia una nueva solicitud de amistad en el area superior usando el ID de un usuario.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  )
}
