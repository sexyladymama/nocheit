const { chromium } = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
import fs from 'fs';
const FPS = +(process.env.FPS || 60), DUR = 32, N = +(process.env.WORKERS || 4);
const total = FPS * DUR; const out = process.env.OUT || 'frames';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
let done = 0; const t0 = Date.now();
async function worker(w) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('ERR', e.message));
  await page.goto('file://' + process.cwd() + '/promo.html');
  await page.waitForFunction(() => window.READY);
  for (let f = w; f < total; f += N) {
    const fn = `${out}/f${String(f).padStart(5, '0')}.jpg`;
    if (fs.existsSync(fn)) { done++; continue; }
    await page.evaluate(([t, f]) => window.renderAt(t, f), [f / FPS, f]);
    await page.screenshot({ path: fn, type: 'jpeg', quality: 95 });
    if (++done % 100 === 0) console.log(`${done}/${total} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
}
await Promise.all([...Array(N)].map((_, i) => worker(i)));
await browser.close();
console.log('DONE', (Date.now() - t0) / 1000);
