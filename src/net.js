import { logInfo, logError } from './logger.js';
import { showErrorOverlay } from './errorOverlay.js';
import { renderIframe } from './iframeRenderer.js';
import { getSettings } from './settingsPanel.js';

const BASE_PROXY = '/proxy?url=';
const HEALTH_ENDPOINT = '/health';
const META_ENDPOINT = '/meta';

function buildProxyURL(url) {
  return `${BASE_PROXY}${encodeURIComponent(url)}`;
}

export async function fetchViaProxy(url) {
  const proxyURL = buildProxyURL(url);
  try {
    const response = await fetch(proxyURL);
    if (!response.ok) {
      throw new Error(`Proxy fetch failed: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    const body = await response.text();
    logInfo(`Fetched via proxy: ${url}`);
    return { body, contentType };
  } catch (err) {
    logError(`Proxy error: ${err.message}`);
    showErrorOverlay(`Failed to load ${url}`);
    return null;
  }
}

export async function checkServerHealth() {
  try {
    const res = await fetch(HEALTH_ENDPOINT);
    const data = await res.json();
    logInfo(`Server health: ${JSON.stringify(data)}`);
    return data;
  } catch (err) {
    logError('Health check failed');
    return null;
  }
}

export async function getServerMeta() {
  try {
    const res = await fetch(META_ENDPOINT);
    const data = await res.json();
    logInfo(`Server meta: ${JSON.stringify(data)}`);
    return data;
  } catch (err) {
    logError('Meta fetch failed');
    return null;
  }
}

export function loadURLIntoTab(tabId, url) {
  const proxyURL = buildProxyURL(url);
  renderIframe(tabId, proxyURL);
  logInfo(`Loaded ${url} into tab ${tabId}`);
}

export async function testProxy(url) {
  const result = await fetchViaProxy(url);
  if (result) {
    logInfo(`Proxy test success: ${url}`);
  } else {
    logError(`Proxy test failed: ${url}`);
  }
}

export function preloadURL(tabId, url) {
  const proxyURL = buildProxyURL(url);
  const iframe = document.getElementById(tabId);
  if (iframe) {
    iframe.src = proxyURL;
    iframe.style.opacity = '0.5';
    iframe.onload = () => {
      iframe.style.opacity = '1';
      logInfo(`Preloaded ${url} into ${tabId}`);
    };
  }
}

export async function retryFetch(url, attempts = 3, delayMs = 500) {
  for (let i = 0; i < attempts; i++) {
    const result = await fetchViaProxy(url);
    if (result) return result;
    await new Promise(resolve => setTimeout(resolve, delayMs));
    logWarn(`Retrying fetch (${i + 1}/${attempts}) for ${url}`);
  }
  showErrorOverlay(`Failed to load ${url} after ${attempts} attempts`);
  return null;
}

export function getProxyURL(url) {
  return buildProxyURL(url);
}
