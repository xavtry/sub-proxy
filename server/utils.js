
import os from 'os';

export function getTimestamp() {
  return new Date().toISOString();
}

export function formatLog(level, message) {
  return `[${getTimestamp()}] [${level.toUpperCase()}] ${message}`;
}

export function logInfo(message) {
  console.info(formatLog('info', message));
}

export function logError(message) {
  console.error(formatLog('error', message));
}

export function logWarn(message) {
  console.warn(formatLog('warn', message));
}

export function logDebug(message) {
  console.debug(formatLog('debug', message));
}

export function logRequest(req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const method = req.method;
  const url = req.originalUrl;
  logInfo(`Request: ${method} ${url} from ${ip}`);
}

export function formatError(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  return JSON.stringify(err);
}

export function isString(val) {
  return typeof val === 'string';
}

export function isObject(val) {
  return val && typeof val === 'object' && !Array.isArray(val);
}

export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export function truncate(str, max = 100) {
  if (!isString(str)) return '';
  return str.length > max ? str.slice(0, max) + '...' : str;
}

export function getMemoryStats() {
  const mem = process.memoryUsage();
  return {
    rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`
  };
}

export function getSystemStats() {
  return {
    uptime: process.uptime(),
    platform: os.platform(),
    cpus: os.cpus().length,
    load: os.loadavg(),
    memory: getMemoryStats()
  };
}

export function safeJSONParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function safeJSONStringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '{}';
  }
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
