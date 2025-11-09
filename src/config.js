// ─────────────────────────────────────────────────────────────
// SUB Recoded V2 — Configuration Module
// Centralized constants, defaults, feature flags, and accessors
// ─────────────────────────────────────────────────────────────

export const APP_NAME = 'SUB Recoded V2';
export const VERSION = '2.0.0';
export const BUILD_DATE = '2025-11-09';

export const DEFAULT_SEARCH_ENGINE = 'google';
export const SUPPORTED_SEARCH_ENGINES = ['google', 'duckduckgo', 'bing'];

export const SEARCH_ENGINE_URLS = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing: 'https://www.bing.com/search?q='
};

export const DEFAULT_TAB_LABEL = 'New Tab';
export const MAX_TABS = 20;

export const UI = {
  homeScreenId: 'home',
  tabBarId: 'tabBar',
  iframeContainerId: 'iframeContainer',
  newTabButtonId: 'newTabBtn',
  searchInputId: 'searchInput',
  searchButtonId: 'searchBtn',
  settingsPanelId: 'settingsPanel',
  logPanelId: 'logPanel',
  errorOverlayId: 'errorOverlay'
};

export const SANDBOX_PERMISSIONS = [
  'allow-scripts',
  'allow-same-origin',
  'allow-forms'
];

export const DEFAULT_SETTINGS = {
  searchEngine: DEFAULT_SEARCH_ENGINE,
  darkMode: false,
  verboseLogs: true,
  showInAppConsole: false,
  maxHistoryPerTab: 25
};

export const FEATURE_FLAGS = {
  enableTabAnimations: true,
  enableSearchHistory: true,
  enableSessionPersistence: true,
  enableErrorOverlay: true,
  enableInAppConsole: true,
  enableDarkModeToggle: true
};

export const STORAGE_KEYS = {
  session: 'sub-v2-session',
  settings: 'sub-v2-settings',
  tabHistoryPrefix: 'history-'
};

export function getSearchEngineURL(engine) {
  return SEARCH_ENGINE_URLS[engine] || SEARCH_ENGINE_URLS[DEFAULT_SEARCH_ENGINE];
}

export function isSearchEngineSupported(engine) {
  return SUPPORTED_SEARCH_ENGINES.includes(engine);
}

export function getSandboxString() {
  return SANDBOX_PERMISSIONS.join(' ');
}

export function getStorageKeyForTabHistory(tabId) {
  return `${STORAGE_KEYS.tabHistoryPrefix}${tabId}`;
}

export function getDefaultSettings() {
  return { ...DEFAULT_SETTINGS };
}

export function getFeatureFlag(flagName) {
  return FEATURE_FLAGS[flagName] ?? false;
}

export function getUIElementId(name) {
  return UI[name] || null;
}

export function getAppMetadata() {
  return {
    name: APP_NAME,
    version: VERSION,
    build: BUILD_DATE
  };
}

export function listAllFeatureFlags() {
  return Object.entries(FEATURE_FLAGS).map(([key, value]) => `${key}: ${value}`);
}

export function listAllSettings() {
  return Object.entries(DEFAULT_SETTINGS).map(([key, value]) => `${key}: ${value}`);
}
