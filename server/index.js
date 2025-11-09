import express from 'express';
import path from 'path';
import corsHeaders from './corsHeaders.js';
import proxyHandler from './proxyHandler.js';
import { rewriteHTML } from './urlRewriter.js';
import cache from './cache.js';
import { logRequest, logError, logInfo } from './utils.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsHeaders);
app.use(express.static(path.resolve('public')));

app.use((req, res, next) => {
  logRequest(req);
  next();
});

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.get('/meta', (req, res) => {
  res.json({
    name: 'SUB Recoded V2 Proxy',
    version: '2.0.0',
    author: 'Sebastian',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    logError('Missing URL in proxy request');
    return res.status(400).send('Missing URL');
  }

  try {
    const cached = cache.get(targetUrl);
    if (cached) {
      res.set(cached.headers);
      return res.send(cached.body);
    }

    const { body, headers } = await proxyHandler(targetUrl);
    const rewritten = rewriteHTML(body, targetUrl);

    cache.set(targetUrl, { body: rewritten, headers });
    res.set(headers);
    res.send(rewritten);
  } catch (err) {
    logError(`Proxy failed: ${err.message}`);
    res.status(500).send('Proxy error');
  }
});

// ─────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  logError(`Unhandled server error: ${err.message}`);
  res.status(500).send('Internal server error');
});

// ─────────────────────────────────────────────────────────────
// Startup
// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  logInfo(`SUB Recoded V2 server running on port ${PORT}`);
});
