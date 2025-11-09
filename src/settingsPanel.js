
import { DEFAULT_SETTINGS, STORAGE_KEYS, SUPPORTED_SEARCH_ENGINES } from './config.js';
import { log, logError } from './logger.js';

let currentSettings = { ...DEFAULT_SETTINGS };
let changeListeners = [];

function getSettingsKey() {
  return STORAGE_KEYS.settings;
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(getSettingsKey());
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
    log('Settings loaded');
    return currentSettings;
  } catch (err) {
    logError('Failed to load settings');
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings() {
  try {
    localStorage.setItem(getSettingsKey(), JSON.stringify(currentSettings));
    log('Settings saved');
  } catch (err) {
    logError('Failed to save settings');
  }
}

export function getSettings() {
  return { ...currentSettings };
}

export function applySettings(newSettings) {
  currentSettings = { ...currentSettings, ...newSettings };
  saveSettings();
  notifyListeners();
}

export function onSettingsChange(callback) {
  if (typeof callback === 'function') {
    changeListeners.push(callback);
  }
}

function notifyListeners() {
  changeListeners.forEach(fn => fn(currentSettings));
}

export function renderSettingsPanel() {
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;

  panel.innerHTML = `
    <h3>Settings</h3>
    <label>
      <input type="checkbox" id="darkModeToggle" ${currentSettings.darkMode ? 'checked' : ''} />
      Dark Mode
    </label>
    <label>
      <input type="checkbox" id="verboseLogsToggle" ${currentSettings.verboseLogs ? 'checked' : ''} />
      Verbose Logs
    </label>
    <label>
      <input type="checkbox" id="inAppConsoleToggle" ${currentSettings.showInAppConsole ? 'checked' : ''} />
      In-App Console
    </label>
    <label>
      Search Engine:
      <select id="searchEngineSelect">
        ${SUPPORTED_SEARCH_ENGINES.map(engine => `
          <option value="${engine}" ${currentSettings.searchEngine === engine ? 'selected' : ''}>${engine}</option>
        `).join('')}
      </select>
    </label>
  `;

  document.getElementById('darkModeToggle')?.addEventListener('change', (e) => {
    currentSettings.darkMode = e.target.checked;
    applySettings(currentSettings);
  });

  document.getElementById('verboseLogsToggle')?.addEventListener('change', (e) => {
    currentSettings.verboseLogs = e.target.checked;
    applySettings(currentSettings);
  });

  document.getElementById('inAppConsoleToggle')?.addEventListener('change', (e) => {
    currentSettings.showInAppConsole = e.target.checked;
    applySettings(currentSettings);
  });

  document.getElementById('searchEngineSelect')?.addEventListener('change', (e) => {
    currentSettings.searchEngine = e.target.value;
    applySettings(currentSettings);
  });

  log('Settings panel rendered');
}
