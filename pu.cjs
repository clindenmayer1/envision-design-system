const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
  await p.goto('http://localhost:5199/components/field', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const y = await p.evaluate(() => { const e=document.querySelector('#product'); e.scrollIntoView(); return 0; });
  await p.waitForTimeout(400);
  await p.screenshot({ path: process.argv[2]+'/t-prod.png', clip:{x:280,y:80,width:1050,height:700} });
  await b.close();
})();
