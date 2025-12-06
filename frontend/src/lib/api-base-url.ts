const DEFAULT_API_BASE_URL = 'http://localhost:8000/api/v1';

export function getApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const sanitizedBaseUrl = rawBaseUrl?.replace(/\/+$/, '') || DEFAULT_API_BASE_URL;

  if (/\/api\/v1$/.test(sanitizedBaseUrl)) {
    return sanitizedBaseUrl;
  }

  return `${sanitizedBaseUrl}/api/v1`;
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

