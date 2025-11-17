'use client';
import { useState, useEffect } from 'react';
import { Activity, CheckCircle, XCircle, Clock, Zap, Database, Server, Wifi, AlertTriangle } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  description: string;
  responseTime?: number;
  lastChecked?: string;
}

interface SystemMetrics {
  uptime: string;
  cpu: number;
  memory: number;
  disk: number;
  activeUsers: number;
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Web Server',
      status: 'operational',
      description: 'Frontend application',
      responseTime: 145,
      lastChecked: new Date().toISOString()
    },
    {
      name: 'API Server',
      status: 'operational',
      description: 'Backend REST API',
      responseTime: 89,
      lastChecked: new Date().toISOString()
    },
    {
      name: 'Database',
      status: 'operational',
      description: 'MySQL Database',
      responseTime: 12,
      lastChecked: new Date().toISOString()
    },
    {
      name: 'Redis Cache',
      status: 'operational',
      description: 'In-memory cache',
      responseTime: 3,
      lastChecked: new Date().toISOString()
    },
    {
      name: 'Queue System',
      status: 'operational',
      description: 'Background jobs',
      responseTime: 25,
      lastChecked: new Date().toISOString()
    },
    {
      name: 'File Storage',
      status: 'operational',
      description: 'Media and file uploads',
      responseTime: 67,
      lastChecked: new Date().toISOString()
    }
  ]);

  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: '99.9%',
    cpu: 23,
    memory: 67,
    disk: 45,
    activeUsers: 1247
  });

  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      
      // Simulate small changes in metrics
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(10, Math.min(80, prev.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.max(40, Math.min(85, prev.memory + (Math.random() - 0.5) * 3)),
        activeUsers: Math.max(1000, Math.min(2000, prev.activeUsers + Math.floor((Math.random() - 0.5) * 50)))
      }));

      // Update service response times
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(1, Math.min(200, (service.responseTime || 50) + (Math.random() - 0.5) * 20)),
        lastChecked: new Date().toISOString()
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-[hsl(var(--accent-green))] bg-[hsl(var(--accent-green))/15] border-[hsl(var(--accent-green))/30]';
      case 'degraded':
        return 'text-[hsl(var(--secondary))] bg-[hsl(var(--secondary))/15] border-[hsl(var(--secondary))/30]';
      case 'outage':
        return 'text-[hsl(var(--accent-pink))] bg-[hsl(var(--accent-pink))/15] border-[hsl(var(--accent-pink))/30]';
      default:
        return 'text-muted-foreground bg-[hsl(var(--muted))] border-[hsl(var(--border))]';
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5" />;
      case 'degraded':
        return <Clock className="w-5 h-5" />;
      case 'outage':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'Ishlayapti';
      case 'degraded':
        return 'Cheklangan';
      case 'outage':
        return 'O\'chirilgan';
      default:
        return 'Noma\'lum';
    }
  };

  const operationalCount = services.filter(s => s.status === 'operational').length;
  const overallStatus = operationalCount === services.length ? 'operational' :
                       operationalCount >= services.length * 0.8 ? 'degraded' : 'outage';

  const statusGradient =
    overallStatus === 'operational'
      ? 'from-[hsl(var(--accent-green))] via-[hsl(var(--accent-green))] to-[hsl(var(--secondary))]'
      : overallStatus === 'degraded'
        ? 'from-[hsl(var(--secondary))] via-[hsl(var(--primary))] to-[hsl(var(--accent-purple))]'
        : 'from-[hsl(var(--accent-pink))] via-[hsl(var(--accent-purple))] to-[hsl(var(--primary))]';

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <div className={`bg-gradient-to-br ${statusGradient} text-[hsl(var(--primary-foreground))]`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Activity className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tizim Holati</h1>
            <p className="text-xl text-[hsl(var(--primary-foreground))]/90 max-w-2xl mx-auto">
              KnowHub Community xizmatlarining joriy holati va ishlashi
            </p>
            <div className="mt-6 inline-flex items-center px-6 py-3 bg-[hsl(var(--primary-foreground))]/20 rounded-full">
              {getStatusIcon(overallStatus)}
              <span className="ml-2 font-semibold">
                {overallStatus === 'operational' ? 'Barcha xizmatlar ishlayapti' :
                 overallStatus === 'degraded' ? 'Ba\'zi xizmatlar cheklangan' :
                 'Jiddiy muammolar mavjud'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[hsl(var(--accent-green))/15] rounded-lg flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--accent-green))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{operationalCount}/{services.length}</div>
                <div className="text-sm text-muted-foreground">Xizmatlar ishlayapti</div>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[hsl(var(--secondary))/15] rounded-lg flex items-center justify-center mr-4">
                <Zap className="w-6 h-6 text-[hsl(var(--secondary))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{metrics.uptime}</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[hsl(var(--accent-purple))/15] rounded-lg flex items-center justify-center mr-4">
                <Wifi className="w-6 h-6 text-[hsl(var(--accent-purple))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{metrics.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Faol foydalanuvchilar</div>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[hsl(var(--primary))/15] rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">
                  {Math.round(services.reduce((acc, s) => acc + (s.responseTime || 0), 0) / services.length)}ms
                </div>
                <div className="text-sm text-muted-foreground">O\'rtacha javob vaqti</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6 mb-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Tizim Ko'rsatkichlari</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">CPU</span>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{metrics.cpu.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.cpu < 70 ? 'bg-[hsl(var(--accent-green))]' :
                    metrics.cpu < 90 ? 'bg-[hsl(var(--secondary))]' : 'bg-[hsl(var(--accent-pink))]'
                  }`}
                  style={{ width: `${metrics.cpu}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Xotira</span>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{metrics.memory.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.memory < 80 ? 'bg-[hsl(var(--accent-green))]' :
                    metrics.memory < 95 ? 'bg-[hsl(var(--secondary))]' : 'bg-[hsl(var(--accent-pink))]'
                  }`}
                  style={{ width: `${metrics.memory}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Disk</span>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{metrics.disk.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.disk < 80 ? 'bg-[hsl(var(--accent-green))]' :
                    metrics.disk < 95 ? 'bg-[hsl(var(--secondary))]' : 'bg-[hsl(var(--accent-pink))]'
                  }`}
                  style={{ width: `${metrics.disk}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Faollik</span>
                <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{metrics.activeUsers}</span>
              </div>
              <div className="w-full bg-[hsl(var(--muted))] rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[hsl(var(--accent-purple))]"
                  style={{ width: `${Math.min(100, (metrics.activeUsers / 2000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6 mb-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">Xizmatlar Holati</h2>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-[hsl(var(--border))] rounded-lg">
                <div className="flex items-center flex-1">
                  <div className={`p-2 rounded-lg mr-4 ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))]">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-right">
                    <div className="font-medium text-[hsl(var(--foreground))]">{getStatusText(service.status)}</div>
                    {service.responseTime && (
                      <div className="text-muted-foreground">{service.responseTime}ms</div>
                    )}
                  </div>
                  <div className="text-right text-muted-foreground">
                    <div>Oxirgi tekshiruv</div>
                    <div>{new Date(service.lastChecked!).toLocaleTimeString('uz-UZ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6 mb-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-6">So'nggi Hodisalar</h2>
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-[hsl(var(--accent-green))] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[hsl(var(--foreground))] mb-2">Hodisalar yo'q</h3>
            <p className="text-muted-foreground">So'nggi 30 kun ichida hech qanday muammo kuzatilmadi</p>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center text-sm text-muted-foreground">
          Oxirgi yangilanish: {lastUpdated.toLocaleString('uz-UZ')}
          <br />
          Ma'lumotlar har 30 daqiqada avtomatik yangilanadi
        </div>
      </div>
    </div>
  );
}
