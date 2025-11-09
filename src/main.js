import { createTab, switchTab, getActiveTabId } from './tabManager.js';
import { loadSearch } from './searchHandler.js';

document.addEventListener('DOMContentLoaded', () => {
  const newTabBtn = document.getElementById('newTabBtn');
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');

  newTabBtn.onclick = () => createTab();
  searchBtn.onclick = () => {
    const query = searchInput.value.trim();
    if (query) {
      const tabId = getActiveTabId();
      loadSearch(tabId, query);
      document.getElementById('home').style.display = 'none';
    }
  };

  // Create initial tab
  createTab();
});
