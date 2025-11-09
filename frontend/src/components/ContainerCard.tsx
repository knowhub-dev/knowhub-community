'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Container } from '@/types/container';
import { Play, Square, RefreshCw, Trash2, Settings, Server, Cpu, HardDrive, Memory } from 'lucide-react';
import { startContainer, stopContainer, deleteContainer, getContainerStats } from '@/lib/services/containers';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ContainerCardProps {
  container: Container;
  onRefresh?: () => void;
}

export default function ContainerCard({ container, onRefresh }: ContainerCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const queryClient = useQueryClient();

  // Container stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['container-stats', container.id],
    queryFn: () => getContainerStats(container.id),
    enabled: container.status === 'running',
    refetchInterval: 30000, // Her 30 sekundda yangilanadi
  });

  // Start container
  const startMutation = useMutation({
    mutationFn: () => startContainer(container.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
      if (onRefresh) onRefresh();
    },
  });

  // Stop container
  const stopMutation = useMutation({
    mutationFn: () => stopContainer(container.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
      if (onRefresh) onRefresh();
    },
  });

  // Delete container
  const deleteMutation = useMutation({
    mutationFn: () => deleteContainer(container.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
      if (onRefresh) onRefresh();
    },
  });

  const getStatusColor = (status: Container['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-600';
      case 'stopped':
        return 'text-gray-600';
      case 'failed':
        return 'text-red-600';
      case 'created':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{container.name}</h3>
          <p className="text-sm text-gray-500">{container.image}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(container.status)}`}>
          {container.status}
        </span>
      </div>

      {/* Specs & Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {stats?.cpu_usage ?? container.cpu_limit}%
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Memory className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {stats?.memory_usage ?? container.memory_limit}MB
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {stats?.disk_usage ?? container.disk_limit}MB
          </span>
        </div>
      </div>

      {/* Port */}
      {container.port && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Port</h4>
          <div className="text-sm text-gray-600">
            {container.port}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 mt-4">
        {container.status === 'running' ? (
          <button
            onClick={() => stopMutation.mutate()}
            disabled={stopMutation.isPending}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Square className="w-4 h-4 mr-1" />
            To'xtatish
          </button>
        ) : (
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Play className="w-4 h-4 mr-1" />
            Ishga tushirish
          </button>
        )}

        <button
          onClick={() => onRefresh?.()}
          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Yangilash
        </button>

        <button
          onClick={() => setShowConfirmDelete(true)}
          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          O'chirish
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Containerini o'chirishni tasdiqlang
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Bu amalni qaytarib bo'lmaydi. Container va uning barcha ma'lumotlari o'chiriladi.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate();
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}