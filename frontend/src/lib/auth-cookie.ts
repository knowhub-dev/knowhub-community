const AUTH_COOKIE_NAME = 'auth_token';

const buildCookieOptions = () => (window.location.protocol === 'https:' ? '; Secure' : '');

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

export { AUTH_COOKIE_NAME };
