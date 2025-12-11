const PROD_API_BASE_URL = 'https://api.space.knowhub.uz/api/v1';
const DEV_API_BASE_URL = 'http://localhost:8000/api/v1';
const DEFAULT_API_BASE_URL = process.env.NODE_ENV === 'production' ? PROD_API_BASE_URL : DEV_API_BASE_URL;

export function getApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const sanitizedBaseUrl = rawBaseUrl?.replace(/\/+$/, '') || DEFAULT_API_BASE_URL;

  if (/\/api\/v1$/.test(sanitizedBaseUrl)) {
    return sanitizedBaseUrl;
  }

  return `${sanitizedBaseUrl}/api/v1`;
}

export function getApiRootUrl() {
  const baseUrl = getApiBaseUrl();

  return baseUrl.replace(/\/api\/v1$/, '');
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
