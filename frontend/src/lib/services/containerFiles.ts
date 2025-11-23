import { api } from '../api';
import { ContainerFileEntry } from '@/types/containerFiles';

const BASE_URL = '/api/v1/containers';

export const listFiles = async (containerId: number, path = ''): Promise<ContainerFileEntry[]> => {
  const response = await api.get(`${BASE_URL}/${containerId}/files`, { params: { path } });
  return response.data;
};

export const getFileContent = async (containerId: number, path: string): Promise<{ path: string; content: string }> => {
  const response = await api.get(`${BASE_URL}/${containerId}/files/show`, { params: { path } });
  return response.data;
};

export const uploadFile = async (containerId: number, path: string, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('path', path);
  formData.append('file', file);
  await api.post(`${BASE_URL}/${containerId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const createFolder = async (containerId: number, path: string, folderName: string): Promise<void> => {
  const formData = new FormData();
  formData.append('path', path);
  formData.append('folder', folderName);
  await api.post(`${BASE_URL}/${containerId}/files`, formData);
};

export const saveFile = async (containerId: number, path: string, content: string): Promise<void> => {
  await api.put(`${BASE_URL}/${containerId}/files`, { path, content });
};

export const containerFileService = {
  listFiles,
  getFileContent,
  uploadFile,
  createFolder,
  saveFile,
};
