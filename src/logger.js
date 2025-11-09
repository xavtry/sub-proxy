
const logLevels = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  debug: 'DEBUG'
};

let logHistory = [];
let verboseMode = true;
let inAppConsoleEnabled = false;

function getTimestamp() {
  return new Date().toISOString();
}

function formatLog(level, message) {
  return `[${getTimestamp()}] [${logLevels[level]}] ${message}`;
}

function pushToHistory(level, message) {
  logHistory.push({
    timestamp: getTimestamp(),
    level: logLevels[level],
    message
  });

  if (logHistory.length > 500) {
    logHistory.shift(); // keep log size manageable
  }
}

function outputToConsole(level, message) {
  const formatted = formatLog(level, message);
  switch (level) {
    case 'info':
      console.info(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
    case 'debug':
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

function outputToPanel(level, message) {
  if (!inAppConsoleEnabled) return;

  const panel = document.getElementById('logPanel');
  if (!panel) return;

  const entry = document.createElement('div');
  entry.className = `log-entry ${level}`;
  entry.textContent = formatLog(level, message);
  panel.appendChild(entry);

  if (panel.childNodes.length > 100) {
    panel.removeChild(panel.firstChild);
  }
}

function log(message) {
  pushToHistory('info', message);
  if (verboseMode) outputToConsole('info', message);
  outputToPanel('info', message);
}

function logInfo(message) {
  pushToHistory('info', message);
  outputToConsole('info', message);
  outputToPanel('info', message);
}

function logWarn(message) {
  pushToHistory('warn', message);
  outputToConsole('warn', message);
  outputToPanel('warn', message);
}

function logError(message) {
  pushToHistory('error', message);
  outputToConsole('error', message);
  outputToPanel('error', message);
}

function logDebug(message) {
  pushToHistory('debug', message);
  if (verboseMode) outputToConsole('debug', message);
  outputToPanel('debug', message);
}

export function getLogHistory() {
  return [...logHistory];
}

export function clearLogHistory() {
  logHistory = [];
  const panel = document.getElementById('logPanel');
  if (panel) panel.innerHTML = '';
}

export function setVerbose(enabled) {
  verboseMode = enabled;
  log(`Verbose mode ${enabled ? 'enabled' : 'disabled'}`);
}

export function enableInAppConsole(enabled) {
  inAppConsoleEnabled = enabled;
  log(`In-app console ${enabled ? 'enabled' : 'disabled'}`);
}

export {
  log,
  logInfo,
  logWarn,
  logError,
  logDebug
};
