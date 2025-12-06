const AUTH_COOKIE_NAME = 'auth_token';
const COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;

const isSecureContext = () =>
  typeof window !== 'undefined' && window.location.protocol === 'https:';

const buildCookieOptions = (maxAge: number) => {
  const options = ['Path=/'];

  if (COOKIE_DOMAIN) {
    options.push(`Domain=${COOKIE_DOMAIN}`);
  }

  options.push(`Max-Age=${maxAge}`);

  if (isSecureContext()) {
    options.push('SameSite=None', 'Secure');
  } else {
    options.push('SameSite=Lax');
  }

  return `; ${options.join('; ')}`;
};

const getAuthCookie = () => {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setAuthCookie = (token: string) => {
  if (typeof document === 'undefined') return;

  const cookieOptions = buildCookieOptions(60 * 60 * 24 * 30);
  document.cookie = `${AUTH_COOKIE_NAME}=${token}${cookieOptions}`;
};

export const clearAuthCookie = () => {
  if (typeof document === 'undefined') return;

  const cookieOptions = buildCookieOptions(0);
  document.cookie = `${AUTH_COOKIE_NAME}=${cookieOptions}`;
};

export { AUTH_COOKIE_NAME, getAuthCookie };
