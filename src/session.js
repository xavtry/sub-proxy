
import { STORAGE_KEYS } from './config.js';
import { log, logError } from './logger.js';

function getSessionKey() {
  return STORAGE_KEYS.session;
}

function getTabHistoryKey(tabId) {
  return `${STORAGE_KEYS.tabHistoryPrefix}${tabId}`;
}

export function saveSession(tabId, query) {
  try {
    const session = loadSession() || [];
    const existing = session.find(t => t.id === tabId);

    if (existing) {
      existing.query = query;
      existing.label = extractLabel(query);
    } else {
      session.push({
        id: tabId,
        label: extractLabel(query),
        query
      });
    }

    localStorage.setItem(getSessionKey(), JSON.stringify(session));
    log(`Session saved for ${tabId}`);
    saveTabHistory(tabId, query);
  } catch (err) {
    logError(`Failed to save session: ${err.message}`);
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(getSessionKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    log(`Session loaded: ${parsed.length} tabs`);
    return parsed;
  } catch (err) {
    logError(`Failed to load session: ${err.message}`);
    return [];
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(getSessionKey());
    log('Session cleared');
  } catch (err) {
    logError('Failed to clear session');
  }
}

function extractLabel(query) {
  if (!query) return 'New Tab';
  try {
    const url = new URL(query.startsWith('http') ? query : `https://${query}`);
    return url.hostname;
  } catch {
    return `Search: ${query}`;
  }
}

export function saveTabHistory(tabId, query) {
  try {
    const key = getTabHistoryKey(tabId);
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.push({ query, timestamp: Date.now() });
    if (history.length > 25) history.shift();
    localStorage.setItem(key, JSON.stringify(history));
    log(`History updated for ${tabId}`);
  } catch (err) {
    logError(`Failed to save history for ${tabId}`);
  }
}

export function getTabHistory(tabId) {
  try {
    const key = getTabHistoryKey(tabId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    logError(`Failed to load history for ${tabId}`);
    return [];
  }
}

export function clearTabHistory(tabId) {
  try {
    const key = getTabHistoryKey(tabId);
    localStorage.removeItem(key);
    log(`History cleared for ${tabId}`);
  } catch (err) {
    logError(`Failed to clear history for ${tabId}`);
  }
}

export function exportSession() {
  try {
    const session = loadSession();
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    log('Session exported');
    return url;
  } catch (err) {
    logError('Failed to export session');
    return null;
  }
}
