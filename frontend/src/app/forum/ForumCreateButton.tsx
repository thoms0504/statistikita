'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ForumCreateButtonProps {
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export default function ForumCreateButton({
  label = 'Buat Pertanyaan',
  className = 'btn-primary flex items-center gap-2',
  showIcon = true,
}: ForumCreateButtonProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <Link href="/forum/ask" className={className}>
      {showIcon && <Plus className="w-4 h-4" />} {label}
    </Link>
  );
}
