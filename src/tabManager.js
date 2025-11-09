let tabCounter = 0;
let activeTabId = null;

export function createTab() {
  const tabId = `tab-${++tabCounter}`;
  const tabBar = document.getElementById('tabBar');
  const iframeContainer = document.getElementById('iframeContainer');

  const tab = document.createElement('div');
  tab.className = 'tab';
  tab.textContent = `Tab ${tabCounter}`;
  tab.onclick = () => switchTab(tabId);
  tabBar.insertBefore(tab, document.getElementById('newTabBtn'));

  const iframe = document.createElement('iframe');
  iframe.id = tabId;
  iframeContainer.appendChild(iframe);

  switchTab(tabId);
}

export function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('iframe').forEach(frame => frame.classList.remove('active'));

  const tabIndex = Array.from(document.querySelectorAll('.tab')).findIndex(t => t.textContent === document.getElementById(tabId)?.id);
  document.querySelectorAll('.tab')[tabIndex].classList.add('active');
  document.getElementById(tabId).classList.add('active');
  activeTabId = tabId;
}

export function getActiveTabId() {
  return activeTabId;
}
