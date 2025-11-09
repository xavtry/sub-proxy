export function loadSearch(tabId, query) {
  const iframe = document.getElementById(tabId);
  const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  iframe.src = `/proxy?url=${encodeURIComponent(searchURL)}`;
}
