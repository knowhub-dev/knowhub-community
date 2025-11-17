export interface Container {
    id: number;
    user_id: number;
    container_id: string | null;
    name: string;
    subdomain?: string | null;
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
    subdomain?: string;
    image: string;
    cpu_limit: number;
    memory_limit: number;
    disk_limit: number;
    env_vars?: Record<string, string>;
}

export interface ContainerOptions {
    allowed_images: string[];
    max_containers_per_user: number | null;
    current_count: number;
    remaining_slots: number | null;
    can_create: boolean;
    min_xp_required: number;
    max_env_vars: number;
    env_value_max_length: number;
    domain_suffix?: string | null;
    reserved_subdomains?: string[];
    subdomain_min_length?: number;
    subdomain_max_length?: number;
    mini_services?: {
        enabled: boolean;
        min_xp_required: number;
        max_per_user: number | null;
        git_clone_enabled: boolean;
        mysql_instances_per_user: number;
    };
}