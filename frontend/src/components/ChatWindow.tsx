'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, MessageSquare, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatAPI } from '@/lib/api';
import { ChatMessage, ChatSession } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserAvatar } from '@/components/TagBadge';
import { useConfirm } from '@/components/ConfirmDialog';

export default function ChatWindow() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const confirm = useConfirm();

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await chatAPI.getSessions();
      setSessions(res.data.sessions);
    } catch {}
  };

  const loadSession = async (sessionId: number) => {
    setLoadingSession(true);
    setActiveSession(sessionId);
    try {
      const res = await chatAPI.getSessionMessages(sessionId);
      setMessages(res.data.messages);
    } catch {
      toast.error('Gagal memuat percakapan');
    } finally {
      setLoadingSession(false);
    }
  };

  const startNewChat = () => {
    setActiveSession(null);
    setMessages([]);
  };

  const deleteSession = async (e: React.MouseEvent, sessionId: number) => {
    e.stopPropagation();
    const ok = await confirm({
      title: 'Hapus sesi chat',
      message: 'Riwayat percakapan sesi ini akan hilang permanen. Lanjutkan?',
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSession === sessionId) startNewChat();
      toast.success('Sesi dihapus');
    } catch {
      toast.error('Gagal menghapus sesi');
    }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending) return;

    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: activeSession || 0,
      role: 'user',
      content: msg,
      created_at: new Date().toISOString(),
    };
    const typingMsg: ChatMessage = {
      id: Date.now() + 1,
      session_id: activeSession || 0,
      role: 'assistant',
      content: '...',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg, typingMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await chatAPI.sendMessage(msg, activeSession ?? undefined);
      const { session_id, user_message, assistant_message } = res.data;

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== optimisticMsg.id && m.id !== typingMsg.id);
        return [...filtered, user_message, assistant_message];
      });

      if (!activeSession) {
        setActiveSession(session_id);
        fetchSessions();
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id && m.id !== typingMsg.id));
      toast.error(err.response?.data?.error || 'Gagal mengirim pesan');
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-var(--nav-offset))] bg-slate-50">
      {/* Sidebar: chat sessions */}
      <div className="w-full md:w-72 flex-shrink-0 bg-white/85 backdrop-blur border-b md:border-b-0 md:border-r border-white/60 flex flex-col max-h-60 md:max-h-none">
        <div className="p-4 border-b border-white/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Riwayat Chat</p>
              <h3 className="text-sm font-semibold text-slate-800">Sesi Percakapan</h3>
            </div>
            <span className="badge bg-blue-100 text-blue-700">{sessions.length}</span>
          </div>
          <button
            onClick={startNewChat}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2 mt-3"
          >
            <Plus className="w-4 h-4" /> Chat Baru
          </button>
          <button
            onClick={() => setHistoryOpen(prev => !prev)}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm py-2 mt-2 md:hidden"
          >
            {historyOpen ? 'Sembunyikan Riwayat' : 'Tampilkan Riwayat'}
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto py-2 ${historyOpen ? 'block' : 'hidden'} md:block`}>
          {sessions.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-400">Belum ada percakapan</p>
          )}
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-xl mx-2 group transition-all ${
                activeSession === s.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs flex-1 truncate">{s.title}</span>
              <button
                onClick={e => deleteSession(e, s.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50">
        <div className="bg-white/80 backdrop-blur border-b border-white/60 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Asisten StatistiKita</p>
              <p className="text-xs text-slate-500">Siap membantu data statistik</p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            Online
          </span>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {loadingSession && (
            <div className="text-center text-sm text-slate-400">Memuat percakapan...</div>
          )}
          {messages.length === 0 && !loadingSession && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <Bot className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">Asisten StatistiKita</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                Tanyakan apa saja seputar data statistik BPS Provinsi Lampung. Saya siap membantu!
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Apa itu BPS?', 'Data penduduk Lampung', 'Cara membaca tabel statistik'].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-xs bg-white/90 border border-white/70 text-slate-600 px-3 py-1.5 rounded-full hover:border-blue-300 hover:text-blue-600 transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'user' ? (
                <UserAvatar name={user?.nama_lengkap || user?.username || 'U'} src={user?.avatar_url} role={user?.role} size="sm" />
              ) : (
                <UserAvatar name="Admin" role="admin" size="sm" />
              )}
              <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}>
                {msg.content === '...' ? (
                  <div className="space-y-1">
                    <span className="flex gap-1 items-center py-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                    <p className="text-xs text-slate-500">Harap menunggu, StatistiKita sedang memproses..</p>
                  </div>
                ) : msg.role === 'assistant' ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} className="text-sm leading-relaxed">
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/60 bg-white/80 backdrop-blur px-4 py-3">
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <textarea
              ref={textareaRef}
              className="input-field flex-1 resize-none min-h-[44px] max-h-32 py-2.5 text-sm"
              placeholder="Ketik pertanyaan Anda... (Enter untuk kirim)"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="btn-primary px-4 py-2.5 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-1.5">Shift+Enter untuk baris baru</p>
        </div>
      </div>
    </div>
  );
}
