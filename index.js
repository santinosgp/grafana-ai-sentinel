// index.js
const path = require('path');
const { loadConfig } = require('./configLoader');
const { generateUrlsFromConfig } = require('./urlGenerator');
const { scrapeMultipleUrls } = require('./scraper');

(async () => {
  try {
    const configPath = path.join(__dirname, 'config.json');
    const config = loadConfig(configPath);
    const urls = generateUrlsFromConfig(config);

    const auth = {
      user: config.auth.user,
      pass: config.auth.password,
      url: config.auth.url
    };

    const jobName = config.job.name;

    const outputDir = path.join(__dirname, 'output');
    await scrapeMultipleUrls(jobName, urls, auth, outputDir);
  } catch (err) {
    console.error('Error en ejecución principal:', err);
  }
})();
