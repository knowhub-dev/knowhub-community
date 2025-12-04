import { api } from '../api';
import { ContainerFileEntry } from '@/types/containerFiles';

const BASE_URL = '/api/v1/containers';

export const listFiles = async (containerId: number, path = ''): Promise<ContainerFileEntry[]> => {
  const response = await api.get(`${BASE_URL}/${containerId}/files`, { params: { path } });
  return response.data?.data ?? [];
};

export const getFileContent = async (containerId: number, path: string): Promise<{ path: string; content: string | null }> => {
  const response = await api.get(`${BASE_URL}/${containerId}/files/content`, { params: { path } });
  return { path, content: response.data?.data?.content ?? null };
};

export const saveFile = async (
  containerId: number,
  path: string,
  content: string,
  operation: 'write' | 'append' = 'write',
): Promise<void> => {
  await api.patch(`${BASE_URL}/${containerId}/files/content`, { path, content, operation });
};

export const deleteFile = async (containerId: number, path: string): Promise<void> => {
  await api.delete(`${BASE_URL}/${containerId}/files`, { params: { path } });
};

export const containerFileService = {
  listFiles,
  getFileContent,
  saveFile,
  deleteFile,
};
