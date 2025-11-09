import { createTab, switchTab, getActiveTabId, closeTab, restoreTabs } from './tabManager.js';
import { loadSearch } from './searchHandler.js';
import { bindUIEvents, showHomeScreen, hideHomeScreen } from './ui.js';
import { log, logError } from './logger.js';
import { saveSession, loadSession } from './session.js';
import { applySettings } from './settingsPanel.js';
import { showErrorOverlay } from './errorOverlay.js';

let initialized = false;

function initApp() {
  if (initialized) return;
  initialized = true;

  log('Initializing SUB Recoded V2...');

  bindUIEvents({
    onNewTab: handleNewTab,
    onSearch: handleSearch,
    onCloseTab: handleCloseTab,
    onSettingsChange: applySettings
  });

  restoreTabs();
  if (!getActiveTabId()) {
    handleNewTab();
    showHomeScreen();
  }

  log('App initialized.');
}

function handleNewTab() {
  try {
    const tabId = createTab();
    switchTab(tabId);
    showHomeScreen();
    log(`New tab created: ${tabId}`);
  } catch (err) {
    logError('Failed to create new tab');
    showErrorOverlay('Could not create a new tab.');
  }
}

function handleSearch(query) {
  try {
    const tabId = getActiveTabId();
    if (!tabId) {
      logError('No active tab for search');
      return;
    }
    hideHomeScreen();
    loadSearch(tabId, query);
    saveSession(tabId, query);
    log(`Search triggered in ${tabId}: ${query}`);
  } catch (err) {
    logError(`Search failed: ${err.message}`);
    showErrorOverlay('Search failed. Try again.');
  }
}

function handleCloseTab(tabId) {
  try {
    closeTab(tabId);
    log(`Tab closed: ${tabId}`);
    if (!getActiveTabId()) {
      handleNewTab();
    }
  } catch (err) {
    logError(`Failed to close tab: ${tabId}`);
    showErrorOverlay('Could not close tab.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    initApp();
  } catch (err) {
    logError('App failed to initialize');
    showErrorOverlay('Initialization error.');
  }
});
