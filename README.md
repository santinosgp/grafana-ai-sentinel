# Grafana AI Sentinel

A smart scraping utility for extracting metrics from Grafana dashboards and preparing them for AI-based analysis.

## 🚀 What it does

- Logs into a Grafana instance (optional, if needed).
- Automatically scrapes metrics from multiple dashboards and servers.
- Uses a flexible JSON configuration with variable expansion.
- Saves metrics to `.json` files, timestamped for easy versioning.
- Designed to feed the output into a Large Language Model (LLM) for analysis.

## 🛠 Requirements

- Node.js >= 18
- Access to a Grafana instance
- Optional: Puppeteer-compatible environment (headless Chrome)

## 📁 Configuration

Customize `config.json`:

```json
{
  "job": {
    "name": "dedup-monitoring",
    "description": "Monitoring for Dedup"
  },
  "auth": {
    "url": "http://grafana.yourcompany.com:3000",
    "user": "admin",
    "password": "admin"
  },
  "dashboards": [
    {
      "name": "elastic",
      "description": "ElasticSearch monitoring",
      "env": "pro",
      "country": "es",
      "baseUrl": "http://grafana.yourcompany.com:3000/d/abc123/monitoring?var-env={env}&var-country={country}&var-host={host}",
      "hosts": [
        "elastic-node[1:3].{env}.{country}.yourcompany.com"
      ]
    }
  ]
}
