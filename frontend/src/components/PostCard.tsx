import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';
import { Post } from '@/types';
import { TagBadge, UserAvatar } from './TagBadge';
import VoteButtons from './VoteButtons';

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="card card-hover">
      <div className="flex gap-3">
        {/* Vote */}
        <div className="flex-shrink-0">
          <VoteButtons
            targetType="post"
            targetId={post.id}
            initialCount={post.vote_count}
            initialVote={post.user_vote}
            orientation="vertical"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link href={`/forum/${post.id}`}>
            <h3 className="font-semibold text-slate-900 hover:text-blue-600 transition-colors line-clamp-2 mb-1.5">
              {post.judul}
            </h3>
          </Link>
          <p className="text-slate-500 text-sm line-clamp-2 mb-3">{post.deskripsi}</p>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.map(tag => <TagBadge key={tag.id} tag={tag} />)}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <UserAvatar name={post.author?.nama_lengkap || '?'} src={post.author?.avatar_url} role={post.author?.role} size="sm" />
              <span className="font-medium text-slate-600">{post.author?.username}</span>
              <span>-</span>
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: id })}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {post.answer_count} jawaban
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
