'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { Bell, Check, CheckCheck } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at: string | null;
  created_at: string;
}

async function getNotifications() {
  const res = await api.get('/notifications');
  return res.data;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user,
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bildirishnomalar</h2>
          <p className="text-gray-600 mb-6">
            Bildirishnomalarni ko'rish uchun tizimga kiring
          </p>
          <a
            href="/auth/login"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tizimga kirish
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-600">Xatolik yuz berdi</div>;

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

  const unreadNotifications = notifications?.data?.filter((n: Notification) => !n.read_at) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Bell className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Bildirishnomalar</h1>
        </div>
        {unreadNotifications.length > 0 && (
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Barchasini o'qilgan deb belgilash
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications?.data && notifications.data.length > 0 ? (
        <div className="space-y-4">
          {notifications.data.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border p-6 transition-colors ${
                !notification.read_at ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getNotificationLink(notification) !== '#' && (
                          <Link
                            href={getNotificationLink(notification)}
                            className="text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            Ko'rish →
                          </Link>
                        )}
                        {!notification.read_at && (
                          <button
                            onClick={() => markAsReadMutation.mutate(notification.id)}
                            disabled={markAsReadMutation.isPending}
                            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            O'qilgan deb belgilash
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Bildirishnomalar yo'q</h3>
          <p className="text-gray-600">
            Yangi bildirishnomalar paydo bo'lganda bu yerda ko'rasiz
          </p>
        </div>
      )}
    </div>
  );
}