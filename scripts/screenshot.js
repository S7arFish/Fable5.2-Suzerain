import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve('docs/screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Opening local server...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Title Screen
  console.log('Taking screenshot 1: Title Screen');
  await page.screenshot({ path: path.join(OUT_DIR, '01_title_screen.png') });

  // 2. Click "Take office" / "New chancellorship"
  console.log('Entering prologue...');
  const newBtn = await page.$('button[data-a="new"]');
  if (newBtn) {
    await newBtn.click();
    await new Promise(r => setTimeout(r, 1000));
    console.log('Taking screenshot 2: Prologue / Background selection');
    await page.screenshot({ path: path.join(OUT_DIR, '02_prologue.png') });
  }

  // 3. Take oath of office
  console.log('Taking oath of office...');
  const oathBtn = await page.$('.go .btn');
  if (oathBtn) {
    await oathBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Taking screenshot 3: Cabinet Event (Dossier)');
    await page.screenshot({ path: path.join(OUT_DIR, '03_cabinet_event.png') });
  }

  // 4. Make a choice to see outcome & map
  console.log('Choosing Great Coalition...');
  const choiceBtn = await page.$('.dossier.on .choice');
  if (choiceBtn) {
    await choiceBtn.click();
    await new Promise(r => setTimeout(r, 1200));
    console.log('Taking screenshot 4: Event outcome');
    await page.screenshot({ path: path.join(OUT_DIR, '04_event_outcome.png') });

    // Proceed past outcome
    const continueBtn = await page.$('.dossier.on .outcome .btn');
    if (continueBtn) {
      await continueBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // If another event pops up, continue or snapshot
  const choice2 = await page.$('.dossier.on .choice');
  if (choice2) {
    await choice2.click();
    await new Promise(r => setTimeout(r, 1000));
    const cont2 = await page.$('.dossier.on .outcome .btn');
    if (cont2) {
      await cont2.click();
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  // 5. Main Map & HUD view
  console.log('Taking screenshot 5: Republic Map & Agenda');
  await page.screenshot({ path: path.join(OUT_DIR, '05_main_map.png') });

  // 6. Chamber (Reichstag 3D Hemicycle) view
  console.log('Opening Reichstag chamber...');
  const chamberBtn = await page.$('button[data-a="chamber"]');
  if (chamberBtn) {
    await chamberBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Taking screenshot 6: Reichstag 3D Chamber');
    await page.screenshot({ path: path.join(OUT_DIR, '06_reichstag_chamber.png') });
  }

  console.log('Done! Screenshots saved to docs/screenshots');
  await browser.close();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
