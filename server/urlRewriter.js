import cheerio from 'cheerio';
import { logInfo, logError } from './utils.js';

function resolveURL(base, relative) {
  try {
    return new URL(relative, base).toString();
  } catch {
    return relative;
  }
}

function rewriteAttribute($el, attr, baseUrl) {
  const original = $el.attr(attr);
  if (!original) return;

  const resolved = resolveURL(baseUrl, original);
  const proxied = `/proxy?url=${encodeURIComponent(resolved)}`;
  $el.attr(attr, proxied);
}

function rewriteLinkTags($, baseUrl) {
  $('a[href]').each((_, el) => rewriteAttribute($(el), 'href', baseUrl));
}

function rewriteFormActions($, baseUrl) {
  $('form[action]').each((_, el) => rewriteAttribute($(el), 'action', baseUrl));
}

function rewriteScripts($, baseUrl) {
  $('script[src]').each((_, el) => rewriteAttribute($(el), 'src', baseUrl));
}

function rewriteIframes($, baseUrl) {
  $('iframe[src]').each((_, el) => rewriteAttribute($(el), 'src', baseUrl));
}

function rewriteImages($, baseUrl) {
  $('img[src]').each((_, el) => rewriteAttribute($(el), 'src', baseUrl));
}

function injectSandboxOverrides($) {
  $('head').append(`
    <style>
      body { font-family: sans-serif; }
      iframe { border: none; }
    </style>
    <script>
      window.__SUB_SANDBOX__ = true;
    </script>
  `);
}

function rewriteMetaRedirects($, baseUrl) {
  $('meta[http-equiv="refresh"]').each((_, el) => {
    const content = $(el).attr('content');
    if (!content) return;

    const match = content.match(/url=(.+)/i);
    if (match && match[1]) {
      const resolved = resolveURL(baseUrl, match[1]);
      const proxied = `/proxy?url=${encodeURIComponent(resolved)}`;
      $(el).attr('content', `0;url=${proxied}`);
    }
  });
}

export function rewriteHTML(html, baseUrl) {
  try {
    const $ = cheerio.load(html, { decodeEntities: false });

    rewriteLinkTags($, baseUrl);
    rewriteFormActions($, baseUrl);
    rewriteScripts($, baseUrl);
    rewriteIframes($, baseUrl);
    rewriteImages($, baseUrl);
    rewriteMetaRedirects($, baseUrl);
    injectSandboxOverrides($);

    logInfo(`HTML rewritten for ${baseUrl}`);
    return $.html();
  } catch (err) {
    logError(`Failed to rewrite HTML: ${err.message}`);
    return html;
  }
}
