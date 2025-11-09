import { logError } from './logger.js';

const overlayId = 'errorOverlay';
let autoDismissTimeout = null;

function getOverlayElement() {
  return document.getElementById(overlayId);
}

function createOverlayIfMissing() {
  let overlay = getOverlayElement();
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'error-overlay';
    overlay.innerHTML = `
      <div class="error-content">
        <span id="errorMessage">An error occurred.</span>
        <button id="errorCloseBtn">×</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('errorCloseBtn').onclick = () => hideErrorOverlay();
  }
}

export function showErrorOverlay(message = 'Something went wrong.') {
  createOverlayIfMissing();

  const overlay = getOverlayElement();
  const msgEl = document.getElementById('errorMessage');

  if (msgEl) msgEl.textContent = message;
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.opacity = '1';
    }, 50);
  }

  logError(`Overlay shown: ${message}`);
  scheduleAutoDismiss();
}

export function hideErrorOverlay() {
  const overlay = getOverlayElement();
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  }

  clearTimeout(autoDismissTimeout);
}

function scheduleAutoDismiss() {
  clearTimeout(autoDismissTimeout);
  autoDismissTimeout = setTimeout(() => {
    hideErrorOverlay();
  }, 5000);
}

export function updateErrorMessage(message) {
  const msgEl = document.getElementById('errorMessage');
  if (msgEl) msgEl.textContent = message;
}

export function flashError(message) {
  showErrorOverlay(message);
  const overlay = getOverlayElement();
  if (overlay) {
    overlay.classList.add('flash');
    setTimeout(() => overlay.classList.remove('flash'), 500);
  }
}

export function isOverlayVisible() {
  const overlay = getOverlayElement();
  return overlay && overlay.style.display === 'flex';
}

export function attachGlobalErrorListeners() {
  window.onerror = (msg, src, line, col) => {
    const fullMsg = `${msg} at ${src}:${line}:${col}`;
    showErrorOverlay(fullMsg);
    logError(`Global error: ${fullMsg}`);
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason?.message || 'Unhandled promise rejection';
    showErrorOverlay(reason);
    logError(`Unhandled rejection: ${reason}`);
  };
}

export function clearErrorOverlay() {
  const overlay = getOverlayElement();
  if (overlay) {
    overlay.style.display = 'none';
    overlay.style.opacity = '0';
    document.getElementById('errorMessage').textContent = '';
  }
}
