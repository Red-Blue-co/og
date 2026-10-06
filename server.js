// og.sherin.fun: link preview images for sherin.fun sites.
//   GET /og?url=https://qode.sherin.fun/   ->  1200x630 PNG
// Opens the page in headless Chromium, screenshots it, and lays it out in the
// red-blue card (card.js). Results are cached on disk so crawlers get them fast.
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const card = require('./card');

const PORT = process.env.PORT || 3003;
const CACHE_DIR = path.join(__dirname, 'cache');
const CACHE_HOURS = Number(process.env.CACHE_HOURS || 24);
const MAX_PAGES = 2; // pages rendered at the same time

fs.mkdirSync(CACHE_DIR, { recursive: true });

// Only our own sites: sherin.fun and its subdomains, over https
function allowed(raw) {
    let u;
    try { u = new URL(raw); } catch (e) { return null; }
    if (u.protocol !== 'https:') return null;
    const host = u.hostname.toLowerCase();
    if (host !== 'sherin.fun' && !host.endsWith('.sherin.fun')) return null;
    if (host === 'og.sherin.fun') return null; // never screenshot ourselves
    u.hash = '';
    return u;
}

let browserPromise = null;
function browser() {
    if (!browserPromise) {
        browserPromise = chromium.launch({ args: ['--no-sandbox'] }).catch((e) => { browserPromise = null; throw e; });
    }
    return browserPromise;
}

// A tiny queue so a burst of crawlers cannot open dozens of pages at once
let running = 0;
const waiting = [];
async function slot(fn) {
    if (running >= MAX_PAGES) await new Promise((r) => waiting.push(r));
    running++;
    try { return await fn(); } finally {
        running--;
        const next = waiting.shift();
        if (next) next();
    }
}

async function render(url) {
    const b = await browser();
    const ctx = await b.newContext({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 1, colorScheme: 'dark' });
    try {
        const page = await ctx.newPage();
        await page.goto(url.href, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
        // The final address must still be one of ours (no redirects elsewhere)
        if (!allowed(page.url())) throw Object.assign(new Error('Redirected to a site that is not allowed'), { status: 400 });
        await page.waitForTimeout(600); // let entrance animations settle
        const info = await page.evaluate(() => {
            const meta = (n) => (document.querySelector(`meta[property="${n}"], meta[name="${n}"]`) || {}).content || '';
            const iconEl = document.querySelector('link[rel="icon"][type="image/svg+xml"], link[rel="icon"], link[rel="apple-touch-icon"]');
            return {
                title: meta('og:title') || document.title || location.hostname,
                description: meta('og:description') || meta('description'),
                icon: iconEl ? iconEl.href : '',
            };
        });
        const shot = await page.screenshot({ type: 'jpeg', quality: 85 });

        let icon = '';
        if (info.icon && allowed(info.icon)) {
            const res = await ctx.request.get(info.icon).catch(() => null);
            if (res && res.ok()) {
                const type = res.headers()['content-type'] || 'image/png';
                icon = `data:${type.split(';')[0]};base64,${(await res.body()).toString('base64')}`;
            }
        }

        const out = await ctx.newPage();
        await out.setViewportSize({ width: 1200, height: 630 });
        await out.setContent(card({
            title: info.title.trim(),
            description: info.description.trim(),
            host: url.hostname,
            shot: `data:image/jpeg;base64,${shot.toString('base64')}`,
            icon,
        }), { waitUntil: 'networkidle' });
        await out.evaluate(() => document.fonts.ready);
        return await out.screenshot({ type: 'png' });
    } finally {
        await ctx.close();
    }
}

// Same address while the first render is still running: share it
const inFlight = new Map();

const app = express();

app.get('/og', async (req, res) => {
    const url = allowed(String(req.query.url || ''));
    if (!url) return res.status(400).type('text').send('Pass ?url= with an https address on sherin.fun or a subdomain.');

    const key = crypto.createHash('sha1').update(url.href + '|' + (req.query.v || '')).digest('hex');
    const file = path.join(CACHE_DIR, `${key}.png`);
    const send = (buf) => res.set({ 'Content-Type': 'image/png', 'Cache-Control': `public, max-age=${CACHE_HOURS * 3600}` }).send(buf);

    try {
        const stat = fs.statSync(file);
        if (Date.now() - stat.mtimeMs < CACHE_HOURS * 3600 * 1000) return send(fs.readFileSync(file));
    } catch (e) { /* not cached yet */ }

    try {
        if (!inFlight.has(key)) {
            inFlight.set(key, slot(() => render(url)).then((png) => {
                fs.writeFileSync(file, png);
                return png;
            }).finally(() => inFlight.delete(key)));
        }
        send(await inFlight.get(key));
    } catch (err) {
        console.error(`[og] ${url.href}:`, err.message);
        res.status(err.status || 502).type('text').send('Could not make a preview for this page.');
    }
});

app.get('/', (req, res) => {
    res.type('html').send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>og.sherin.fun</title>
<body style="margin:0;font-family:system-ui;background:#030305;color:#fff;padding:32px">
<h1 style="margin:0 0 8px">og.sherin.fun</h1>
<p style="color:#aaa">Link preview images for sherin.fun sites. Use <code>/og?url=https://qode.sherin.fun/</code> as the page's og:image.</p>
<img src="/og?url=${encodeURIComponent('https://qode.sherin.fun/')}" style="width:100%;max-width:900px;border-radius:12px;margin-top:16px" alt="Example preview">
</body>`);
});

app.listen(PORT, '127.0.0.1', () => console.log(`og server on http://localhost:${PORT}`));
