const fetch = require('node-fetch');
const { rewriteHTML } = require('./urlRewriter');
const { setCORSHeaders } = require('./corsHeaders');

async function handleProxy(req, res) {
  const targetURL = req.query.url;
  if (!targetURL) return res.status(400).send('Missing URL');

  setCORSHeaders(res);

  try {
    const response = await fetch(targetURL);
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('text/html')) {
      let html = await response.text();
      html = rewriteHTML(html, targetURL);
      res.send(html);
    } else {
      const buffer = await response.buffer();
      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      res.send(buffer);
    }
  } catch (err) {
    res.status(500).send('Proxy error');
  }
}

module.exports = { handleProxy };
