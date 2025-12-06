const AUTH_COOKIE_NAME = 'auth_token';

const buildCookieOptions = () => (window.location.protocol === 'https:' ? '; Secure' : '');

const getAuthCookie = () => {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const setAuthCookie = (token: string) => {
  if (typeof document === 'undefined') return;

  const cookieOptions = buildCookieOptions();
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${cookieOptions}`;
};

export const clearAuthCookie = () => {
  if (typeof document === 'undefined') return;

  const cookieOptions = buildCookieOptions();
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0${cookieOptions}`;
};

export { AUTH_COOKIE_NAME, getAuthCookie };
