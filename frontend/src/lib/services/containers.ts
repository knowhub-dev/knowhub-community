import { api } from '../api';
import type {
  Container,
  ContainerLogResponse,
  ContainerOptions,
  ContainerStats,
  CreateContainerDto,
} from '@/types/container';

const BASE_URL = '/containers';

const containerPath = (id: number | string, suffix = '') => `${BASE_URL}/${id}${suffix}`;

const postContainerAction = async <T>(id: number, action: string): Promise<T> => {
  const response = await api.post<T>(containerPath(id, `/${action}`));
  return response.data;
};

const getContainerResource = async <T>(id: number, resource: string): Promise<T> => {
  const response = await api.get<T>(containerPath(id, resource));
  return response.data;
};

export const containerService = {
  async getContainers(): Promise<Container[]> {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  async getOptions(): Promise<ContainerOptions> {
    const response = await api.get(`${BASE_URL}/options`);
    return response.data;
  },

  async getContainer(id: number): Promise<Container> {
    const response = await api.get(containerPath(id));
    return response.data;
  },

  async createContainer(data: CreateContainerDto): Promise<Container> {
    const response = await api.post(BASE_URL, data);
    return response.data;
  },

  async startContainer(id: number): Promise<Container> {
    return postContainerAction<Container>(id, 'start');
  },

  async stopContainer(id: number): Promise<Container> {
    return postContainerAction<Container>(id, 'stop');
  },

  async deleteContainer(id: number): Promise<void> {
    await api.delete(containerPath(id));
  },

  async getContainerStats(id: number): Promise<ContainerStats> {
    return getContainerResource<ContainerStats>(id, '/stats');
  },

  async getContainerLogs(id: number): Promise<ContainerLogResponse> {
    return getContainerResource<ContainerLogResponse>(id, '/logs');
  },

  async updateContainerEnv(id: number, envVars: Record<string, string>): Promise<Container> {
    const response = await api.put(containerPath(id, '/env'), { env_vars: envVars });
    return response.data;
  },
};

export const {
  getContainers,
  getOptions,
  getContainer,
  createContainer,
  startContainer,
  stopContainer,
  deleteContainer,
  getContainerStats,
  getContainerLogs,
  updateContainerEnv,
} = containerService;
