'use client';
import { UserPlus, UserCheck } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface FollowButtonProps {
  userId: number;
  className?: string;
}

export default function FollowButton({ userId, className = '' }: FollowButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if following
  const { data: isFollowing } = useQuery({
    queryKey: ['follow', userId],
    queryFn: async () => {
      const res = await api.get(`/follow/check/${userId}`);
      return res.data.following;
    },
    enabled: !!user && user.id !== userId,
  });

  // Toggle follow mutation
  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/follow/toggle', { user_id: userId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['follow', userId], data.following);
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  if (!user || user.id === userId) return null;

  return (
    <button
      onClick={() => toggleFollowMutation.mutate()}
      disabled={toggleFollowMutation.isPending}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
        isFollowing 
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      } ${className}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-4 h-4" />
          <span>Kuzatilmoqda</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Kuzatish</span>
        </>
      )}
    </button>
  );
}