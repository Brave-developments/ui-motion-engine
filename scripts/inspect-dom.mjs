#!/usr/bin/env node
/**
 * Phase 0 local-only visual evidence tool. NO editable React extraction yet.
 * No remote URLs, login cookies, arbitrary JavaScript expressions or credential retrieval.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

export function parseArgs(args) {
  const out = { url: '', selector: '', out: 'out/inspect', width: 1440, height: 900, dpr: 1 };
  const validKeys = new Set(['url', 'selector', 'out', 'width', 'height', 'dpr']);
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!key.startsWith('--') || !validKeys.has(key.slice(2)) || !args[i + 1]) throw new Error(`Unknown or incomplete option: ${key}`);
    out[key.slice(2)] = args[++i];
  }
  out.width = Number(out.width); out.height = Number(out.height); out.dpr = Number(out.dpr);
  if (!Number.isInteger(out.width) || out.width < 320 || out.width > 3840) throw new Error('width must be 320..3840');
  if (!Number.isInteger(out.height) || out.height < 240 || out.height > 2160) throw new Error('height must be 240..2160');
  if (!Number.isFinite(out.dpr) || out.dpr < 1 || out.dpr > 3) throw new Error('dpr must be 1..3');
  return out;
}

export function assertLocalUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Only local HTTP(S) website URLs are allowed in this starter inspector');
  }
  if (url.username || url.password) throw new Error('URL credentials are forbidden');
  return url;
}

export async function inspect(options) {
  const dest = path.resolve(options.out);
  const targetUrl = assertLocalUrl(options.url).toString();
  await fs.mkdir(dest, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  let context;
  try {
    context = await browser.newContext({
      viewport: { width: options.width, height: options.height },
      deviceScaleFactor: options.dpr,
      locale: 'en-AU', timezoneId: 'Australia/Brisbane',
      reducedMotion: 'reduce', serviceWorkers: 'block'
    });
    // Limit navigations and subresource origins: localhost only.
    await context.route('**/*', async (route) => {
      let url;
      try { url = new URL(route.request().url()); } catch { return route.abort(); }
      const ok = ['http:', 'https:'].includes(url.protocol) &&
        ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
      if (ok) return route.continue();
      return route.abort();
    });
    const page = await context.newPage();
    const failed = { count: 0 };
    page.on('requestfailed', () => { failed.count++; });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.evaluate(async () => {
      await Promise.race([document.fonts.ready, new Promise(resolve => setTimeout(resolve, 4000))]);
      await Promise.race([Promise.all(Array.from(document.images).slice(0, 100).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.addEventListener('load', resolve, { once: true }); img.addEventListener('error', resolve, { once: true }); });
      })), new Promise(resolve => setTimeout(resolve, 4000))]);
    });
    let selectorInfo = { query: options.selector || null, matched: 0, status: 'not requested' };
    if (options.selector) {
      const chosen = page.locator(options.selector);
      selectorInfo.matched = await chosen.count();
      if (selectorInfo.matched === 1) {
        // Align reference screenshot with the target viewport location.
        await chosen.scrollIntoViewIfNeeded({ timeout: 5000 });
        selectorInfo.status = 'unique';
      } else selectorInfo.status = selectorInfo.matched ? 'ambiguous' : 'not found';
    }
    const dom = await page.evaluate(() => {
      const selectors = '[data-motion-id], article, [class*=card], [class*=Card], [class*=resource], [class*=Resource], button, input, a';
      return Array.from(document.querySelectorAll(selectors)).slice(0, 300).map((el, i) => {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          index: i, tag: el.tagName.toLowerCase(),
          motionId: el.getAttribute('data-motion-id'),
          classes: (typeof el.className === 'string' ? el.className.slice(0, 150) : ''),
          label: ((el.getAttribute('aria-label') || el.textContent || '').trim()).slice(0, 100),
          rectCssPx: { x: r.x, y: r.y, width: r.width, height: r.height },
          visible: r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
        };
      });
    });
    await page.screenshot({ path: path.join(dest, 'reference.png'), animations: 'disabled', caret: 'hide' });
    let selectedRect = null;
    if (options.selector && selectorInfo.status === 'unique') {
      const chosen = page.locator(options.selector);
      selectedRect = await chosen.boundingBox();
      if (selectedRect?.width > 0 && selectedRect?.height > 0) {
        await chosen.screenshot({ path: path.join(dest, 'target.png'), animations: 'disabled' });
      } else selectorInfo.status = 'zero-sized/hidden';
    }
    const result = {
      status: 'inspection-only-not-a-video-generator',
      url: targetUrl,
      title: await page.title(),
      capturedAt: new Date().toISOString(),
      viewportCssPx: { width: options.width, height: options.height, deviceScaleFactor: options.dpr },
      scrollCssPx: await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })),
      selector: selectorInfo,
      selectedRectCssPx: selectedRect,
      failedRequestCount: failed.count,
      candidates: dom,
      warnings: [
        'All image crops are raw screenshots, NOT guaranteed transparent layers.',
        'Component export paths are not inferred by this browser-only inspector.',
        'Only local origins are allowed: remote assets may be intentionally blocked.'
      ]
    };
    await fs.writeFile(path.join(dest, 'inspect.json'), JSON.stringify(result, null, 2));
    return result;
  } finally {
    if (context) await context.close();
    await browser.close();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const result = await inspect(options);
    console.log(`Reference captured: ${path.resolve(options.out)}`);
    console.log(`Candidates: ${result.candidates.length}, selector: ${result.selector.status}, failed requests: ${result.failedRequestCount}`);
    if (result.selector.status === 'ambiguous') process.exitCode = 2;
  } catch (err) { console.error(err.message); process.exitCode = 1; }
}
