'use client';
import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/providers/AuthProvider';

interface VoteButtonsProps {
  type: 'post' | 'comment';
  id: number;
  score: number;
  className?: string;
}

export default function VoteButtons({ type, id, score, className = '' }: VoteButtonsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentScore, setCurrentScore] = useState(score);

  // Get current user vote
  const { data: userVote } = useQuery({
    queryKey: ['vote', type, id],
    queryFn: async () => {
      const res = await api.get(`/vote/${type}/${id}`);
      return res.data.vote;
    },
    enabled: !!user,
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async (value: number) => {
      const res = await api.post('/vote', {
        votable_type: type,
        votable_id: id,
        value: value
      });
      return res.data;
    },
    onSuccess: (data) => {
      setCurrentScore(data.score);
      queryClient.setQueryData(['vote', type, id], data.vote);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  });

  const handleVote = (value: number) => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/auth/login';
      return;
    }

    // If clicking the same vote, remove it (set to 0)
    const newValue = userVote === value ? 0 : value;
    voteMutation.mutate(newValue);
  };

  if (!user) {
    return (
      <div className={`flex flex-col items-center space-y-1 ${className}`}>
        <button
          onClick={() => handleVote(1)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Kirish kerak"
        >
          <ChevronUp className="w-5 h-5 text-gray-400" />
        </button>
        <span className="text-sm font-medium text-gray-600">{currentScore}</span>
        <button
          onClick={() => handleVote(-1)}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Kirish kerak"
        >
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center space-y-1 ${className}`}>
      <button
        onClick={() => handleVote(1)}
        disabled={voteMutation.isPending}
        className={`p-1 rounded transition-colors disabled:opacity-50 ${
          userVote === 1
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'text-gray-400 hover:bg-gray-100 hover:text-green-600'
        }`}
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      
      <span className={`text-sm font-medium ${
        userVote === 1 ? 'text-green-600' : 
        userVote === -1 ? 'text-red-600' : 
        'text-gray-600'
      }`}>
        {currentScore}
      </span>
      
      <button
        onClick={() => handleVote(-1)}
        disabled={voteMutation.isPending}
        className={`p-1 rounded transition-colors disabled:opacity-50 ${
          userVote === -1
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'text-gray-400 hover:bg-gray-100 hover:text-red-600'
        }`}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}