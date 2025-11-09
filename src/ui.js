import { getAllTabs, getActiveTabId, switchTab } from './tabManager.js';
import { handleSearch } from './main.js';
import { log } from './logger.js';

export function bindUIEvents(callbacks) {
  const newTabBtn = document.getElementById('newTabBtn');
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  if (newTabBtn) newTabBtn.onclick = () => callbacks.onNewTab?.();
  if (searchBtn) searchBtn.onclick = () => callbacks.onSearch?.(searchInput.value);
  if (searchInput) {
    searchInput.onkeydown = (e) => {
      if (e.key === 'Enter') callbacks.onSearch?.(searchInput.value);
    };
  }

  document.getElementById('settingsToggle')?.addEventListener('click', () => {
    document.getElementById('settingsPanel')?.classList.toggle('visible');
  });

  log('UI events bound');
}

export function showHomeScreen() {
  const home = document.getElementById('home');
  if (home) {
    home.style.display = 'flex';
    home.style.opacity = '0';
    setTimeout(() => {
      home.style.opacity = '1';
    }, 50);
  }
}

export function hideHomeScreen() {
  const home = document.getElementById('home');
  if (home) {
    home.style.opacity = '0';
    setTimeout(() => {
      home.style.display = 'none';
    }, 300);
  }
}

export function updateTabBar() {
  const tabBar = document.getElementById('tabBar');
  if (!tabBar) return;

  const tabs = getAllTabs();
  const activeId = getActiveTabId();

  tabBar.querySelectorAll('.tab').forEach(tab => tab.remove());

  tabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.dataset.id = tab.id;
    tabEl.innerHTML = `
      <span class="tab-label">${tab.label}</span>
      <button class="close-tab">×</button>
    `;

    if (tab.id === activeId) tabEl.classList.add('active');

    tabEl.querySelector('.close-tab').onclick = (e) => {
      e.stopPropagation();
      document.dispatchEvent(new CustomEvent('close-tab', { detail: tab.id }));
    };

    tabEl.onclick = () => {
      switchTab(tab.id);
    };

    tabBar.insertBefore(tabEl, document.getElementById('newTabBtn'));
  });

  log('Tab bar updated');
}

export function showSearchError(message) {
  const errorBox = document.getElementById('searchError');
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.style.display = 'block';
    setTimeout(() => {
      errorBox.style.opacity = '1';
    }, 50);
  }
}

export function hideSearchError() {
  const errorBox = document.getElementById('searchError');
  if (errorBox) {
    errorBox.style.opacity = '0';
    setTimeout(() => {
      errorBox.style.display = 'none';
    }, 300);
  }
}

export function toggleDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  log(`Dark mode ${enabled ? 'enabled' : 'disabled'}`);
}

export function setSearchPlaceholder(text) {
  const input = document.getElementById('searchInput');
  if (input) input.placeholder = text;
}

export function animateTabSwitch(tabId) {
  const tab = document.querySelector(`.tab[data-id="${tabId}"]`);
  if (tab) {
    tab.classList.add('flash');
    setTimeout(() => tab.classList.remove('flash'), 300);
  }
}
