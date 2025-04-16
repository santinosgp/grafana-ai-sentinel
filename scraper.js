const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeGrafanaPage(page, url) {
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('.dashboard-row__title.pointer', { timeout: 10000 });
    const collapsibleRows = await page.$$('.dashboard-row__title.pointer');
    console.log(`🔎 Filas colapsables encontradas: ${collapsibleRows.length}`);

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

    await page.evaluateOnNewDocument(() => {
        window.addEventListener('beforeunload', (e) => {
          e.stopImmediatePropagation();
        }, true);
    });

    console.log(`✅ Scraping`);
    const flatResults = [];

    for (const { url, host, dashboardName, description, env, country } of urls) {
      console.log(`url: ${url}`);
      try {
        const result = await scrapeGrafanaPage(page, url);
        flatResults.push({
          dashboardName,
          description,
          env,
          country,
          host,
          url,
          ...result
        });
      } catch (e) {
        console.error(`❌ Error en ${host}: ${e.message}`);
        flatResults.push({
          dashboardName,
          description,
          env,
          country,
          host,
          url,
          error: e.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Agrupar por dashboard
    const groupedResults = {};
    for (const entry of flatResults) {
      const key = `${entry.dashboardName}_${entry.env}_${entry.country}`;
      if (!groupedResults[key]) {
        groupedResults[key] = {
          name: entry.dashboardName,
          description: entry.description,
          env: entry.env,
          country: entry.country,
          hosts: []
        };
      }

      groupedResults[key].hosts.push({
        host: entry.host,
        url: entry.url,
        metrics: entry.metrics || null,
        error: entry.error || null,
        timestamp: entry.timestamp
      });
    }

    const finalOutput = Object.values(groupedResults);

    // Guardar
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `${jobName}_${timestamp}.json`;
    const outputPath = path.join(outputDir, filename);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2));
    console.log(`✅ Datos agrupados guardados en ${outputPath}`);
    console.log(`✅ Scraping completado`);

  } catch (e) {
    console.error('❌ Error general:', e);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeMultipleUrls };
