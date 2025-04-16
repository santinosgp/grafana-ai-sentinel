# Grafana AI Sentinel

🚀 A smart scraping utility to extract metrics from Grafana dashboards and analyze them using LLMs (Large Language Models).

---

## 🔍 What It Does

- 🔐 Logs into a Grafana instance (if credentials are provided)
- 📊 Scrapes metrics from multiple dashboards and servers using Puppeteer
- 🧠 Sends the results to a local or remote LLM (e.g., LLM Studio) for DevOps-style analysis
- 🗂 Saves results as timestamped `.json` files for historical review and post-processing
- 🔧 Fully customizable via a flexible `config.json` file with variable expansion
- 📦 Easy to integrate into existing observability and alerting pipelines

---

## 🛠 Requirements

- Node.js ≥ 18
- Access to a Grafana instance (with or without login)
- Local environment with Puppeteer and optionally an LLM backend (e.g., [LM Studio](https://lmstudio.ai/))

---

## 📁 Configuration

Create and customize a `config.json` file in the root directory. Example:

```json
{
  "job": {
    "name": "monitoring",
    "description": "Monitoring for my company"
  },
  "auth": {
    "url": "http://grafana.yourcompany.com:3000",
    "user": "admin",
    "password": "admin"
  },
  "dashboards": [
    {
      "name": "Elasticsearch",
      "description": "- Debian 10 servers running Elasticsearch 7.17.18\n- High RAM usage is normal\n- Ignore CPU load under 90%",
      "env": "pro",
      "country": "es",
      "baseUrl": "http://grafana.yourcompany.com:3000/d/abc123/monitoring?var-env={env}&var-country={country}&var-host={host}&from=now-1h&to=now",
      "hosts": [
        "elastic-node[1:3].{env}.{country}.yourcompany.com"
      ]
    }
  ]
}
```

- Use `{env}`, `{country}`, and `{host}` in `baseUrl` and `hosts` to dynamically generate URLs.
- Host ranges are supported with `[start:end]` syntax.

---

## 📦 Installation

```bash
git clone https://github.com/yourorg/grafana-ai-sentinel.git
cd grafana-ai-sentinel
npm install
```

---

## 🚀 Usage

### Scrape metrics:

```bash
npm start
```

### Analyze metrics with a local LLM (via LM Studio):

```bash
npm run analyze
```

This uses:

- The most recent `.json` file in the `output/` directory
- A prompt stored in `./prompts/devops-summary.txt`
- A call to `http://localhost:1234/v1/chat/completions`

---

## 🧠 Prompt Template

Your prompt should contain the placeholder `{{JSON_HERE}}`, which will be replaced with the actual scraped metrics:

```txt
You are a DevOps expert. Analyze the following metrics for anomalies and generate a summary:

{{JSON_HERE}}
```

---

## 📂 Project Structure

```
grafana-ai-sentinel/
├── config.json             # Project configuration
├── output/                 # Scraped JSON results
├── prompts/                # Prompt templates for LLM
├── configLoader.js         # Loads and parses config
├── urlGenerator.js         # Expands host patterns into full URLs
├── scraper.js              # Headless browser logic with Puppeteer
├── ia-analyze.js           # LLM inference script
├── run-analysis.sh         # Bash wrapper for LLM analysis
└── index.js                # Entry point for scraping
```

---

## ✨ Coming Soon

- [ ] Email/Telegram notifications with summaries
- [ ] UI to visualize scraping history
- [ ] Integration with cloud-hosted LLMs (OpenAI, Claude, etc.)

---

## 🤖 Built with ♥️ by engineers who hate waking up for false alerts.
