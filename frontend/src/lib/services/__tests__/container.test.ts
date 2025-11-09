// container.test.ts
import { describe, it, expect, vi } from 'vitest';
import { api } from '../api';
import {
  getUserContainers,
  getContainerStats,
  startContainer,
  stopContainer,
  createContainer,
  deleteContainer,
  updateContainerSpecs
} from './containers';

vi.mock('../api');

describe('Container Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch user containers', async () => {
    const mockContainers = [{ id: '1', name: 'test-container' }];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockContainers });

    const result = await getUserContainers(1);
    
    expect(api.get).toHaveBeenCalledWith('/containers/user/1');
    expect(result).toEqual(mockContainers);
  });

  it('should fetch container stats', async () => {
    const mockStats = { cpu_usage: 50, memory_usage: 128 };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockStats });

    const result = await getContainerStats('container-1');
    
    expect(api.get).toHaveBeenCalledWith('/containers/container-1/stats');
    expect(result).toEqual(mockStats);
  });

  it('should start container', async () => {
    const mockResponse = { status: 'running' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await startContainer('container-1');
    
    expect(api.post).toHaveBeenCalledWith('/containers/container-1/start');
    expect(result).toEqual(mockResponse);
  });

  it('should stop container', async () => {
    const mockResponse = { status: 'stopped' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await stopContainer('container-1');
    
    expect(api.post).toHaveBeenCalledWith('/containers/container-1/stop');
    expect(result).toEqual(mockResponse);
  });

  it('should create container with specs', async () => {
    const mockSpecs = {
      cpu_limit: 2,
      memory_limit: 128,
      disk_limit: 512,
      is_active: true
    };
    const mockResponse = { id: 'new-container', ...mockSpecs };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await createContainer(1, mockSpecs);
    
    expect(api.post).toHaveBeenCalledWith('/containers/create', {
      user_id: 1,
      ...mockSpecs
    });
    expect(result).toEqual(mockResponse);
  });

  it('should delete container', async () => {
    const mockResponse = { success: true };
    vi.mocked(api.delete).mockResolvedValueOnce({ data: mockResponse });

    const result = await deleteContainer('container-1');
    
    expect(api.delete).toHaveBeenCalledWith('/containers/container-1');
    expect(result).toEqual(mockResponse);
  });

  it('should update container specs', async () => {
    const mockSpecs = { cpu_limit: 4 };
    const mockResponse = { success: true };
    vi.mocked(api.put).mockResolvedValueOnce({ data: mockResponse });

    const result = await updateContainerSpecs('container-1', mockSpecs);
    
    expect(api.put).toHaveBeenCalledWith('/containers/container-1/specs', mockSpecs);
    expect(result).toEqual(mockResponse);
  });
});