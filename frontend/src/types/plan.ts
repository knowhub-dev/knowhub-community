export interface Plan {
  id: string;
  name: string;
  currency: string;
  price_monthly: number;
  price_yearly: number;
  description?: string | null;
  features: string[];
  limits?: Record<string, number>;
  highlight?: boolean;
}
