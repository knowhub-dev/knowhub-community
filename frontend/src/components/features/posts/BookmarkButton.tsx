'use client';
import { useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface BookmarkButtonProps {
  postId: number;
  className?: string;
}

export default function BookmarkButton({ postId, className = '' }: BookmarkButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if bookmarked
  const { data: isBookmarked } = useQuery({
    queryKey: ['bookmark', postId],
    queryFn: async () => {
      const res = await api.get(`/bookmarks/check/${postId}`);
      return res.data.bookmarked;
    },
    enabled: !!user,
  });

  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/bookmarks/toggle', { post_id: postId });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['bookmark', postId], data.bookmarked);
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  if (!user) return null;

  return (
    <button
      onClick={() => toggleBookmarkMutation.mutate()}
      disabled={toggleBookmarkMutation.isPending}
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
        isBookmarked 
          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      <span className="text-sm">
        {isBookmarked ? 'Saqlangan' : 'Saqlash'}
      </span>
    </button>
  );
}