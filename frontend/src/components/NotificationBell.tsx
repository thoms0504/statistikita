'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { forumAPI } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Notification } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotifications();

    const socket = getSocket();
    socket.on('notification', (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => { socket.off('notification'); };
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await forumAPI.getNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch {}
  };

  const markRead = async (id: number) => {
    try {
      await forumAPI.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="badge bg-red-100 text-red-600">{unreadCount} baru</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Belum ada notifikasi</div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id}
                  onClick={() => { markRead(notif.id); setOpen(false); }}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm text-gray-800 leading-snug">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                  </p>
                  {notif.ref_id && (
                    <Link href={`/forum/${notif.ref_id}`}
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                      onClick={e => e.stopPropagation()}>
                      Lihat postingan →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
