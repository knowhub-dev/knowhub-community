'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cpu, Server, Database, Users, Activity } from 'lucide-react';
import { api } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ContainersTab from '@/components/features/containers/ContainersTab';

// Types for system resources
interface SystemResources {
  cpu_usage: number;
  memory_total: number;
  memory_used: number;
  disk_total: number;
  disk_used: number;
  container_count: number;
  active_users: number;
}

// Types for container stats
interface ContainerStats {
  total: number;
  running: number;
  stopped: number;
  error: number;
}

export default function SystemMonitorPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['system-resources'],
    queryFn: async () => {
      const res = await api.get('/admin/system/resources');
      return res.data as SystemResources;
    },
    refetchInterval: 30000, // Her 30 sekundda yangilansin
  });

  const { data: containerStats, isLoading: statsLoading } = useQuery({
    queryKey: ['container-stats'],
    queryFn: async () => {
      const res = await api.get('/admin/system/containers');
      return res.data as ContainerStats;
    },
    refetchInterval: 30000,
  });

  if (resourcesLoading || statsLoading) {
    return <LoadingSpinner />;
  }

  const tabs = [
    { id: 'overview', name: 'Umumiy', icon: Activity },
    { id: 'containers', name: 'Containerlar', icon: Server },
    { id: 'users', name: 'Foydalanuvchilar', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Tizim monitoringi</h1>
          <p className="mt-1 text-sm text-gray-500">
            Server resurslarini kuzatish va boshqarish
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  ${selectedTab === tab.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'}
                    px-3 py-2 font-medium text-sm rounded-md inline-flex items-center
                `}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && resources && (
          <div className="space-y-6">
            {/* System Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* CPU Usage */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Cpu className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          CPU yuklanishi
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {resources.cpu_usage}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${resources.cpu_usage}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Server className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          RAM xotira
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {Math.round((resources.memory_used / resources.memory_total) * 100)}%
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            {Math.round(resources.memory_used / 1024)} GB / {Math.round(resources.memory_total / 1024)} GB
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${(resources.memory_used / resources.memory_total) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disk Usage */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Database className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Disk xotira
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {Math.round((resources.disk_used / resources.disk_total) * 100)}%
                          </div>
                          <div className="ml-2 text-sm text-gray-500">
                            {Math.round(resources.disk_used / 1024)} GB / {Math.round(resources.disk_total / 1024)} GB
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${(resources.disk_used / resources.disk_total) * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Users */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Faol foydalanuvchilar
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {resources.active_users}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm text-gray-500">
                    So'nggi 24 soat ichida
                  </div>
                </div>
              </div>
            </div>

            {/* Container Stats */}
            {containerStats && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Container holati</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Jami</div>
                    <div className="text-2xl font-semibold">{containerStats.total}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ishlamoqda</div>
                    <div className="text-2xl font-semibold text-green-600">{containerStats.running}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">To'xtatilgan</div>
                    <div className="text-2xl font-semibold text-gray-600">{containerStats.stopped}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Xatolik</div>
                    <div className="text-2xl font-semibold text-red-600">{containerStats.error}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Containers Tab */}
        {selectedTab === 'containers' && (
          <ContainersTab userId={1} userXp={1000} />
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                Foydalanuvchilar bo'limi
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                (Ishlab chiqish jarayonida...)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}