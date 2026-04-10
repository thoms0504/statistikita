'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Calendar, Eye } from 'lucide-react';
import PDFUploader from '@/components/PDFUploader';
import { adminAPI } from '@/lib/api';
import { PDFFile } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useConfirm } from '@/components/ConfirmDialog';

export default function AdminPDFPage() {
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const confirm = useConfirm();

  const fetchPDFs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPDFs();
      setPdfs(res.data.pdfs);
    } catch {
      toast.error('Gagal memuat daftar PDF');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchPDFs(); }, []);

  const handleDelete = async (id: number, name: string) => {
    const ok = await confirm({
      title: 'Hapus PDF',
      message: `Hapus "${name}"? Data RAG terkait akan ikut dihapus.`,
      confirmText: 'Hapus',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deletePDF(id);
      setPdfs(prev => prev.filter(p => p.id !== id));
      toast.success('PDF berhasil dihapus');
    } catch { toast.error('Gagal menghapus PDF'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Manajemen PDF</h1>
        <p className="text-gray-500 text-sm mt-0.5">Upload dokumen PDF untuk basis pengetahuan chatbot (RAG)</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Uploader */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Upload PDF Baru</h2>
          <PDFUploader onUploaded={fetchPDFs} />
        </div>

        {/* PDF list */}
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Dokumen Tersimpan ({pdfs.length})</h2>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="shimmer h-14 rounded-lg" />)}</div>
          ) : pdfs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Belum ada PDF yang diupload</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pdfs.map(pdf => (
                <div key={pdf.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                  <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{pdf.original_name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(pdf.uploaded_at), 'd MMM yyyy', { locale: id })}</span>
                      {pdf.uploader && <span>· oleh {pdf.uploader}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <a
                      href={`${baseUrl}/uploads/${encodeURIComponent(pdf.filename)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Lihat PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(pdf.id, pdf.original_name)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Hapus PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
