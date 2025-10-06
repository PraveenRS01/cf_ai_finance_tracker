# AI Financial Health Tracker

An AI-powered personal finance assistant built with Cloudflare Agents, featuring expense tracking, bill management, and savings goal monitoring.

## Features

- 💰 **Expense Tracking**: Add and categorize expenses with AI assistance
- 📅 **Bill Management**: Track recurring bills and payment reminders
- 🎯 **Savings Goals**: Set and monitor savings targets
- 📊 **Financial Analysis**: Get spending insights and financial summaries
- 🤖 **AI Assistant**: Natural language interaction for all financial tasks

## Tech Stack

- **Cloudflare Agents**: AI agent framework
- **Workers AI**: Llama 3.3 model for natural language processing
- **Durable Objects**: State management and SQLite database
- **Cloudflare Pages**: Frontend hosting
- **JavaScript**: Pure JS implementation (no TypeScript)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run locally**:
   ```bash
   npm start
   ```

3. **Deploy to Cloudflare**:
   ```bash
   npm run deploy
   ```

## Usage Examples

Try these commands with the AI assistant:

- "Add an expense of $50 for groceries"
- "Set a savings goal of $5000 for vacation by December 2024"
- "Add a recurring bill for rent of $1200 due on the 1st"
- "Show me my financial summary"
- "Analyze my spending patterns"

## Project Structure

```
├── src/
│   ├── index.js      # Main entry point
│   ├── server.js     # FinancialAgent class
│   └── tools.js      # Financial tools and schemas
├── public/
│   └── index.html    # Frontend interface
├── wrangler.jsonc    # Cloudflare configuration
└── package.json      # Dependencies and scripts
```

## Development

The project follows the [Cloudflare Agents Starter](https://github.com/cloudflare/agents-starter) pattern with:

- **Agent Class**: Extends Cloudflare Agent for financial operations
- **Tools System**: Modular financial tools for different operations
- **SQLite Database**: Persistent storage for financial data
- **AI Integration**: Llama 3.3 via Workers AI for natural language processing

## License

MIT
