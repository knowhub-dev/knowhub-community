'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NotificationPayload {
  post_slug?: string;
  comment_id?: number;
  follower_username?: string;
  [key: string]: string | number | null | undefined;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: NotificationPayload;
  read_at: string | null;
  created_at: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get unread count
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await api.get('/notifications/unread-count');
      return res.data.count;
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Get notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data.data as Notification[];
    },
    enabled: !!user && isOpen,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await api.post(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'new_post':
        return `/posts/${notification.data?.post_slug}`;
      case 'comment':
        return `/posts/${notification.data?.post_slug}#comment-${notification.data?.comment_id}`;
      case 'vote':
        return `/posts/${notification.data?.post_slug}`;
      case 'follow':
        return `/profile/${notification.data?.follower_username}`;
      default:
        return '#';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_post': return '📝';
      case 'comment': return '💬';
      case 'vote': return '👍';
      case 'follow': return '👤';
      case 'badge': return '🏅';
      default: return '🔔';
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-[hsl(var(--surface))]/80 text-muted-foreground transition hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
      >
        <Bell className="w-5 h-5" />
        {typeof unreadCount === 'number' && unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-[hsl(var(--destructive))] px-1 text-[0.65rem] font-semibold text-[hsl(var(--destructive-foreground))]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-border/70 bg-[hsl(var(--card))]/95 text-[hsl(var(--foreground))] shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <h3 className="text-sm font-semibold">Bildirishnomalar</h3>
            {typeof unreadCount === 'number' && unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary-light))] disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                Barchasini o'qilgan deb belgilash
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-[hsl(var(--primary))]" />
              </div>
            ) : notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'border-b border-border/50 px-4 py-3 text-sm transition hover:bg-[hsl(var(--surface))]',
                    !notification.read_at && 'bg-[hsl(var(--primary))]/5',
                  )}
                >
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => {
                      if (!notification.read_at) {
                        markAsReadMutation.mutate(notification.id);
                      }
                      setIsOpen(false);
                    }}
                    className="block"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString('uz-UZ')}
                        </p>
                      </div>
                      {!notification.read_at && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markAsReadMutation.mutate(notification.id);
                          }}
                          className="text-[hsl(var(--primary))] transition hover:text-[hsl(var(--primary-light))]"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="space-y-3 p-8 text-center text-sm text-muted-foreground">
                <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p>Bildirishnomalar yo'q</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/60 px-4 py-3">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-light))]"
            >
              Barcha bildirishnomalarni ko'rish
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}