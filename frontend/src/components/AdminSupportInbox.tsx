'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, LifeBuoy, Lock, RefreshCw, Search, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { SupportConversation, SupportMessage } from '@/types';
import { UserAvatar } from '@/components/TagBadge';

function mergeMessages(current: SupportMessage[], incoming: SupportMessage): SupportMessage[] {
  const next = current.some((message) => message.id === incoming.id)
    ? current.map((message) => (message.id === incoming.id ? incoming : message))
    : [...current, incoming];

  return [...next].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

function upsertConversation(current: SupportConversation[], incoming: SupportConversation): SupportConversation[] {
  const next = current.some((conversation) => conversation.id === incoming.id)
    ? current.map((conversation) => (conversation.id === incoming.id ? incoming : conversation))
    : [incoming, ...current];

  return [...next].sort((a, b) => {
    const left = new Date(a.last_message_at || a.created_at).getTime();
    const right = new Date(b.last_message_at || b.created_at).getTime();
    return right - left;
  });
}

export default function AdminSupportInbox() {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeConversation, setActiveConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const deferredSearch = useDeferredValue(search);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeLabel = useMemo(() => {
    if (!activeConversation) return '';
    return activeConversation.user?.nama_lengkap || activeConversation.user?.username || `User #${activeConversation.user_id}`;
  }, [activeConversation]);

  const fetchConversations = async () => {
    setLoadingList(true);
    try {
      const res = await adminAPI.getSupportConversations({
        status: status === 'all' ? '' : status,
        search: deferredSearch.trim(),
      });
      const nextConversations = res.data.conversations || [];
      setConversations(nextConversations);
      setActiveId((prev) => {
        if (prev && nextConversations.some((conversation: SupportConversation) => conversation.id === prev)) {
          return prev;
        }
        return nextConversations[0]?.id ?? null;
      });
    } catch {
      toast.error('Gagal memuat inbox support');
    } finally {
      setLoadingList(false);
    }
  };

  const markRead = async (conversationId: number) => {
    try {
      const res = await adminAPI.markSupportConversationRead(conversationId);
      const nextConversation = res.data.conversation as SupportConversation;
      setConversations((prev) => upsertConversation(prev, nextConversation));
      setActiveConversation((prev) => (prev?.id === nextConversation.id ? nextConversation : prev));
    } catch {}
  };

  const fetchMessages = async (conversationId: number) => {
    setLoadingMessages(true);
    try {
      const res = await adminAPI.getSupportMessages(conversationId);
      setActiveConversation(res.data.conversation);
      setMessages(res.data.messages || []);
      if (res.data.conversation?.unread_for_admin) {
        void markRead(conversationId);
      }
    } catch {
      toast.error('Gagal memuat percakapan');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, [status, deferredSearch]);

  useEffect(() => {
    if (!activeId) {
      setActiveConversation(null);
      setMessages([]);
      return;
    }
    void fetchMessages(activeId);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();

    const onConversation = (payload: SupportConversation) => {
      if (status !== 'all' && payload.status !== status) {
        setConversations((prev) => prev.filter((conversation) => conversation.id !== payload.id));
        if (activeId === payload.id) {
          setActiveConversation(payload);
        }
        return;
      }

      if (deferredSearch.trim()) {
        const keyword = deferredSearch.trim().toLowerCase();
        const matches = [
          payload.user?.nama_lengkap,
          payload.user?.username,
          payload.user?.email,
        ].some((value) => value?.toLowerCase().includes(keyword));
        if (!matches) return;
      }

      setConversations((prev) => upsertConversation(prev, payload));
      setActiveConversation((prev) => (prev?.id === payload.id ? payload : prev));
    };

    const onMessage = (payload: {
      conversation_id: number;
      conversation: SupportConversation;
      message: SupportMessage;
    }) => {
      onConversation(payload.conversation);
      if (activeId === payload.conversation_id) {
        setMessages((prev) => mergeMessages(prev, payload.message));
        setActiveConversation(payload.conversation);
        if (payload.message.sender_role === 'user') {
          void markRead(payload.conversation_id);
        }
      }
    };

    socket.on('support_conversation', onConversation);
    socket.on('support_message', onMessage);

    return () => {
      socket.off('support_conversation', onConversation);
      socket.off('support_message', onMessage);
    };
  }, [activeId, deferredSearch, status]);

  const sendReply = async () => {
    if (!activeConversation || !input.trim() || sending) return;

    setSending(true);
    try {
      const res = await adminAPI.sendSupportReply(activeConversation.id, input.trim());
      const nextConversation = res.data.conversation as SupportConversation;
      const nextMessage = res.data.message as SupportMessage;
      setConversations((prev) => upsertConversation(prev, nextConversation));
      setActiveConversation(nextConversation);
      setMessages((prev) => mergeMessages(prev, nextMessage));
      setInput('');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengirim balasan');
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!activeConversation) return;
    const nextStatus = activeConversation.status === 'open' ? 'closed' : 'open';
    try {
      const res = await adminAPI.updateSupportConversationStatus(activeConversation.id, nextStatus);
      const nextConversation = res.data.conversation as SupportConversation;
      setConversations((prev) => upsertConversation(prev, nextConversation));
      setActiveConversation(nextConversation);
      toast.success(nextStatus === 'closed' ? 'Percakapan ditutup' : 'Percakapan dibuka kembali');
    } catch {
      toast.error('Gagal mengubah status percakapan');
    }
  };

  return (
    <div className="space-y-6">
      <section className="admin-hero admin-hero-support relative overflow-hidden rounded-2xl p-6 text-white">
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white/75">Realtime Support Inbox</p>
            <h1 className="mt-1 text-2xl font-bold">Chat User ke Admin</h1>
            <p className="mt-1 text-sm text-white/80">
              Tanggapi bantuan langsung dari pengguna tanpa keluar dari panel admin.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-white/75">Total Percakapan</p>
              <p className="mt-1 text-xl font-bold">{conversations.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-white/75">Belum Dibaca</p>
              <p className="mt-1 text-xl font-bold">
                {conversations.reduce((sum, conversation) => sum + conversation.unread_for_admin, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid min-h-[70vh] gap-4 xl:grid-cols-[360px,minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 backdrop-blur">
          <div className="border-b border-white/60 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email user..."
                className="input-field w-full pl-9 text-sm"
              />
            </div>
            <div className="mt-3 flex gap-2">
              {(['all', 'open', 'closed'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    status === value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {value === 'all' ? 'Semua' : value === 'open' ? 'Aktif' : 'Tutup'}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[calc(70vh-90px)] overflow-y-auto p-2">
            {loadingList && (
              <div className="space-y-2 p-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="shimmer h-20 rounded-2xl" />
                ))}
              </div>
            )}

            {!loadingList && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="rounded-full bg-emerald-100 p-4">
                  <LifeBuoy className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-700">Belum ada percakapan</p>
                <p className="mt-1 text-xs text-slate-500">Pesan realtime dari user akan muncul di sini.</p>
              </div>
            )}

            {conversations.map((conversation) => {
              const user = conversation.user;
              const isActive = activeId === conversation.id;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`mb-2 flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                    isActive
                      ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                      : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <UserAvatar
                    name={user?.nama_lengkap || user?.username || 'U'}
                    src={user?.avatar_url || undefined}
                    role={user?.role}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user?.nama_lengkap || user?.username || `User #${conversation.user_id}`}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user?.email || `@${user?.username || conversation.user_id}`}
                        </p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                        conversation.status === 'open'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {conversation.status === 'open' ? 'Aktif' : 'Ditutup'}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                      {conversation.last_message?.content || 'Belum ada pesan'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {new Date(conversation.last_message_at || conversation.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {conversation.unread_for_admin > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 font-bold text-white">
                          {conversation.unread_for_admin}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/85 backdrop-blur">
          {!activeConversation ? (
            <div className="flex h-full min-h-[70vh] flex-col items-center justify-center px-8 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <LifeBuoy className="h-10 w-10 text-slate-500" />
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-800">Pilih percakapan</p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Buka salah satu chat di kiri untuk mulai membalas pengguna secara realtime.
              </p>
            </div>
          ) : (
            <div className="flex h-[70vh] flex-col">
              <div className="border-b border-white/60 bg-slate-50/80 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={activeConversation.user?.nama_lengkap || activeConversation.user?.username || 'U'}
                      src={activeConversation.user?.avatar_url || undefined}
                      role={activeConversation.user?.role}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{activeLabel}</p>
                      <p className="text-xs text-slate-500">
                        {activeConversation.user?.email || `User ID ${activeConversation.user_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleStatus}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                        activeConversation.status === 'open'
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {activeConversation.status === 'open' ? <Lock className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                      {activeConversation.status === 'open' ? 'Tutup Chat' : 'Buka Lagi'}
                    </button>
                  </div>
                </div>
              </div>

              {activeConversation.status === 'closed' && (
                <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-800">
                  Percakapan sedang ditutup. Anda tetap bisa membuka kembali atau langsung membalas untuk mengaktifkannya.
                </div>
              )}

              <div className="flex-1 overflow-y-auto bg-slate-50/70 px-5 py-6">
                {loadingMessages && (
                  <div className="text-center text-sm text-slate-400">Memuat pesan...</div>
                )}

                {!loadingMessages && messages.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Belum ada pesan pada percakapan ini.
                  </div>
                )}

                <div className="space-y-4">
                  {messages.map((message) => {
                    const isAdmin = message.sender_role === 'admin';
                    return (
                      <div key={message.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                        <UserAvatar
                          name={isAdmin ? 'Admin' : (message.sender?.nama_lengkap || activeLabel)}
                          src={message.sender?.avatar_url || undefined}
                          role={isAdmin ? 'admin' : 'user'}
                          size="sm"
                        />
                        <div className={isAdmin ? 'chat-message-user' : 'chat-message-assistant'}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {new Date(message.created_at).toLocaleString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="border-t border-white/60 bg-white/90 px-4 py-4">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void sendReply();
                      }
                    }}
                    placeholder="Ketik balasan untuk pengguna..."
                    className="input-field min-h-[46px] max-h-32 flex-1 resize-none py-3 text-sm"
                  />
                  <button
                    onClick={() => void sendReply()}
                    disabled={!input.trim() || sending}
                    className="inline-flex h-[46px] items-center justify-center rounded-xl bg-emerald-600 px-4 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Shift+Enter untuk baris baru</span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sinkron realtime aktif
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
