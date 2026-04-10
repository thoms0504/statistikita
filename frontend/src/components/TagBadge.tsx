import Link from 'next/link';
import { Tag } from '@/types';

export function TagBadge({ tag, clickable = true }: { tag: Tag; clickable?: boolean }) {
  const cls = 'badge bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors cursor-pointer';
  if (clickable) {
    return <Link href={`/forum?tag=${encodeURIComponent(tag.name)}`} className={cls}>{tag.name}</Link>;
  }
  return <span className="badge bg-sky-100 text-sky-700">{tag.name}</span>;
}

export function UserAvatar({ name, src, role, size = 'md' }: { name: string; src?: string; role?: 'user' | 'admin'; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const resolvedSrc = src
    ? (src.startsWith('http') || src.startsWith('data:') ? src : `${baseUrl}${src}`)
    : (role === 'admin' ? '/favicon.svg' : null);
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden`}>
      {resolvedSrc ? (
        <img src={resolvedSrc} alt={name} className="w-full h-full object-cover" />
      ) : (
        name?.[0]?.toUpperCase() || '?'
      )}
    </div>
  );
}
