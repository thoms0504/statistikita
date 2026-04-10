'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatWindow />
    </div>
  );
}
