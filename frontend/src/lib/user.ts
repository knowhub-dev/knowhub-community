import { User } from '@/types';

export function isProUser(user?: Partial<User> | null): boolean {
  if (!user) return false;
  if (typeof (user as any).is_pro === 'boolean') {
    return Boolean((user as any).is_pro);
  }

  if (typeof user.plan_type === 'string') {
    const normalized = user.plan_type.toLowerCase();
    return normalized === 'pro' || normalized === 'legend';
  }

  return false;
}
