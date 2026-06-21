const ttl = 60_000;

const cache = new Map<string, { data: unknown; expiry: number }>();

export function makeCacheKey(headers: Headers): string {
  return (headers.get("cookie") ?? "") + "::" + (headers.get("authorization") ?? "");
}

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}
