'use client';

import { useState } from 'react';
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

const DEFAULT_CONTAINER = {
  name: '',
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
  const { data: containers = [], isLoading } = useQuery({
    queryKey: ['containers'],
    queryFn: containerService.getContainers,
  });

  // Create container
  const createMutation = useMutation({
    mutationFn: containerService.createContainer,
    onSuccess: () => {
      queryClient.invalidateQueries(['containers']);
      setIsDialogOpen(false);
      setFormData(DEFAULT_CONTAINER);
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
            <Button>
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
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  required
                />
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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