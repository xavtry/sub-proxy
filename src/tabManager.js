let tabs = [];
let activeTabId = null;

export function createTab() {
  const tabId = `tab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const tabBar = document.getElementById('tabBar');
  const iframeContainer = document.getElementById('iframeContainer');

  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.dataset.id = tabId;
  tab.innerHTML = `
    <span class="tab-label">New Tab</span>
    <button class="close-tab">×</button>
  `;

  tab.querySelector('.close-tab').onclick = (e) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  tab.onclick = () => switchTab(tabId);
  tabBar.insertBefore(tab, document.getElementById('newTabBtn'));

  const iframe = document.createElement('iframe');
  iframe.id = tabId;
  iframe.classList.add('tab-frame');
  iframeContainer.appendChild(iframe);

  tabs.push({ id: tabId, label: 'New Tab', query: '' });
  switchTab(tabId);
  return tabId;
}

export function switchTab(tabId) {
  if (!tabs.find(t => t.id === tabId)) return;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.tab-frame').forEach(frame => {
    frame.classList.remove('active');
  });

  const tabElement = document.querySelector(`.tab[data-id="${tabId}"]`);
  const iframe = document.getElementById(tabId);

  if (tabElement) tabElement.classList.add('active');
  if (iframe) iframe.classList.add('active');

  activeTabId = tabId;
}

export function closeTab(tabId) {
  const tabIndex = tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  const tabElement = document.querySelector(`.tab[data-id="${tabId}"]`);
  const iframe = document.getElementById(tabId);

  if (tabElement) tabElement.remove();
  if (iframe) iframe.remove();

  tabs.splice(tabIndex, 1);

  if (activeTabId === tabId) {
    const nextTab = tabs[tabIndex] || tabs[tabIndex - 1];
    if (nextTab) switchTab(nextTab.id);
    else activeTabId = null;
  }
}

export function getActiveTabId() {
  return activeTabId;
}

export function getAllTabs() {
  return [...tabs];
}

export function updateTabLabel(tabId, label) {
  const tab = tabs.find(t => t.id === tabId);
  if (tab) tab.label = label;

  const tabElement = document.querySelector(`.tab[data-id="${tabId}"] .tab-label`);
  if (tabElement) tabElement.textContent = label;
}

export function restoreTabs(savedTabs = []) {
  savedTabs.forEach(({ id, label, query }) => {
    const tabBar = document.getElementById('tabBar');
    const iframeContainer = document.getElementById('iframeContainer');

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.id = id;
    tab.innerHTML = `
      <span class="tab-label">${label}</span>
      <button class="close-tab">×</button>
    `;

    tab.querySelector('.close-tab').onclick = (e) => {
      e.stopPropagation();
      closeTab(id);
    };

    tab.onclick = () => switchTab(id);
    tabBar.insertBefore(tab, document.getElementById('newTabBtn'));

    const iframe = document.createElement('iframe');
    iframe.id = id;
    iframe.classList.add('tab-frame');
    iframe.src = query ? `/proxy?url=${encodeURIComponent(query)}` : '';
    iframeContainer.appendChild(iframe);

    tabs.push({ id, label, query });
  });
}
