'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Calendar } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { ChatMessage } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

export default function AdminChatQuestionsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const confirm = useConfirm();

  useEffect(() => { fetchMessages(1); }, []);

  const fetchMessages = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminAPI.getChatbotQuestions({ page: p, search, date_from: dateFrom, date_to: dateTo });
      setMessages(res.data.messages);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
      setPage(p);
    } catch {
      toast.error('Gagal memuat data pertanyaan');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: 'Hapus pesan',
      message: 'Pesan ini akan dihapus permanen. Lanjutkan?',
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deleteChatMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      toast.success('Pesan dihapus');
    } catch { toast.error('Gagal menghapus'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Pertanyaan Chatbot</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} total pertanyaan</p>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9 text-sm" type="text" placeholder="Cari pertanyaan..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchMessages(1)} />
          </div>
          <input type="date" className="input-field w-auto text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" className="input-field w-auto text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <button className="btn-primary text-sm px-4" onClick={() => fetchMessages(1)}>Filter</button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-12 rounded" />)}</div>
        ) : messages.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pertanyaan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">Tanggal</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {messages.map(msg => (
                  <tr key={msg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800 max-w-xs">
                      <p className="truncate">{msg.content}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(msg.created_at), 'd MMM yyyy', { locale: id })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button disabled={page === 1} onClick={() => fetchMessages(page - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">‹ Prev</button>
          <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => fetchMessages(page + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next ›</button>
        </div>
      )}
    </div>
  );
}
