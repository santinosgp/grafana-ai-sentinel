const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeGrafanaPage(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.panel-container');
  
    return await page.evaluate(() => {
      const result = {};
      const panels = Array.from(document.querySelectorAll('.panel-container'));
      panels.forEach(panel => {
        const lines = panel.innerText.trim().split('\n');
        if (lines.length >= 2) {
          const label = lines[0].trim();
          const value = lines[1].trim();
          result[label] = value;
        }
      });
      return {
        metrics: result,
        timestamp: new Date().toISOString()
      };
    });
  }


async function scrapeMultipleUrls(jobName, urls, auth, outputDir) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    if (auth.user && auth.pass) {
      console.log(`✅ Login: ${auth.url} ${auth.user}`);
      await page.goto(`${auth.url}/login`, { waitUntil: 'networkidle2' });
      await page.type('input[name="user"]', auth.user, { delay: 30 });
      await page.type('input[name="password"]', auth.pass, { delay: 30 });
      await Promise.all([
        page.click('button[aria-label="Login button"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        throw new Error('❌ Login fallido: aún estás en la página de login.');
      }
      console.log(`✅ Login OK:  ${currentUrl}`);
    } else {
        console.log(`❌ NO Login: no se proporcionaron credenciales.`);
    }

    console.log(`✅ Scraping`);
    const results = [];
    for (const { url, host } of urls) {
        console.log(`url: ${url}`);
      try {
        const metrics = await scrapeGrafanaPage(page, url);
        results.push({ host, url, ...metrics });
      } catch (e) {
        console.error(`❌ Error en ${host}: ${e.message}`);
        results.push({ host, url, error: e.message });
      }
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputDir = path.join(__dirname, 'output');
    const filename = `${jobName}_${timestamp}.json`;
    const outputPath = path.join(outputDir, filename);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`✅ Datos guardados para ${jobName} en ${outputDir}`);
    console.log(`✅ Scraping completado`);

  } catch (e) {
    console.error('❌ Error general:', e);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeMultipleUrls };
