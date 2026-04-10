'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Pencil, Trash2, Flag } from 'lucide-react';
import { Answer } from '@/types';
import { UserAvatar } from './TagBadge';
import VoteButtons from './VoteButtons';
import { useAuth } from '@/hooks/useAuth';
import { forumAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import ReportModal from './ReportModal';
import { useConfirm } from '@/components/ConfirmDialog';

interface AnswerCardProps {
  answer: Answer;
  onDeleted?: (id: number) => void;
  onUpdated?: (answer: Answer) => void;
}

export default function AnswerCard({ answer, onDeleted, onUpdated }: AnswerCardProps) {
  const { user, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(answer.content);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const confirm = useConfirm();

  const isOwner = user?.id === answer.user_id;

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      const res = await forumAPI.updateAnswer(answer.id, editContent);
      onUpdated?.(res.data.answer);
      setEditing(false);
      toast.success('Jawaban diperbarui');
    } catch {
      toast.error('Gagal memperbarui jawaban');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Hapus jawaban',
      message: 'Yakin ingin menghapus jawaban ini? Tindakan ini tidak bisa dibatalkan.',
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await forumAPI.deleteAnswer(answer.id);
      onDeleted?.(answer.id);
      toast.success('Jawaban dihapus');
    } catch {
      toast.error('Gagal menghapus jawaban');
    }
  };

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <VoteButtons
        targetType="answer"
        targetId={answer.id}
        initialCount={answer.vote_count}
        initialVote={answer.user_vote}
        orientation="vertical"
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div>
            <textarea
              className="input-field min-h-[120px] mb-2 text-sm"
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="btn-primary text-sm py-1.5 px-3" onClick={handleUpdate} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn-secondary text-sm py-1.5 px-3" onClick={() => setEditing(false)}>Batal</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{answer.content}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <UserAvatar name={answer.author?.nama_lengkap || '?'} src={answer.author?.avatar_url} role={answer.author?.role} size="sm" />
            <span className="font-medium text-gray-600">{answer.author?.username}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: id })}</span>
          </div>
          <div className="flex items-center gap-1">
            {!isOwner && (
              <button onClick={() => setShowReport(true)} className="p-1.5 text-gray-400 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-colors" title="Laporkan">
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
            {(isOwner || isAdmin) && !editing && (
              <>
                {isOwner && (
                  <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={handleDelete} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showReport && (
        <ReportModal targetType="answer" targetId={answer.id} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
