'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, EyeOff, Trash2, ExternalLink, Flag, ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { Post, ReportDetail } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

export default function AdminForumQuestionsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportItems, setReportItems] = useState<ReportDetail[]>([]);
  const confirm = useConfirm();

  useEffect(() => { fetchPosts(1); }, []);

  const fetchPosts = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminAPI.getAdminPosts({ page: p, search, sort_by: sortBy });
      setPosts(res.data.posts);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
      setPage(p);
    } catch {
      toast.error('Gagal memuat daftar pertanyaan');
    } finally { setLoading(false); }
  };

  const handleToggleHide = async (postId: number) => {
    try {
      const res = await adminAPI.toggleHidePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, is_hidden: res.data.is_hidden } : p));
      toast.success(res.data.message);
    } catch { toast.error('Gagal mengubah status post'); }
  };

  const handleDelete = async (postId: number) => {
    const ok = await confirm({
      title: 'Hapus post',
      message: 'Post ini akan dihapus permanen. Lanjutkan?',
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.adminDeletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post dihapus');
    } catch { toast.error('Gagal menghapus'); }
  };

  const openReportModal = (post: Post) => {
    setReportTitle(post.judul);
    setReportItems(post.report_details || []);
    setReportOpen(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Kelola Pertanyaan Forum</h1>
        <p className="text-gray-500 text-sm mt-0.5">{total} total pertanyaan</p>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9 text-sm" type="text" placeholder="Cari judul..."
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchPosts(1)} />
          </div>
          <select className="input-field w-auto text-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="created_at">Terbaru</option>
            <option value="reports">Terbanyak Laporan</option>
          </select>
          <button className="btn-primary text-sm px-4" onClick={() => fetchPosts(1)}>Filter</button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="shimmer h-14 rounded" />)}</div>
        ) : posts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Tidak ada data</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Judul</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">Penulis</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 w-28">Like/Dislike</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 w-36">Like/Dislike Jawaban</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 w-20">Laporan</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 w-24">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-28">Tanggal</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map(post => (
                  <tr key={post.id} className={`hover:bg-gray-50 ${post.is_hidden ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate font-medium text-gray-800">{post.judul}</p>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {post.tags.slice(0, 3).map(t => (
                          <span key={t.id} className="badge bg-gray-100 text-gray-500 text-xs">{t.name}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{post.author?.username}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <ThumbsUp className="w-3.5 h-3.5" />{post.post_upvotes ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <ThumbsDown className="w-3.5 h-3.5" />{post.post_downvotes ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <ThumbsUp className="w-3.5 h-3.5" />{post.answer_upvotes ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1 text-red-500">
                          <ThumbsDown className="w-3.5 h-3.5" />{post.answer_downvotes ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {post.report_count && post.report_count > 0 ? (
                        <button
                          onClick={() => openReportModal(post)}
                          className="badge bg-red-100 text-red-600 inline-flex items-center gap-1 justify-center hover:bg-red-200 transition-colors"
                          title="Lihat isi laporan"
                        >
                          <Flag className="w-3 h-3" />{post.report_count}
                        </button>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`badge ${post.is_hidden ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {post.is_hidden ? 'Disembunyikan' : 'Publik'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {format(new Date(post.created_at), 'd MMM yyyy', { locale: id })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/forum/${post.id}`} target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleToggleHide(post.id)}
                          className="p-1.5 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors" title={post.is_hidden ? 'Tampilkan' : 'Sembunyikan'}>
                          {post.is_hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(post.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-4">
          <button disabled={page === 1} onClick={() => fetchPosts(page - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">{'<' } Prev</button>
          <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => fetchPosts(page + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next {'>'}</button>
        </div>
      )}

      {reportOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Laporan untuk</p>
                <h2 className="font-semibold text-gray-900 line-clamp-1">{reportTitle}</h2>
              </div>
              <button onClick={() => setReportOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {reportItems.length === 0 ? (
                <p className="text-sm text-gray-400">Belum ada isi laporan.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {reportItems.map((r) => (
                    <div key={r.id} className="border border-gray-100 rounded-xl p-3">
                      <p className="text-sm text-gray-700">{r.isi_laporan}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(r.created_at), 'd MMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 pb-4">
              <button className="btn-secondary w-full" onClick={() => setReportOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
