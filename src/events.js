import { log, logError } from './logger.js';
import { handleCloseTab, handleSwitchTab, handleSettingsChange } from './main.js';

const registeredEvents = [];

export function bindCustomEvents() {
  try {
    document.addEventListener('close-tab', (e) => {
      const tabId = e.detail;
      if (!tabId) return logError('Missing tabId in close-tab event');
      handleCloseTab(tabId);
    });

    document.addEventListener('switch-tab', (e) => {
      const tabId = e.detail;
      if (!tabId) return logError('Missing tabId in switch-tab event');
      handleSwitchTab(tabId);
    });

    document.addEventListener('settings-change', (e) => {
      const newSettings = e.detail;
      if (!newSettings || typeof newSettings !== 'object') {
        return logError('Invalid settings payload');
      }
      handleSettingsChange(newSettings);
    });

    registeredEvents.push('close-tab', 'switch-tab', 'settings-change');
    log('Custom events bound');
  } catch (err) {
    logError(`Failed to bind custom events: ${err.message}`);
  }
}

export function dispatchEvent(name, detail = null) {
  try {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
    log(`Event dispatched: ${name}`);
  } catch (err) {
    logError(`Failed to dispatch event ${name}`);
  }
}

export function bindDOMEvents() {
  try {
    document.body.addEventListener('click', (e) => {
      const target = e.target;

      if (target.matches('.tab')) {
        const tabId = target.dataset.id;
        if (tabId) dispatchEvent('switch-tab', tabId);
      }

      if (target.matches('.close-tab')) {
        const tabId = target.closest('.tab')?.dataset.id;
        if (tabId) dispatchEvent('close-tab', tabId);
      }

      if (target.matches('#settingsApplyBtn')) {
        const settings = collectSettingsFromUI();
        dispatchEvent('settings-change', settings);
      }
    });

    registeredEvents.push('body-click');
    log('DOM events bound');
  } catch (err) {
    logError(`Failed to bind DOM events: ${err.message}`);
  }
}

function collectSettingsFromUI() {
  const darkMode = document.getElementById('darkModeToggle')?.checked;
  const verboseLogs = document.getElementById('verboseLogsToggle')?.checked;
  const showConsole = document.getElementById('inAppConsoleToggle')?.checked;
  const searchEngine = document.getElementById('searchEngineSelect')?.value;

  return {
    darkMode: !!darkMode,
    verboseLogs: !!verboseLogs,
    showInAppConsole: !!showConsole,
    searchEngine: searchEngine || 'google'
  };
}

export function listRegisteredEvents() {
  return [...registeredEvents];
}

export function clearEventBindings() {
  registeredEvents.forEach(name => {
    document.removeEventListener(name, () => {});
  });
  registeredEvents.length = 0;
  log('All custom events cleared');
}
