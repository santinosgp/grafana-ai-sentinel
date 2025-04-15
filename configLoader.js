const fs = require('fs');
const path = require('path');

function loadConfig() {
  const configPath = path.resolve(__dirname, 'config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('No se encontró el archivo config.json');
  }
  const rawData = fs.readFileSync(configPath);
  return JSON.parse(rawData);
}

module.exports = { loadConfig };
