'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MessageSquare } from 'lucide-react';
import Navbar from '@/components/Navbar';
import PostCard from '@/components/PostCard';
import { forumAPI } from '@/lib/api';
import { Post } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function MyQuestionsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isAuthenticated) fetchMyPosts(1);
  }, [isAuthenticated]);

  const fetchMyPosts = async (p: number) => {
    setLoading(true);
    try {
      const res = await forumAPI.getMyPosts({ page: p });
      setPosts(res.data.posts);
      setTotalPages(res.data.pages);
      setTotal(res.data.total);
      setPage(p);
    } catch {
      toast.error('Gagal memuat pertanyaan Anda');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen text-slate-900 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 mesh-bg opacity-70 pointer-events-none" />
      <div className="fixed inset-0 -z-10 page-fade pointer-events-none" />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pertanyaan Saya</h1>
            <p className="text-gray-500 text-sm mt-0.5">{total} pertanyaan</p>
          </div>
          <Link href="/forum/ask" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Buat Baru
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="card shimmer h-28" />)}</div>
        ) : posts.length === 0 ? (
          <div className="card py-16 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Belum ada pertanyaan</p>
            <Link href="/forum/ask" className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Buat Pertanyaan
            </Link>
          </div>
        ) : (
          <div className="space-y-3">{posts.map(p => <PostCard key={p.id} post={p} />)}</div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button disabled={page === 1} onClick={() => fetchMyPosts(page - 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">‹ Prev</button>
            <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => fetchMyPosts(page + 1)} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">Next ›</button>
          </div>
        )}
      </div>
    </div>
  );
}
