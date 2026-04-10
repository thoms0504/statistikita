'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { forumAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReportModalProps {
  targetType: 'post' | 'answer';
  targetId: number;
  onClose: () => void;
}

export default function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) { toast.error('Alasan laporan wajib diisi'); return; }
    setSubmitting(true);
    try {
      await forumAPI.report(targetType, targetId, reason);
      toast.success('Laporan berhasil dikirim');
      onClose();
    } catch {
      toast.error('Gagal mengirim laporan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Laporkan Konten</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan Laporan</label>
          <textarea
            className="input-field min-h-[100px] text-sm"
            placeholder="Jelaskan mengapa konten ini perlu dilaporkan..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>
        <div className="flex gap-2 px-4 pb-4">
          <button className="btn-secondary flex-1" onClick={onClose}>Batal</button>
          <button className="btn-danger flex-1" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </div>
      </div>
    </div>
  );
}
