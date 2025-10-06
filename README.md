# AI-Powered Personal Financial Health Tracker

A sophisticated AI-powered financial management application built with Cloudflare Agents, featuring Llama 3.3 integration, Durable Objects for state management, and a modern chat interface for natural language financial interactions.

## Features

### AI-Powered Financial Assistant
- **Natural Language Processing**: Chat with your AI assistant using everyday language
- **Llama 3.3 Integration**: Powered by Cloudflare Workers AI for intelligent financial advice
- **Smart Expense Tracking**: "I spent $50 on groceries" → Automatically categorized and logged
- **Bill Management**: "Add rent bill of $1200 due 2024-02-01" → Scheduled reminders
- **Savings Goals**: "Save $5000 for vacation by 2024-12-31" → Progress tracking

### Real-Time Financial Dashboard
- **Live Financial Overview**: Monthly expenses, upcoming bills, total savings
- **Recent Transactions**: Latest expenses with categories and descriptions
- **Upcoming Bills**: Due dates and amounts at a glance
- **Net Worth Calculation**: Real-time financial health metrics

### Modern User Interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Chat Interface**: Intuitive conversation-based interaction
- **Quick Actions**: One-click buttons for common financial tasks
- **Real-Time Updates**: Live data synchronization with backend

### Technical Architecture
- **Cloudflare Workers**: Serverless backend with global edge deployment
- **Durable Objects**: Persistent state management for financial data
- **Workers AI**: Llama 3.3 model integration for natural language processing
- **Key-Value Storage**: Efficient data persistence using Durable Object storage

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Cloudflare Account** (free tier works fine)
- **Git** (for cloning the repository)

### 1. Clone the Repository

```bash
git clone https://github.com/PraveenRS01/cf_ai_finance_tracker.git
cd cf_ai_finance_tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Cloudflare Account

1. **Create Account**: Go to [Cloudflare Dashboard](https://dash.cloudflare.com/sign-up)
2. **Enable Workers AI**: 
   - Navigate to Workers & Pages
   - Click "Workers AI" 
   - Enable the service (free tier includes usage)
3. **Login to Wrangler**:
   ```bash
   npx wrangler login
   ```
   This will open your browser for OAuth authentication.

### 4. Get Your Account ID

```bash
npx wrangler whoami
```

Copy your Account ID and update `wrangler.jsonc`:
```json
{
  "account_id": "YOUR_ACCOUNT_ID_HERE"
}
```

### 5. Start Development Servers

**Terminal 1 - Backend (Worker):**
```bash
npm run dev
# or
npx wrangler dev
```

**Terminal 2 - Frontend (Pages):**
```bash
npm run frontend:dev
# or
npx wrangler pages dev public --compatibility-date=2024-09-23
```

### 6. Access the Application

- **Frontend**: http://localhost:8788 (or the URL shown in terminal)
- **Backend API**: http://127.0.0.1:8787

## Testing the Application

### Backend API Testing

Test the AI-powered backend using curl commands:

```bash
# Test 1: Add Expense
curl -X POST http://127.0.0.1:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I spent $50 on groceries"}'

# Test 2: Add Bill
curl -X POST http://127.0.0.1:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Add rent bill of $1200 due 2024-02-01"}'

# Test 3: Set Savings Goal
curl -X POST http://127.0.0.1:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Save $5000 for vacation by 2024-12-31"}'

# Test 4: Get Financial Summary
curl -X POST http://127.0.0.1:8787/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me my financial summary"}'

# Test 5: Financial Data API
curl http://127.0.0.1:8787/api/financial-data
```

### Frontend Testing

1. **Open the frontend** in your browser
2. **Try these natural language commands**:
   - "I just bought groceries for $75 at Whole Foods"
   - "Add my electricity bill of $150 due on 2024-02-15"
   - "I want to save $3000 for emergency fund by June 2024"
   - "Show me my financial overview"

3. **Use Quick Action buttons** for one-click operations
4. **Check the dashboard** for real-time financial metrics

## Project Structure

```
cf_ai_finance_tracker/
├── src/
│   ├── index.js          # Main Worker entry point
│   ├── server.js         # FinancialAgent Durable Object
│   ├── tools.js          # Financial tool definitions
│   └── utils.js          # Utility functions
├── public/
│   ├── index.html        # Frontend HTML
│   ├── css/
│   │   └── style.css     # Modern UI styles
│   └── js/
│       └── app.js        # Frontend JavaScript
├── wrangler.jsonc        # Cloudflare configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Configuration

### wrangler.jsonc

```json
{
  "name": "cf-ai-finance-tracker",
  "main": "src/index.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "account_id": "YOUR_ACCOUNT_ID",
  "durable_objects": {
    "bindings": [
      {
        "name": "FinancialAgent",
        "class_name": "FinancialAgent",
        "script_name": "cf-ai-finance-tracker"
      }
    ]
  },
  "ai": {
    "binding": "AI"
  }
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "pages:dev": "wrangler pages dev public --compatibility-date=2024-09-23",
    "pages:deploy": "wrangler pages deploy public",
    "frontend:dev": "npm run pages:dev",
    "frontend:deploy": "npm run pages:deploy"
  }
}
```

## AI Capabilities

### Supported Financial Actions

| Action | Example Command | AI Response |
|--------|----------------|-------------|
| **Add Expense** | "I spent $50 on groceries" | Extracts amount, category, description |
| **Add Bill** | "Add rent bill of $1200 due 2024-02-01" | Creates recurring bill with due date |
| **Set Savings Goal** | "Save $5000 for vacation by 2024-12-31" | Calculates monthly contribution |
| **Get Summary** | "Show me my financial summary" | Provides comprehensive overview |

### AI Processing Flow

1. **Natural Language Input**: User sends message via chat
2. **AI Analysis**: Llama 3.3 processes and understands intent
3. **Action Extraction**: AI determines action and parameters
4. **Data Execution**: Financial data is stored/retrieved
5. **Response Generation**: AI provides contextual feedback

## Data Storage

### Durable Object Storage

The application uses Cloudflare Durable Objects for persistent data storage:

- **Expenses**: Array of expense objects with amount, category, description, date
- **Bills**: Array of bill objects with name, amount, due date, recurring status
- **Savings Goals**: Array of goal objects with target amount, target date, progress
- **Financial Summary**: Calculated metrics for dashboard display

### Data Structure Examples

```javascript
// Expense Object
{
  id: "uuid",
  amount: 75,
  category: "food",
  description: "Whole Foods groceries",
  date: "2024-01-06T...",
  recurring: false
}

// Bill Object
{
  id: "uuid",
  name: "Rent",
  amount: 1200,
  due_date: "2024-02-01",
  category: "housing",
  recurring: true
}

// Savings Goal Object
{
  id: "uuid",
  name: "Vacation Fund",
  target_amount: 5000,
  target_date: "2024-12-31",
  monthly_contribution: 417,
  current_amount: 0
}
```

## Development

### Local Development

1. **Backend Development**:
   ```bash
   npm run dev
   ```
   - Hot reloading enabled
   - Durable Object state persists between restarts
   - AI integration works in development

2. **Frontend Development**:
   ```bash
   npm run frontend:dev
   ```
   - Live reloading for HTML/CSS/JS changes
   - Automatic API connection to backend

### Debugging

- **Backend Logs**: Check terminal running `wrangler dev`
- **Frontend Console**: Open browser DevTools for JavaScript errors
- **AI Responses**: Logged in backend console for debugging

### Testing

- **Unit Tests**: Test individual functions in `src/utils.js`
- **Integration Tests**: Use curl commands to test API endpoints
- **UI Tests**: Manual testing through frontend interface