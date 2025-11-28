'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { containerService } from '@/lib/services/containers';

interface UseContainerActionsOptions {
  onChange?: () => void;
}

export function useContainerActions(
  containerId: number,
  { onChange }: UseContainerActionsOptions = {},
) {
  const queryClient = useQueryClient();

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['containers'] });
    queryClient.invalidateQueries({ queryKey: ['container', containerId] });
    queryClient.invalidateQueries({ queryKey: ['container-stats', containerId] });
  };

  const start = useMutation({
    mutationFn: () => containerService.startContainer(containerId),
    onSettled: () => {
      invalidateRelatedQueries();
      onChange?.();
    },
  });

  const stop = useMutation({
    mutationFn: () => containerService.stopContainer(containerId),
    onSettled: () => {
      invalidateRelatedQueries();
      onChange?.();
    },
  });

  const remove = useMutation({
    mutationFn: () => containerService.deleteContainer(containerId),
    onSettled: () => {
      invalidateRelatedQueries();
      onChange?.();
    },
  });

  return { start, stop, remove };
}
