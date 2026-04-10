'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Flag, Pencil, Trash2, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { TagBadge, UserAvatar } from '@/components/TagBadge';
import VoteButtons from '@/components/VoteButtons';
import AnswerCard from '@/components/AnswerCard';
import ReportModal from '@/components/ReportModal';
import { forumAPI } from '@/lib/api';
import { Post, Answer } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

interface ForumDetailClientProps {
  postId: number;
  initialPost: Post | null;
  initialAnswers: Answer[];
}

export default function ForumDetailClient({ postId, initialPost, initialAnswers }: ForumDetailClientProps) {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [post] = useState<Post | null>(initialPost);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const confirm = useConfirm();

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerContent.trim()) { toast.error('Jawaban tidak boleh kosong'); return; }
    setSubmitting(true);
    try {
      const res = await forumAPI.addAnswer(postId, answerContent);
      setAnswers(prev => [...prev, res.data.answer]);
      setAnswerContent('');
      toast.success('Jawaban berhasil ditambahkan');
    } catch {
      toast.error('Gagal menambahkan jawaban');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    const ok = await confirm({
      title: 'Hapus pertanyaan',
      message: 'Pertanyaan ini akan dihapus permanen beserta data terkait. Lanjutkan?',
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await forumAPI.deletePost(postId);
      toast.success('Pertanyaan dihapus');
      router.push('/forum');
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen text-slate-900 relative overflow-hidden">
        <div className="fixed inset-0 -z-10 mesh-bg opacity-70 pointer-events-none" />
        <div className="fixed inset-0 -z-10 page-fade pointer-events-none" />
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Pertanyaan tidak ditemukan.</p>
          <Link href="/forum" className="btn-primary mt-4 inline-block">Kembali ke Forum</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <div className="min-h-screen text-slate-900 relative overflow-hidden">
      <div className="fixed inset-0 -z-10 mesh-bg opacity-70 pointer-events-none" />
      <div className="fixed inset-0 -z-10 page-fade pointer-events-none" />
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/forum" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-5">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Forum
        </Link>

        {/* Post */}
        <div className="card mb-5">
          <div className="flex gap-4">
            <VoteButtons targetType="post" targetId={post.id} initialCount={post.vote_count} initialVote={post.user_vote} orientation="vertical" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{post.judul}</h1>
                <div className="flex gap-1 flex-shrink-0">
                  {!isOwner && <button onClick={() => setShowReport(true)} className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50"><Flag className="w-4 h-4" /></button>}
                  {isOwner && <Link href={`/forum/${post.id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"><Pencil className="w-4 h-4" /></Link>}
                  {(isOwner || isAdmin) && <button onClick={handleDeletePost} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                {post.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{post.deskripsi}</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <UserAvatar
                  name={post.author?.nama_lengkap || '?'}
                  src={post.author?.avatar_url}
                  role={post.author?.role}
                  size="sm"
                />
                <span className="text-sm font-medium text-gray-600">{post.author?.username}</span>
                <span className="text-gray-300">·</span>
                <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="card mb-5">
          <h2 className="font-semibold text-gray-800 mb-1">{answers.length} Jawaban</h2>
          {answers.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">Belum ada jawaban. Jadilah yang pertama!</p>
          ) : (
            <div>
              {answers.map(ans => (
                <AnswerCard key={ans.id} answer={ans}
                  onDeleted={id => setAnswers(prev => prev.filter(a => a.id !== id))}
                  onUpdated={updated => setAnswers(prev => prev.map(a => a.id === updated.id ? updated : a))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Answer form */}
        {isAuthenticated ? (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-3">Tulis Jawaban</h2>
            <form onSubmit={handleSubmitAnswer}>
              <textarea
                className="input-field min-h-[130px] mb-3 text-sm"
                placeholder="Tuliskan jawaban Anda di sini..."
                value={answerContent}
                onChange={e => setAnswerContent(e.target.value)}
              />
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                <Send className="w-4 h-4" /> {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card text-center py-6">
            <p className="text-gray-500 text-sm mb-3">Masuk untuk memberikan jawaban</p>
            <Link href="/login" className="btn-primary inline-block">Masuk</Link>
          </div>
        )}
      </div>
      {showReport && <ReportModal targetType="post" targetId={post.id} onClose={() => setShowReport(false)} />}
    </div>
  );
}
