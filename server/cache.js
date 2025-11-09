import { logInfo, logError } from './utils.js';

const MAX_ENTRIES = 100;
const DEFAULT_TTL = 1000 * 60 * 5; // 5 minutes

const cacheStore = new Map();

function now() {
  return Date.now();
}

function isExpired(entry) {
  return now() > entry.expiresAt;
}

function pruneExpired() {
  for (const [key, entry] of cacheStore.entries()) {
    if (isExpired(entry)) {
      cacheStore.delete(key);
      logInfo(`Cache expired: ${key}`);
    }
  }
}

function pruneLRU() {
  if (cacheStore.size <= MAX_ENTRIES) return;

  const sorted = [...cacheStore.entries()].sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
  const toRemove = sorted.slice(0, cacheStore.size - MAX_ENTRIES);

  toRemove.forEach(([key]) => {
    cacheStore.delete(key);
    logInfo(`Cache evicted (LRU): ${key}`);
  });
}

export function set(key, value, ttl = DEFAULT_TTL) {
  try {
    const entry = {
      value,
      createdAt: now(),
      lastAccessed: now(),
      expiresAt: now() + ttl
    };
    cacheStore.set(key, entry);
    pruneExpired();
    pruneLRU();
    logInfo(`Cache set: ${key}`);
  } catch (err) {
    logError(`Failed to set cache: ${err.message}`);
  }
}

export function get(key) {
  try {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    if (isExpired(entry)) {
      cacheStore.delete(key);
      logInfo(`Cache miss (expired): ${key}`);
      return null;
    }
    entry.lastAccessed = now();
    logInfo(`Cache hit: ${key}`);
    return entry.value;
  } catch (err) {
    logError(`Failed to get cache: ${err.message}`);
    return null;
  }
}

export function has(key) {
  const entry = cacheStore.get(key);
  return entry && !isExpired(entry);
}

export function clear() {
  cacheStore.clear();
  logInfo('Cache cleared');
}

export function size() {
  return cacheStore.size;
}

export function stats() {
  return {
    size: cacheStore.size,
    keys: [...cacheStore.keys()],
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
}

export function keys() {
  return [...cacheStore.keys()];
}

export function deleteKey(key) {
  if (cacheStore.has(key)) {
    cacheStore.delete(key);
    logInfo(`Cache deleted: ${key}`);
  }
}
