import { describe, it, expect, vi, beforeEach } from 'vitest';

import { api } from '../api';
import {
  containerService,
  deleteContainer,
  getContainerStats,
  startContainer,
  stopContainer,
} from '../containers';

vi.mock('../api');

const mockId = 1;

describe('containerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches containers list', async () => {
    const mockContainers = [{ id: mockId, name: 'demo' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockContainers });

    const result = await containerService.getContainers();

    expect(api.get).toHaveBeenCalledWith('/api/v1/containers');
    expect(result).toEqual(mockContainers);
  });

  it('fetches container stats through helper', async () => {
    const mockStats = { cpu_usage: 42, memory_usage: 128 };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockStats });

    const result = await getContainerStats(mockId);

    expect(api.get).toHaveBeenCalledWith(`/api/v1/containers/${mockId}/stats`);
    expect(result).toEqual(mockStats);
  });

  it('starts container with shared action helper', async () => {
    const mockResponse = { id: mockId, status: 'running' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await startContainer(mockId);

    expect(api.post).toHaveBeenCalledWith(`/api/v1/containers/${mockId}/start`);
    expect(result).toEqual(mockResponse);
  });

  it('stops container with shared action helper', async () => {
    const mockResponse = { id: mockId, status: 'stopped' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await stopContainer(mockId);

    expect(api.post).toHaveBeenCalledWith(`/api/v1/containers/${mockId}/stop`);
    expect(result).toEqual(mockResponse);
  });

  it('deletes container', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: null } as never);

    await deleteContainer(mockId);

    expect(api.delete).toHaveBeenCalledWith(`/api/v1/containers/${mockId}`);
  });
});
