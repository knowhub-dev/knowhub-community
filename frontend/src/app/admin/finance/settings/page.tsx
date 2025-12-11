'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Copy, Check, CreditCard, Landmark, ShieldCheck, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Plan } from '@/types/plan';

interface GatewayConfig {
  enabled: boolean;
  merchant_id?: string;
  secret_key?: string;
  service_id?: string;
  merchant_user_id?: string;
  callback_url?: string;
}

interface PaymentSettingsResponse {
  payme: GatewayConfig;
  click: GatewayConfig;
}

type GatewayKey = 'payme' | 'click';

type SecretVisibility = Record<string, boolean>;

function GatewayConfigCard({
  provider,
  icon: Icon,
  accent,
  settings,
  onToggle,
  onChange,
  showSecret,
  setShowSecret,
}: {
  provider: GatewayKey;
  icon: typeof CreditCard;
  accent: string;
  settings: GatewayConfig;
  onToggle: (enabled: boolean) => void;
  onChange: (field: keyof GatewayConfig, value: string) => void;
  showSecret: SecretVisibility;
  setShowSecret: (next: SecretVisibility) => void;
}) {
  const fields = useMemo(
    () =>
      provider === 'payme'
        ? [
            { key: 'merchant_id', label: 'Merchant ID', placeholder: 'Enter Payme merchant ID' },
            { key: 'secret_key', label: 'Secret Key', placeholder: 'Enter Payme secret key', secret: true },
          ]
        : [
            { key: 'service_id', label: 'Service ID', placeholder: 'Enter Click service ID' },
            { key: 'merchant_user_id', label: 'Merchant User ID', placeholder: 'Enter Merchant user ID' },
            { key: 'secret_key', label: 'Secret Key', placeholder: 'Enter Click secret key', secret: true },
          ],
    [provider],
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full text-white', accent)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gateway</p>
            <h3 className="text-lg font-semibold capitalize text-slate-900 dark:text-white">{provider}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggle(!settings.enabled)}
          className={cn(
            'relative inline-flex h-10 w-16 items-center rounded-full border transition',
            settings.enabled
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800',
          )}
          aria-pressed={settings.enabled}
        >
          <span
            className={cn(
              'inline-block h-7 w-7 transform rounded-full bg-white shadow transition',
              settings.enabled ? 'translate-x-7' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {fields.map(field => {
          const key = field.key as keyof GatewayConfig;
          const isSecret = field.secret;
          const visible = showSecret[`${provider}-${key}`];
          return (
            <div key={field.key} className="space-y-2">
              <Label className="text-sm text-slate-600 dark:text-slate-300">{field.label}</Label>
              <div className="relative">
                <Input
                  type={isSecret && !visible ? 'password' : 'text'}
                  value={settings[key] ?? ''}
                  onChange={e => onChange(key, e.target.value)}
                  placeholder={field.placeholder}
                  className="pr-10"
                />
                {isSecret && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 flex items-center text-slate-500"
                    onClick={() => setShowSecret({ ...showSecret, [`${provider}-${key}`]: !visible })}
                  >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CallbackUrlDisplay({ label, url }: { label: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Callback URL copied');
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
      toast.error('Failed to copy URL');
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-slate-600 dark:text-slate-300">{label}</Label>
      <div className="relative">
        <Input value={url ?? ''} readOnly className="pr-12" />
        <button
          type="button"
          onClick={handleCopy}
          className="absolute inset-y-0 right-2 flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
        </button>
      </div>
    </div>
  );
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettingsResponse | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showSecret, setShowSecret] = useState<SecretVisibility>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [gatewayRes, plansRes] = await Promise.all([
          api.get<PaymentSettingsResponse>('/admin/payment-settings'),
          api.get<{ plans: Plan[] }>('/admin/plans'),
        ]);
        setSettings(gatewayRes.data);
        setPlans(plansRes.data.plans);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load payment & plan settings');
      }
    };
    load();
  }, []);

  const updateGateway = (provider: GatewayKey, field: keyof GatewayConfig, value: string | boolean) => {
    setSettings(prev => (prev ? { ...prev, [provider]: { ...prev[provider], [field]: value } } : prev));
  };

  const updatePlanField = (planId: string, field: keyof Plan, value: string | number | boolean | string[]) => {
    setPlans(prev =>
      prev.map(plan => (plan.id === planId ? { ...plan, [field]: value } : plan)),
    );
  };

  const addCustomPlan = () => {
    setPlans(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: 'Custom plan',
        currency: 'UZS',
        price_monthly: 0,
        price_yearly: 0,
        description: '',
        features: [],
        highlight: false,
      },
    ]);
  };

  const handleSave = async () => {
    if (!settings) return;
    if (plans.length === 0) {
      toast.error('No plans to save');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        payme: {
          enabled: settings.payme?.enabled ?? false,
          merchant_id: settings.payme?.merchant_id,
          secret_key: settings.payme?.secret_key,
        },
        click: {
          enabled: settings.click?.enabled ?? false,
          service_id: settings.click?.service_id,
          merchant_user_id: settings.click?.merchant_user_id,
          secret_key: settings.click?.secret_key,
        },
      };

      await Promise.all([
        api.post('/admin/payment-settings', payload),
        api.post('/admin/plans', { plans }),
      ]);
      toast.success('Payment and plan settings saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-indigo-500">Payments</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Integrations</h1>
            <p className="text-slate-600 dark:text-slate-400">Configure Payme and Click gateways without redeploying.</p>
          </div>
        <Button onClick={handleSave} disabled={saving || !settings} className="gap-2">
          {saving ? <ShieldCheck className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <GatewayConfigCard
            provider="payme"
            icon={CreditCard}
            accent="bg-gradient-to-r from-indigo-500 to-blue-500"
            settings={settings?.payme ?? { enabled: false }}
            onToggle={value => updateGateway('payme', 'enabled', value)}
            onChange={(field, value) => updateGateway('payme', field, value)}
            showSecret={showSecret}
            setShowSecret={setShowSecret}
          />
          <CallbackUrlDisplay label="Payme Callback URL" url={settings?.payme?.callback_url} />
        </div>

        <div className="space-y-6">
          <GatewayConfigCard
            provider="click"
            icon={Landmark}
            accent="bg-gradient-to-r from-emerald-500 to-teal-500"
            settings={settings?.click ?? { enabled: false }}
            onToggle={value => updateGateway('click', 'enabled', value)}
            onChange={(field, value) => updateGateway('click', field, value)}
            showSecret={showSecret}
            setShowSecret={setShowSecret}
          />
          <CallbackUrlDisplay label="Click Callback URL" url={settings?.click?.callback_url} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-indigo-500" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Plans</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pricing Configuration</h3>
            </div>
          </div>
          <Button variant="secondary" onClick={addCustomPlan}>
            Add custom plan
          </Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plans.map(plan => (
            <div key={plan.id} className={cn('rounded-xl border p-4', plan.highlight ? 'border-indigo-400' : 'border-border/70')}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">{plan.id}</Label>
                  <Input
                    className="mt-1"
                    value={plan.name}
                    onChange={e => updatePlanField(plan.id, 'name', e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={plan.highlight ?? false}
                    onChange={e => updatePlanField(plan.id, 'highlight', e.target.checked)}
                  />
                  Highlight
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Monthly price</Label>
                  <Input
                    type="number"
                    value={plan.price_monthly}
                    onChange={e => updatePlanField(plan.id, 'price_monthly', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Yearly price</Label>
                  <Input
                    type="number"
                    value={plan.price_yearly}
                    onChange={e => updatePlanField(plan.id, 'price_yearly', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-3">
                <Label className="text-xs text-muted-foreground">Currency</Label>
                <Input
                  value={plan.currency}
                  onChange={e => updatePlanField(plan.id, 'currency', e.target.value.toUpperCase())}
                />
              </div>

              <div className="mt-3">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Input
                  value={plan.description ?? ''}
                  onChange={e => updatePlanField(plan.id, 'description', e.target.value)}
                  placeholder="Short marketing copy"
                />
              </div>

              <div className="mt-3">
                <Label className="text-xs text-muted-foreground">Features (one per line)</Label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm"
                  rows={4}
                  value={(plan.features ?? []).join('\n')}
                  onChange={e => updatePlanField(plan.id, 'features', e.target.value.split('\n'))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
