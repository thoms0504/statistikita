'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { forumAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface VoteButtonsProps {
  targetType: 'post' | 'answer';
  targetId: number;
  initialCount: number;
  initialVote?: number | null;
  orientation?: 'vertical' | 'horizontal';
}

export default function VoteButtons({
  targetType, targetId, initialCount, initialVote, orientation = 'vertical'
}: VoteButtonsProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [voteCount, setVoteCount] = useState<number>(Number(initialCount) || 0);
  const [userVote, setUserVote] = useState<number | null>(initialVote ?? null);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated) {
      toast.error('Silakan masuk untuk memberikan vote');
      router.push('/login');
      return;
    }
    if (loading) return;
    setLoading(true);

    // Optimistic UI
    const prevCount = voteCount;
    const prevVote = userVote;

    if (userVote === value) {
      setVoteCount(prev => prev - value);
      setUserVote(null);
    } else {
      const delta = userVote ? value * 2 : value;
      setVoteCount(prev => prev + delta);
      setUserVote(value);
    }

    try {
      await forumAPI.vote(targetType, targetId, value);
    } catch {
      setVoteCount(prevCount);
      setUserVote(prevVote);
      toast.error('Gagal memberikan vote');
    } finally {
      setLoading(false);
    }
  };

  const isVertical = orientation === 'vertical';

  return (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-1 rounded-2xl bg-white/80 border border-white/70 px-1.5 py-1.5 shadow-sm`}>
      <button
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`p-1.5 rounded-full transition-colors ${
          userVote === 1 ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50'
        }`}
        title="Upvote"
      >
        <ThumbsUp className="w-4 h-4" />
      </button>
      <span className={`text-sm font-semibold ${voteCount > 0 ? 'text-blue-600' : voteCount < 0 ? 'text-red-500' : 'text-gray-500'}`}>
        {voteCount}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`p-1.5 rounded-full transition-colors ${
          userVote === -1 ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
        }`}
        title="Downvote"
      >
        <ThumbsDown className="w-4 h-4" />
      </button>
    </div>
  );
}
