import fetch from 'node-fetch';
import { logInfo, logError } from './utils.js';

const DEFAULT_HEADERS = {
  'User-Agent': 'SUB-Recoded-V2-Proxy/2.0',
  'Accept': '*/*',
  'Accept-Encoding': 'gzip, deflate, br'
};

function sanitizeHeaders(headers) {
  const sanitized = {};
  for (const [key, value] of headers.entries()) {
    if (key.toLowerCase() === 'content-security-policy') continue;
    if (key.toLowerCase() === 'x-frame-options') continue;
    sanitized[key] = value;
  }
  return sanitized;
}

function isHTML(contentType) {
  return contentType && contentType.includes('text/html');
}

function isRedirect(status) {
  return status >= 300 && status < 400;
}

function resolveRedirectLocation(headers) {
  return headers.get('location') || '';
}

export default async function proxyHandler(targetUrl) {
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      redirect: 'follow'
    });

    const status = response.status;
    const headers = sanitizeHeaders(response.headers);
    const contentType = headers['content-type'] || '';

    if (isRedirect(status)) {
      const location = resolveRedirectLocation(response.headers);
      logInfo(`Redirect detected: ${location}`);
      return {
        body: `<html><head><meta http-equiv="refresh" content="0;url=${location}"></head></html>`,
        headers: { 'content-type': 'text/html' }
      };
    }

    let body = '';
    if (isHTML(contentType)) {
      body = await response.text();
    } else {
      const buffer = await response.buffer();
      body = buffer.toString('base64');
      headers['content-transfer-encoding'] = 'base64';
    }

    logInfo(`Fetched ${targetUrl} [${status}]`);
    return { body, headers };
  } catch (err) {
    logError(`Proxy fetch failed: ${err.message}`);
    throw new Error('Failed to fetch target URL');
  }
}
