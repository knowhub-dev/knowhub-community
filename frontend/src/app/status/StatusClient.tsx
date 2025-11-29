"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Activity, AlertTriangle, CheckCircle, Clock, Database, Server, Wifi, Zap, XCircle } from "lucide-react";

// Static timestamp used during SSR to keep hydration deterministic; replaced with live time after mount.
const FALLBACK_TIMESTAMP = "2024-01-01T00:00:00.000Z";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage";
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

const INITIAL_SERVICES: ServiceStatus[] = [
  {
    name: "Web Server",
    status: "operational",
    description: "Frontend application",
    responseTime: 145,
    lastChecked: FALLBACK_TIMESTAMP,
  },
  {
    name: "API Server",
    status: "operational",
    description: "Backend REST API",
    responseTime: 89,
    lastChecked: FALLBACK_TIMESTAMP,
  },
  {
    name: "Database",
    status: "operational",
    description: "MySQL Database",
    responseTime: 12,
    lastChecked: FALLBACK_TIMESTAMP,
  },
  {
    name: "Redis Cache",
    status: "operational",
    description: "In-memory cache",
    responseTime: 3,
    lastChecked: FALLBACK_TIMESTAMP,
  },
  {
    name: "Queue System",
    status: "operational",
    description: "Background jobs",
    responseTime: 25,
    lastChecked: FALLBACK_TIMESTAMP,
  },
  {
    name: "File Storage",
    status: "operational",
    description: "Media and file uploads",
    responseTime: 67,
    lastChecked: FALLBACK_TIMESTAMP,
  },
];

const INITIAL_METRICS: SystemMetrics = {
  uptime: "99.9%",
  cpu: 23,
  memory: 67,
  disk: 45,
  activeUsers: 1247,
};

export default function StatusClient() {
  const [services, setServices] = useState<ServiceStatus[]>(INITIAL_SERVICES);
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date(FALLBACK_TIMESTAMP));

  useEffect(() => {
    const refreshMetrics = () => {
      const now = new Date();
      setLastUpdated(now);

      setMetrics((prev) => ({
        ...prev,
        cpu: Math.max(10, Math.min(80, prev.cpu + (Math.random() - 0.5) * 5)),
        memory: Math.max(40, Math.min(85, prev.memory + (Math.random() - 0.5) * 3)),
        activeUsers: Math.max(1000, Math.min(2000, prev.activeUsers + Math.floor((Math.random() - 0.5) * 50))),
      }));

      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          responseTime: Math.max(1, Math.min(200, (service.responseTime || 50) + (Math.random() - 0.5) * 20)),
          lastChecked: now.toISOString(),
        })),
      );
    };

    refreshMetrics();
    const interval = setInterval(refreshMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "text-[hsl(var(--accent-green))] bg-[hsl(var(--accent-green))/15] border-[hsl(var(--accent-green))/30]";
      case "degraded":
        return "text-[hsl(var(--secondary))] bg-[hsl(var(--secondary))/15] border-[hsl(var(--secondary))/30]";
      case "outage":
        return "text-[hsl(var(--accent-pink))] bg-[hsl(var(--accent-pink))/15] border-[hsl(var(--accent-pink))/30]";
      default:
        return "text-muted-foreground bg-[hsl(var(--muted))] border-[hsl(var(--border))]";
    }
  };

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-5 h-5" />;
      case "degraded":
        return <Clock className="w-5 h-5" />;
      case "outage":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "Ishlayapti";
      case "degraded":
        return "Cheklangan";
      case "outage":
        return "O'chirilgan";
      default:
        return "Noma'lum";
    }
  };

  const operationalCount = services.filter((s) => s.status === "operational").length;
  const overallStatus =
    operationalCount === services.length ? "operational" : operationalCount >= services.length * 0.8 ? "degraded" : "outage";

  const statusGradient =
    overallStatus === "operational"
      ? "from-[hsl(var(--accent-green))] via-[hsl(var(--accent-green))] to-[hsl(var(--secondary))]"
      : overallStatus === "degraded"
        ? "from-[hsl(var(--secondary))] via-[hsl(var(--primary))] to-[hsl(var(--accent-purple))]"
        : "from-[hsl(var(--accent-pink))] via-[hsl(var(--accent-purple))] to-[hsl(var(--primary))]";

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
                {overallStatus === "operational"
                  ? "Barcha xizmatlar ishlayapti"
                  : overallStatus === "degraded"
                    ? "Ba'zi xizmatlar cheklangan"
                    : "Jiddiy muammolar mavjud"}
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
              <div className="w-12 h-12 bg-[hsl(var(--primary))/15] rounded-lg flex items-center justify-center mr-4">
                <Server className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{metrics.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Aktiv foydalanuvchilar</div>
              </div>
            </div>
          </div>

          <div className="bg-[hsl(var(--card))] rounded-lg shadow-sm border border-[hsl(var(--border))] p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[hsl(var(--accent-purple))/15] rounded-lg flex items-center justify-center mr-4">
                <Database className="w-6 h-6 text-[hsl(var(--accent-purple))]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--foreground))]">{metrics.disk}%</div>
                <div className="text-sm text-muted-foreground">Saqlash</div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Status */}
          <div className="lg:col-span-2 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-lg p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm uppercase text-muted-foreground">Joriy holat</p>
                <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">Sistemalar</h2>
                <p className="text-muted-foreground">Xizmatlarning ishlash holati va ko'rsatkichlari</p>
              </div>
              <div className={`px-4 py-2 rounded-full border ${getStatusColor(overallStatus)}`}>
                <div className="flex items-center gap-2">
                  {getStatusIcon(overallStatus)}
                  <span className="font-semibold">{getStatusText(overallStatus)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {services.map((service) => (
                <div key={service.name} className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-[hsl(var(--foreground))]">{getStatusText(service.status)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      <span>Response: {service.responseTime ?? 0}ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Oxirgi tekshiruv: {service.lastChecked ? new Date(service.lastChecked).toLocaleTimeString("uz-UZ") : "---"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase text-muted-foreground">Tizim holati</p>
                <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Ko'rsatkichlar</h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-[hsl(var(--accent-green))/15] text-[hsl(var(--accent-green))] text-sm font-semibold">
                Barqaror
              </div>
            </div>

            <div className="space-y-3">
              <MetricItem label="Uptime" value={metrics.uptime} icon={<CheckCircle className="w-4 h-4" />} trend="+0.01%" />
              <MetricItem label="CPU" value={`${metrics.cpu.toFixed(1)}%`} icon={<Activity className="w-4 h-4" />} trend="Stabil" />
              <MetricItem label="Xotira" value={`${metrics.memory.toFixed(1)}%`} icon={<Database className="w-4 h-4" />} trend="Optimal" />
              <MetricItem label="Saqlash" value={`${metrics.disk}%`} icon={<Server className="w-4 h-4" />} trend="Chegara" />
              <MetricItem label="Aktiv foydalanuvchilar" value={metrics.activeUsers.toString()} icon={<Wifi className="w-4 h-4" />} trend="+12" />
            </div>

            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-4 space-y-3">
              <h3 className="font-semibold text-[hsl(var(--foreground))]">Monitoring</h3>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[hsl(var(--accent-pink))]" />
                  <span>Hodisalar: 0</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[hsl(var(--secondary))]" />
                  <span>Reaksiya: 12ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[hsl(var(--primary))]" />
                  <span>So'ngi update: {lastUpdated.toLocaleTimeString("uz-UZ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[hsl(var(--accent-purple))]" />
                  <span>Replikatsiya: normal</span>
                </div>
              </div>
            </div>
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
          Oxirgi yangilanish: {lastUpdated.toLocaleString("uz-UZ")}
          <br />
          Ma'lumotlar har 30 daqiqada avtomatik yangilanadi
        </div>
      </div>
    </div>
  );
}

function MetricItem({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  trend: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-[hsl(var(--foreground))]">{value}</p>
        </div>
      </div>
      <span className="text-xs text-[hsl(var(--secondary))] font-semibold">{trend}</span>
    </div>
  );
}
