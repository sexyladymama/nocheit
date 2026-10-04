const { chromium } = await import(process.env.PLAYWRIGHT_PATH || 'playwright');
const times = process.argv.slice(2).map(Number);
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', m => console.log('console:', m.text()));
page.on('pageerror', e => console.log('ERR', e.message));
await page.goto('file://' + process.cwd() + '/promo.html');
await page.waitForFunction(() => window.READY);
for (const t of times) {
  const s = Date.now();
  await page.evaluate(t => window.renderAt(t, Math.round(t*60)), t);
  await page.screenshot({ path: `snaps/t${t.toFixed(2)}.jpg`, type: 'jpeg', quality: 85 });
  console.log(t, Date.now() - s, 'ms');
}
await browser.close();
