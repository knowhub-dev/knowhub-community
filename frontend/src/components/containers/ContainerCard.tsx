'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Square, RefreshCw, Trash2, Cpu, HardDrive, MemoryStick } from 'lucide-react';

import { useContainerActions } from '@/lib/hooks/useContainerActions';
import { containerService } from '@/lib/services/containers';
import type { Container } from '@/types/container';

interface ContainerCardProps {
  container: Container;
  onRefresh?: () => void;
}

export default function ContainerCard({ container, onRefresh }: ContainerCardProps) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { start, stop, remove } = useContainerActions(container.id, {
    onChange: onRefresh,
  });

  // Container stats
  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['container-stats', container.id],
    queryFn: () => containerService.getContainerStats(container.id),
    enabled: container.status === 'running',
    refetchInterval: 30000, // Her 30 sekundda yangilanadi
  });

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }

    refetchStats();
  };

  const isBusy = start.isPending || stop.isPending || remove.isPending;

  const getStatusColor = (status: Container['status']) => {
    switch (status) {
      case 'running':
        return 'text-[hsl(var(--accent-green))]';
      case 'stopped':
        return 'text-muted-foreground';
      case 'failed':
        return 'text-[hsl(var(--accent-red))]';
      case 'created':
        return 'text-[hsl(var(--accent-blue))]';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-border p-4 text-[hsl(var(--foreground))]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">{container.name}</h3>
          <p className="text-sm text-muted-foreground">{container.image}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(container.status)}`}>
          {container.status}
        </span>
      </div>

      {/* Specs & Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-[hsl(var(--foreground))]">
            {stats?.cpu_usage ?? container.cpu_limit}%
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <MemoryStick className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-[hsl(var(--foreground))]">
            {stats?.memory_usage ?? container.memory_limit}MB
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-[hsl(var(--foreground))]">
            {stats?.disk_usage ?? container.disk_limit}MB
          </span>
        </div>
      </div>

      {/* Port */}
      {container.port && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-[hsl(var(--foreground))] mb-2">Port</h4>
          <div className="text-sm text-muted-foreground">
            {container.port}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 mt-4">
        {container.status === 'running' ? (
          <button
            onClick={() => stop.mutate()}
            disabled={isBusy}
            className="inline-flex items-center px-2.5 py-1.5 border border-border text-xs font-medium rounded text-[hsl(var(--foreground))] bg-[hsl(var(--surface))] hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]"
          >
            <Square className="w-4 h-4 mr-1" />
            To'xtatish
          </button>
        ) : (
          <button
            onClick={() => start.mutate()}
            disabled={isBusy}
            className="inline-flex items-center px-2.5 py-1.5 border border-border text-xs font-medium rounded text-[hsl(var(--foreground))] bg-[hsl(var(--surface))] hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]"
          >
            <Play className="w-4 h-4 mr-1" />
            Ishga tushirish
          </button>
        )}

        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-2.5 py-1.5 border border-border text-xs font-medium rounded text-[hsl(var(--foreground))] bg-[hsl(var(--surface))] hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Yangilash
        </button>

        <button
          onClick={() => setShowConfirmDelete(true)}
          disabled={remove.isPending}
          className="inline-flex items-center px-2.5 py-1.5 border border-[hsl(var(--accent-red))] text-xs font-medium rounded text-[hsl(var(--accent-red))] bg-[hsl(var(--surface))] hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--primary))]"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          O'chirish
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop:bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[hsl(var(--card))] rounded-lg p-6 max-w-sm mx-auto text-[hsl(var(--foreground))]">
            <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-4">
              Containerini o'chirishni tasdiqlang
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bu amalni qaytarib bo'lmaydi. Container va uning barcha ma'lumotlari o'chiriladi.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-[hsl(var(--foreground))] bg-[hsl(var(--surface))] border border-border rounded-md hover:bg-muted"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  remove.mutate();
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--accent-red))] border border-transparent rounded-md hover:bg-[hsl(var(--accent-red))]/90"
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