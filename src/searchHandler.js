import { updateTabLabel } from './tabManager.js';
import { log, logError, logInfo } from './logger.js';
import { getSettings } from './settingsPanel.js';
import { showErrorOverlay } from './errorOverlay.js';

const searchEngines = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q='
};

function sanitizeQuery(query) {
  if (!query || typeof query !== 'string') return '';
  return query.trim().replace(/\s+/g, ' ');
}

function getSearchURL(query, engine = 'google') {
  const base = searchEngines[engine] || searchEngines.google;
  return `${base}${encodeURIComponent(query)}`;
}

function getEngineFromSettings() {
  const settings = getSettings();
  return settings.searchEngine || 'google';
}

function isValidURL(str) {
  try {
    new URL(str.startsWith('http') ? str : `https://${str}`);
    return true;
  } catch {
    return false;
  }
}

function getProxyURL(url) {
  return `/proxy?url=${encodeURIComponent(url)}`;
}

function extractHostname(url) {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname;
  } catch {
    return 'Invalid URL';
  }
}

function updateSearchHistory(tabId, query) {
  const historyKey = `history-${tabId}`;
  const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
  history.push({ query, timestamp: Date.now() });
  localStorage.setItem(historyKey, JSON.stringify(history));
}

function getSearchHistory(tabId) {
  const historyKey = `history-${tabId}`;
  return JSON.parse(localStorage.getItem(historyKey) || '[]');
}

export function loadSearch(tabId, rawQuery) {
  const query = sanitizeQuery(rawQuery);
  const engine = getEngineFromSettings();

  if (!query) {
    logError('Empty query passed to loadSearch');
    showErrorOverlay('Search query cannot be empty.');
    return;
  }

  let finalURL = '';
  let label = '';

  if (isValidURL(query)) {
    finalURL = getProxyURL(query);
    label = extractHostname(query);
  } else {
    finalURL = getProxyURL(getSearchURL(query, engine));
    label = `Search: ${query}`;
  }

  const iframe = document.getElementById(tabId);
  if (!iframe) {
    logError(`No iframe found for tab ${tabId}`);
    showErrorOverlay('Tab iframe not found.');
    return;
  }

  iframe.src = finalURL;
  updateTabLabel(tabId, label);
  updateSearchHistory(tabId, query);
  logInfo(`Search loaded in ${tabId}: ${label}`);
}

export function testSearchEngines() {
  Object.keys(searchEngines).forEach(engine => {
    const testURL = getSearchURL('SUB Recoded V2', engine);
    console.log(`[TEST] ${engine}: ${testURL}`);
  });
}

export function setSearchEngine(engineName) {
  if (!searchEngines[engineName]) {
    logError(`Invalid search engine: ${engineName}`);
    showErrorOverlay(`Search engine "${engineName}" is not supported.`);
    return;
  }

  const settings = getSettings();
  settings.searchEngine = engineName;
  log(`Search engine set to ${engineName}`);
}

export function listAvailableEngines() {
  return Object.keys(searchEngines);
}

export function getEngineURL(engineName, query) {
  if (!searchEngines[engineName]) return null;
  return getSearchURL(query, engineName);
}

export function clearSearchHistory(tabId) {
  const historyKey = `history-${tabId}`;
  localStorage.removeItem(historyKey);
  log(`Cleared search history for ${tabId}`);
}
