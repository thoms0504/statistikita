'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import getSocket from '@/lib/socket';

interface PDFUploaderProps {
  onUploaded: () => void;
}

export default function PDFUploader({ onUploaded }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [processPercent, setProcessPercent] = useState(0);
  const [stage, setStage] = useState('');
  const [uploadId, setUploadId] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    const handler = (payload: { upload_id?: string; percent?: number; stage?: string; original_name?: string }) => {
      if (!payload?.upload_id || payload.upload_id !== uploadId) return;
      if (typeof payload.percent === 'number') setProcessPercent(payload.percent);
      if (payload.stage) setStage(payload.stage);
    };
    socket.on('pdf_progress', handler);
    return () => {
      socket.off('pdf_progress', handler);
    };
  }, [uploadId]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 16 * 1024 * 1024,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadPercent(0);
    setProcessPercent(0);
    setStage('Mengunggah file');
    const newUploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setUploadId(newUploadId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_id', newUploadId);
      const res = await adminAPI.uploadPDF(formData, {
        onUploadProgress: (evt: any) => {
          const total = evt.total || 0;
          if (!total) return;
          const percent = Math.round((evt.loaded / total) * 100);
          setUploadPercent(percent);
        }
      });
      toast.success(res.data.message);
      setFile(null);
      setStage('Selesai');
      onUploaded();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Gagal mengupload PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Lepaskan file di sini...' : 'Drag & drop file PDF, atau klik untuk memilih'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Maks. 16MB · Hanya file PDF</p>
      </div>

      {file && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
          <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
        </div>
      )}

      {(uploading || processPercent > 0) && (
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Upload</span>
              <span>{uploadPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadPercent}%` }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Proses</span>
              <span>{processPercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${processPercent}%` }} />
            </div>
            {stage && <p className="text-xs text-gray-400 mt-1">{stage}</p>}
          </div>
        </div>
      )}

      <button className="btn-primary w-full" onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Mengupload & Memproses...' : 'Upload PDF'}
      </button>
    </div>
  );
}
