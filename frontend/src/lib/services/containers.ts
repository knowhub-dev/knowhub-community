import { api } from '../api';
import { Container, CreateContainerDto, ContainerStats, ContainerOptions } from '@/types/container';

const BASE_URL = '/api/v1/admin/containers';

export const getContainerStats = async (id: number): Promise<ContainerStats> => {
    const response = await api.get(`${BASE_URL}/${id}/stats`);
    return response.data;
};

export const startContainer = async (id: number): Promise<Container> => {
    const response = await api.post(`${BASE_URL}/${id}/start`);
    return response.data;
};

export const stopContainer = async (id: number): Promise<Container> => {
    const response = await api.post(`${BASE_URL}/${id}/stop`);
    return response.data;
};

export const deleteContainer = async (id: number): Promise<void> => {
    await api.delete(`${BASE_URL}/${id}`);
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
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    async createContainer(data: CreateContainerDto): Promise<Container> {
        const response = await api.post(BASE_URL, data);
        return response.data;
    },

    async startContainer(id: number): Promise<Container> {
        const response = await api.post(`${BASE_URL}/${id}/start`);
        return response.data;
    },

    async stopContainer(id: number): Promise<Container> {
        const response = await api.post(`${BASE_URL}/${id}/stop`);
        return response.data;
    },

    async deleteContainer(id: number): Promise<void> {
        await api.delete(`${BASE_URL}/${id}`);
    },

    async getContainerStats(id: number): Promise<ContainerStats> {
        const response = await api.get(`${BASE_URL}/${id}/stats`);
        return response.data;
    }
};