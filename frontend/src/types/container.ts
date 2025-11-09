export interface Container {
    id: number;
    user_id: number;
    container_id: string | null;
    name: string;
    image: string;
    status: 'created' | 'running' | 'stopped' | 'failed';
    cpu_limit: number;
    memory_limit: number;
    disk_limit: number;
    port: number | null;
    env_vars: Record<string, string> | null;
    created_at: string;
    updated_at: string;
    stats?: ContainerStats[];
}

export interface ContainerStats {
    id: number;
    container_id: number;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    network_rx: number;
    network_tx: number;
    created_at: string;
}

export interface CreateContainerDto {
    name: string;
    image: string;
    cpu_limit: number;
    memory_limit: number;
    disk_limit: number;
    env_vars?: Record<string, string>;
}