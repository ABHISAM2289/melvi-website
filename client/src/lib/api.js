const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

export function apiFetch(path, options = {}) {
  const url = path.startsWith('/api/') ? `${apiOrigin}${path}` : path;
  const headers = new Headers(options.headers);
  const token = localStorage.getItem('melvi_jwt');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
}
