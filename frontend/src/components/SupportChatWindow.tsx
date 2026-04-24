'use client';

import { useEffect, useRef, useState } from 'react';
import { LifeBuoy, Send, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { supportAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { SupportConversation, SupportMessage } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/TagBadge';

function mergeMessages(current: SupportMessage[], incoming: SupportMessage): SupportMessage[] {
  const next = current.some((message) => message.id === incoming.id)
    ? current.map((message) => (message.id === incoming.id ? incoming : message))
    : [...current, incoming];

  return [...next].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export default function SupportChatWindow() {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const markRead = async () => {
    try {
      await supportAPI.markConversationRead();
      setConversation((prev) => (prev ? { ...prev, unread_for_user: 0 } : prev));
    } catch {}
  };

  const fetchConversation = async () => {
    setLoading(true);
    try {
      const res = await supportAPI.getConversation();
      setConversation(res.data.conversation);
      setMessages(res.data.messages || []);
      if (res.data.conversation?.unread_for_user) {
        void markRead();
      }
    } catch {
      toast.error('Gagal memuat chat bantuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchConversation();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();

    const onConversation = (payload: SupportConversation) => {
      setConversation(payload);
    };

    const onMessage = (payload: {
      conversation_id: number;
      conversation: SupportConversation;
      message: SupportMessage;
    }) => {
      setConversation(payload.conversation);
      setMessages((prev) => {
        if (conversation && conversation.id !== payload.conversation_id) {
          return [payload.message];
        }
        return mergeMessages(prev, payload.message);
      });

      if (payload.message.sender_role === 'admin') {
        void markRead();
      }
    };

    socket.on('support_conversation', onConversation);
    socket.on('support_message', onMessage);

    return () => {
      socket.off('support_conversation', onConversation);
      socket.off('support_message', onMessage);
    };
  }, [conversation]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const res = await supportAPI.sendMessage(content);
      const nextConversation = res.data.conversation as SupportConversation;
      const nextMessage = res.data.message as SupportMessage;

      setConversation(nextConversation);
      setMessages((prev) => (
        conversation && conversation.id === nextConversation.id
          ? mergeMessages(prev, nextMessage)
          : [nextMessage]
      ));
      setInput('');
      textareaRef.current?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="flex-1 px-4 pb-6">
      <div className="max-w-5xl mx-auto h-[calc(100vh-var(--nav-offset)-2rem)] rounded-[28px] overflow-hidden border border-white/60 bg-white/80 backdrop-blur shadow-xl">
        <div className="border-b border-white/60 bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 px-5 py-4 text-white">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Chat Admin StatistiKita</p>
                <p className="text-sm text-emerald-100">Konsultasi realtime langsung dengan admin layanan</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> Realtime
            </span>
          </div>
        </div>

        {conversation?.status === 'closed' && (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-800">
            Percakapan sebelumnya sudah ditutup. Kirim pesan baru untuk membuka percakapan baru dengan admin.
          </div>
        )}

        <div className="flex h-[calc(100%-77px)] flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 bg-slate-50/70">
            {loading && (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Memuat percakapan...
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-emerald-100 p-4">
                  <LifeBuoy className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Bantuan admin siap menerima pesan</h3>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Gunakan ruang ini jika Anda membutuhkan bantuan langsung selain chatbot AI dan forum diskusi.
                </p>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.sender_role === 'user';
              return (
                <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {isUser ? (
                    <UserAvatar
                      name={user?.nama_lengkap || user?.username || 'U'}
                      src={user?.avatar_url}
                      role={user?.role}
                      size="sm"
                    />
                  ) : (
                    <UserAvatar
                      name={message.sender?.nama_lengkap || 'Admin'}
                      src={message.sender?.avatar_url || undefined}
                      role="admin"
                      size="sm"
                    />
                  )}
                  <div className={isUser ? 'chat-message-user' : 'chat-message-assistant'}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(message.created_at).toLocaleTimeString('id-ID', {
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

          <div className="border-t border-white/60 bg-white/90 px-4 py-4">
            <div className="mx-auto flex max-w-4xl items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pesan ke admin... (Enter untuk kirim)"
                className="input-field min-h-[46px] max-h-32 flex-1 resize-none py-3 text-sm"
              />
              <button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || sending}
                className="inline-flex h-[46px] items-center justify-center rounded-xl bg-emerald-600 px-4 text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-center text-xs text-slate-400">Shift+Enter untuk baris baru</p>
          </div>
        </div>
      </div>
    </div>
  );
}
