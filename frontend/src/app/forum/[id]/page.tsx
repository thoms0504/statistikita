import ForumDetailClient from './ForumDetailClient';
import { Post, Answer } from '@/types';

export const dynamic = 'force-dynamic';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
  .replace('localhost', '127.0.0.1');

async function getPostDetail(postId: number): Promise<{ post: Post | null; answers: Answer[] }> {
  try {
    const res = await fetch(`${API_URL}/api/forum/posts/${postId}`, { cache: 'no-store' });
    if (!res.ok) return { post: null, answers: [] };
    const data = await res.json();
    return { post: data.post ?? null, answers: data.answers ?? [] };
  } catch {
    return { post: null, answers: [] };
  }
}

export default async function ForumDetailPage({ params }: { params: { id: string } }) {
  const postId = Number(params.id);
  if (!Number.isFinite(postId)) {
    return <ForumDetailClient postId={0} initialPost={null} initialAnswers={[]} />;
  }

  const { post, answers } = await getPostDetail(postId);
  return <ForumDetailClient postId={postId} initialPost={post} initialAnswers={answers} />;
}
