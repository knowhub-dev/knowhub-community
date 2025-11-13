'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { containerService } from '@/lib/services/containers';
import ContainerCard from '@/components/ContainerCard';
import { Server, Plus } from 'lucide-react';
import { Container, CreateContainerDto } from '@/types/container';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

const DEFAULT_CONTAINER: CreateContainerDto = {
  name: '',
  subdomain: '',
  image: '',
  cpu_limit: 1,
  memory_limit: 512,
  disk_limit: 1024,
};

export default function ContainersTab() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateContainerDto>(DEFAULT_CONTAINER);
  const queryClient = useQueryClient();
  
  // Get containers
  const { data: options } = useQuery({
    queryKey: ['containers', 'options'],
    queryFn: containerService.getOptions,
  });

  const { data: containers = [], isLoading } = useQuery({
    queryKey: ['containers'],
    queryFn: containerService.getContainers,
  });

  const allowedImages = options?.allowed_images ?? [];
  const domainSuffix = options?.domain_suffix ?? null;
  const reservedSubdomains = options?.reserved_subdomains ?? [];
  const subdomainMin = options?.subdomain_min_length ?? 3;
  const subdomainMax = options?.subdomain_max_length ?? 30;
  const remainingSlots = options?.remaining_slots ?? null;
  const isCreateDisabled =
    !options ||
    !allowedImages.length ||
    !options.can_create ||
    (remainingSlots !== null && remainingSlots <= 0);

  useEffect(() => {
    if (!allowedImages.length) {
      return;
    }

    setFormData((prev) => {
      if (allowedImages.includes(prev.image)) {
        return prev;
      }

      return {
        ...prev,
        image: allowedImages[0],
      };
    });
  }, [allowedImages]);

  // Create container
  const createMutation = useMutation({
    mutationFn: containerService.createContainer,
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
      setIsDialogOpen(false);
      setFormData({
        ...DEFAULT_CONTAINER,
        image: allowedImages[0] ?? '',
      });
    },
  });

  // Start container
  const startMutation = useMutation({
    mutationFn: containerService.startContainer,
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
    },
  });

  // Stop container
  const stopMutation = useMutation({
    mutationFn: containerService.stopContainer,
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
    },
  });

  // Delete container
  const deleteMutation = useMutation({
    mutationFn: containerService.deleteContainer,
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreateDisabled) {
      return;
    }

    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Containers</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isCreateDisabled}>
              <Plus className="w-4 h-4 mr-2" />
              Create Container
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Container</DialogTitle>
              <DialogDescription>
                Configure and create a new container instance.
              </DialogDescription>
            </DialogHeader>
            {isCreateDisabled && (
              <div className="rounded-md bg-red-50 border border-red-200 text-red-600 text-sm p-3">
                You cannot create additional containers yet. Ensure you meet the XP requirement and have available slots.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center">
                  <Input
                    id="subdomain"
                    value={formData.subdomain ?? ''}
                    onChange={(e) =>
                      setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })
                    }
                    placeholder="project"
                    className="rounded-r-none"
                    minLength={subdomainMin}
                    maxLength={subdomainMax}
                  />
                  <span className="inline-flex h-9 items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {domainSuffix ? `.${domainSuffix}` : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {subdomainMin}-{subdomainMax} ta kichik harf, raqam yoki tiredan foydalaning.
                </p>
                {domainSuffix && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    To'liq manzil: {formData.subdomain ? `${formData.subdomain}.${domainSuffix}` : `*.${domainSuffix}`}
                  </p>
                )}
                {reservedSubdomains.length > 0 && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Band subdomenlar: {reservedSubdomains.join(', ')}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <select
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  {allowedImages.map((image) => (
                    <option key={image} value={image}>
                      {image}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpu_limit">CPU Limit (cores)</Label>
                <Input
                  id="cpu_limit"
                  type="number"
                  min={1}
                  max={4}
                  value={formData.cpu_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cpu_limit: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memory_limit">Memory Limit (MB)</Label>
                <Input
                  id="memory_limit"
                  type="number"
                  min={128}
                  max={2048}
                  step={128}
                  value={formData.memory_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      memory_limit: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disk_limit">Disk Limit (MB)</Label>
                <Input
                  id="disk_limit"
                  type="number"
                  min={1024}
                  max={10240}
                  step={1024}
                  value={formData.disk_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      disk_limit: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={createMutation.isPending || isCreateDisabled}
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {options && (
        <div className="rounded-md border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium">Security constraints</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Allowed images: {allowedImages.join(', ') || '—'}</li>
            <li>
              Containers remaining:{' '}
              {remainingSlots === null ? 'Unlimited' : remainingSlots} /
              {' '}
              {options.max_containers_per_user === null
                ? 'Unlimited'
                : options.max_containers_per_user}
            </li>
            <li>Minimum XP required: {options.min_xp_required}</li>
          </ul>
        </div>
      )}

      <div className="grid gap-6">
        {containers.map((container: Container) => (
          <ContainerCard
            key={container.id}
            container={container}
            onStart={() => startMutation.mutate(container.id)}
            onStop={() => stopMutation.mutate(container.id)}
            onDelete={() => {
              if (window.confirm('Are you sure you want to delete this container?')) {
                deleteMutation.mutate(container.id);
              }
            }}
          />
        ))}

        {containers.length === 0 && (
          <div className="text-center py-12">
            <Server className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No containers yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new container.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}