# PulseTrader

A daily AI-powered stock and options picks dashboard built as a single self-contained HTML file. No backend, no build step, no dependencies to install — just open in a browser.
This idea came from getting constant suggestions on what stock to buy, where to find the latest news, what is better to get long-term vs short-term, etc.

## What it does

- **Today's Picks** — 50 AI-generated stock, call, and put picks daily across all budget levels ($20 to $25k+), with entry range, target, stop-loss, confidence score, and horizon notes
- **Weekly Earnings Calls** — upcoming earnings rated Hot / Watch / Avoid with beginner-friendly trade strategies for each
- **Market Pulse** — social buzz heatmap and catalyst feed covering political mentions, Reddit/X momentum, meme stocks, insider trades, and macro events
- **Starter Stocks** — 28 daily picks spanning $2 penny stocks to $5k+ premium shares with plain-English buy/sell reasoning
- **Options 101** — budget-tiered options picks ($20–$100 / $100–$500 / $500–$2k / $2k+) with step-by-step instructions and sell rules
- **Beginner's Guide** — how to buy stocks, calls, and puts with risk management basics

## How it works

All picks and analysis are generated at runtime by Claude (claude-sonnet-4-6) via the Anthropic Messages API called directly from the browser. Results are cached in localStorage per day so the API is only called once per section per day.

## Setup

1. Clone or download the repo
2. Open `index.html` in any modern browser
3. Enter your [Anthropic API key](https://console.anthropic.com/settings/keys) when prompted — stored locally in your browser, never sent anywhere except Anthropic's servers
4. Picks generate automatically

## Hosting

Deployed via GitHub Pages. No server required — the entire app is one HTML file.

## Tech stack

- Vanilla HTML/CSS/JS — zero frameworks, zero build tooling
- [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) (`claude-sonnet-4-6`)
- [Tabler Icons](https://tabler.io/icons) via CDN
- localStorage for daily caching

## Disclaimer

Not financial advice. AI-generated picks are for educational and informational purposes only. Always conduct your own research before investing. Past performance does not guarantee future results.
This site is designed as a GUIDE.
