// FinancialAgent with AI integration following agents-starter pattern
export class FinancialAgent {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.db = state.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/chat") {
      return this.handleChat(request);
    }
    
    if (url.pathname === "/api/financial-data") {
      return this.handleFinancialData(request);
    }
    
    return new Response("Financial Agent API", { status: 200 });
  }

  async handleChat(request) {
    try {
      // Check if request has a body
      if (!request.body) {
        return new Response(JSON.stringify({
          message: "No message provided",
          timestamp: new Date().toISOString()
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const { message } = await request.json();
      
      if (!message) {
        return new Response(JSON.stringify({
          message: "Message is required",
          timestamp: new Date().toISOString()
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Initialize database tables if they don't exist
      await this.initializeDatabase();
      
      // Process the financial message and determine action
      const response = await this.processFinancialMessage(message);
      
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Chat handler error:", error);
      return new Response(JSON.stringify({
        message: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  async processFinancialMessage(message) {
    try {
      // Use AI to understand and process financial requests
      // Using the correct Workers AI API
      const aiResponse = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [
          {
            role: "system",
            content: `You are a financial health assistant. Help users track expenses, manage bills, and set savings goals.

Available actions:
- add_expense: Add a new expense
- add_bill: Add a recurring bill  
- set_savings_goal: Set a savings target
- get_summary: Get financial overview

IMPORTANT: You must respond with ONLY valid JSON. No additional text or formatting.

Example response:
{"action": "add_expense", "parameters": {"amount": 50, "category": "food", "description": "groceries", "recurring": false}}`
          },
          {
            role: "user",
            content: message
          }
        ]
      });

      console.log("AI Response type:", typeof aiResponse.response);
      console.log("AI Response:", aiResponse.response);
      
      let aiResult;
      try {
        // The AI response might be a string or already an object
        if (typeof aiResponse.response === 'string') {
          aiResult = JSON.parse(aiResponse.response);
        } else {
          // If it's already an object, use it directly
          aiResult = aiResponse.response;
        }
      } catch (parseError) {
        console.error("AI response parsing error:", parseError);
        console.error("AI response:", aiResponse.response);
        // Fallback to simple parsing if AI response is not valid JSON
        return await this.fallbackParsing(message);
      }
      
      // Execute the financial action based on AI analysis
      switch (aiResult.action) {
        case "add_expense":
          return await this.executeAddExpense(aiResult.parameters);
        case "add_bill":
          return await this.executeAddBill(aiResult.parameters);
        case "set_savings_goal":
          return await this.executeSetSavingsGoal(aiResult.parameters);
        case "get_summary":
          return await this.executeGetSummary();
        default:
          return {
            message: `I received: "${message}". I can help you:
            - Add expenses (e.g., "I spent $50 on groceries")
            - Add bills (e.g., "Add rent bill of $1200 due 2024-01-01")
            - Set savings goals (e.g., "Save $5000 for vacation by 2024-12-31")
            - Get financial summary (e.g., "Show me my financial summary")`,
            timestamp: new Date().toISOString()
          };
      }
    } catch (error) {
      console.error("AI processing error:", error);
      // Fallback to simple parsing if AI fails
      return await this.fallbackParsing(message);
    }
  }

  async handleFinancialData(request) {
    try {
      await this.initializeDatabase();
      
      // Get basic financial data
      const expenses = await this.getExpenses();
      const bills = await this.getBills();
      const savingsGoals = await this.getSavingsGoals();
      const summary = await this.getFinancialSummary();
      
      return new Response(JSON.stringify({
        expenses,
        bills,
        savingsGoals,
        summary,
        timestamp: new Date().toISOString()
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Financial data handler error:", error);
      return new Response(JSON.stringify({
        expenses: [],
        bills: [],
        savingsGoals: [],
        summary: {
          monthlyExpenses: 0,
          upcomingBills: 0,
          totalSaved: 0,
          netWorth: 0
        },
        timestamp: new Date().toISOString(),
        error: "Failed to load financial data"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  async initializeDatabase() {
    // Initialize SQLite tables for financial data
    // Using the correct Durable Object storage API
    try {
      // Check if tables already exist
      const tablesExist = await this.state.storage.get("tables_initialized");
      if (tablesExist) {
        return; // Tables already initialized
      }

      // For now, we'll use simple key-value storage instead of SQLite
      // This is more compatible with the current Durable Object API
      await this.state.storage.put("tables_initialized", true);
      await this.state.storage.put("expenses", []);
      await this.state.storage.put("bills", []);
      await this.state.storage.put("savings_goals", []);
      
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }

  async getExpenses() {
    const expenses = await this.state.storage.get("expenses") || [];
    return expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 50);
  }

  async getBills() {
    const bills = await this.state.storage.get("bills") || [];
    return bills.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }

  async getSavingsGoals() {
    const goals = await this.state.storage.get("savings_goals") || [];
    return goals.sort((a, b) => new Date(a.target_date) - new Date(b.target_date));
  }

  async getFinancialSummary() {
    const expenses = await this.getExpenses();
    const bills = await this.getBills();
    const goals = await this.getSavingsGoals();
    
    // Calculate totals
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyExpenses = expenses
      .filter(exp => new Date(exp.date) >= thirtyDaysAgo)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const upcomingBills = bills
      .filter(bill => new Date(bill.due_date) >= new Date())
      .reduce((sum, bill) => sum + bill.amount, 0);
    
    const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
    
    return {
      monthlyExpenses,
      upcomingBills,
      totalSaved,
      netWorth: totalSaved - monthlyExpenses
    };
  }

  // AI-powered execution methods
  async executeAddExpense(parameters) {
    const result = await this.executions.addExpense(parameters);
    return {
      message: result.message,
      data: result.expense,
      timestamp: new Date().toISOString()
    };
  }

  async executeAddBill(parameters) {
    const result = await this.executions.addBill(parameters);
    return {
      message: result.message,
      data: result.bill,
      timestamp: new Date().toISOString()
    };
  }

  async executeSetSavingsGoal(parameters) {
    const result = await this.executions.setSavingsGoal(parameters);
    return {
      message: result.message,
      data: result.goal,
      timestamp: new Date().toISOString()
    };
  }

  async executeGetSummary() {
    const summary = await this.getFinancialSummary();
    return {
      message: "Here's your financial summary:",
      data: summary,
      timestamp: new Date().toISOString()
    };
  }

  // Fallback parsing methods (kept for error handling)
  async fallbackParsing(message) {
    const lowerMessage = message.toLowerCase();
    
    // Add expense patterns
    if (lowerMessage.includes('add expense') || lowerMessage.includes('spent') || lowerMessage.includes('bought')) {
      return await this.parseAddExpense(message);
    }
    
    // Add bill patterns
    if (lowerMessage.includes('add bill') || lowerMessage.includes('recurring bill') || lowerMessage.includes('due')) {
      return await this.parseAddBill(message);
    }
    
    // Set savings goal patterns
    if (lowerMessage.includes('savings goal') || lowerMessage.includes('save') || lowerMessage.includes('target')) {
      return await this.parseSetSavingsGoal(message);
    }
    
    // Get summary patterns
    if (lowerMessage.includes('summary') || lowerMessage.includes('overview') || lowerMessage.includes('how much')) {
      return await this.executeGetSummary();
    }
    
    // Default response
    return {
      message: `I received: "${message}". I can help you:
      - Add expenses (e.g., "I spent $50 on groceries")
      - Add bills (e.g., "Add rent bill of $1200 due 2024-01-01")
      - Set savings goals (e.g., "Save $5000 for vacation by 2024-12-31")
      - Get financial summary (e.g., "Show me my financial summary")`,
      timestamp: new Date().toISOString()
    };
  }

  // Parse add expense command (fallback)
  async parseAddExpense(message) {
    // Simple regex parsing - will be enhanced with AI in Step 5
    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    if (!amount) {
      return {
        message: "I couldn't find an amount in your message. Please try: 'I spent $50 on groceries'",
        timestamp: new Date().toISOString()
      };
    }
    
    // Extract category and description
    const category = this.extractCategory(message) || "general";
    const description = this.extractDescription(message) || `Expense of $${amount}`;
    
    // Execute the expense addition
    const result = await this.executions.addExpense({
      amount,
      category,
      description,
      recurring: false
    });
    
    return {
      message: result.message,
      data: result.expense,
      timestamp: new Date().toISOString()
    };
  }

  // Parse add bill command
  async parseAddBill(message) {
    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    if (!amount) {
      return {
        message: "I couldn't find an amount in your message. Please try: 'Add rent bill of $1200 due 2024-01-01'",
        timestamp: new Date().toISOString()
      };
    }
    
    // Extract bill name and due date
    const name = this.extractBillName(message) || "Bill";
    const dueDate = this.extractDate(message) || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
    const category = this.extractCategory(message) || "utilities";
    
    // Execute the bill addition
    const result = await this.executions.addBill({
      name,
      amount,
      dueDate,
      category,
      recurring: true
    });
    
    return {
      message: result.message,
      data: result.bill,
      timestamp: new Date().toISOString()
    };
  }

  // Parse set savings goal command
  async parseSetSavingsGoal(message) {
    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
    const targetAmount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    if (!targetAmount) {
      return {
        message: "I couldn't find a target amount in your message. Please try: 'Save $5000 for vacation by 2024-12-31'",
        timestamp: new Date().toISOString()
      };
    }
    
    // Extract goal name and target date
    const name = this.extractGoalName(message) || "Savings Goal";
    const targetDate = this.extractDate(message) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year from now
    const monthlyContribution = Math.ceil(targetAmount / 12); // Simple calculation
    
    // Execute the savings goal setting
    const result = await this.executions.setSavingsGoal({
      name,
      targetAmount,
      targetDate,
      monthlyContribution
    });
    
    return {
      message: result.message,
      data: result.goal,
      timestamp: new Date().toISOString()
    };
  }

      // Helper methods for parsing
      extractAmount(message) {
        const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
        return amountMatch ? parseFloat(amountMatch[1]) : null;
      }

      extractCategory(message) {
    const categories = ['food', 'groceries', 'transport', 'entertainment', 'utilities', 'rent', 'insurance', 'healthcare'];
    const lowerMessage = message.toLowerCase();
    
    for (const category of categories) {
      if (lowerMessage.includes(category)) {
        return category;
      }
    }
    return null;
  }

  extractDescription(message) {
    // Simple description extraction
    const words = message.split(' ');
    const startIndex = words.findIndex(word => word.includes('$') || word.includes('spent') || word.includes('bought'));
    if (startIndex !== -1 && startIndex < words.length - 1) {
      return words.slice(startIndex + 1, Math.min(startIndex + 5, words.length)).join(' ');
    }
    return null;
  }

  extractBillName(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('rent')) return 'Rent';
    if (lowerMessage.includes('electricity')) return 'Electricity';
    if (lowerMessage.includes('water')) return 'Water';
    if (lowerMessage.includes('internet')) return 'Internet';
    return 'Bill';
  }

  extractGoalName(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('vacation')) return 'Vacation Fund';
    if (lowerMessage.includes('emergency')) return 'Emergency Fund';
    if (lowerMessage.includes('car')) return 'Car Fund';
    if (lowerMessage.includes('house')) return 'House Fund';
    return 'Savings Goal';
  }

  extractDate(message) {
    // Simple date extraction - looks for YYYY-MM-DD format
    const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
  }

  // Tool execution handlers for human-in-the-loop confirmations
  // Following agents-starter pattern
  get executions() {
    return {
      addExpense: async ({ amount, category, description, recurring }) => {
        const id = crypto.randomUUID();
        const date = new Date().toISOString();
        
        const expense = { id, amount, category, description, date, recurring };
        
        // Get existing expenses and add new one
        const expenses = await this.state.storage.get("expenses") || [];
        expenses.push(expense);
        await this.state.storage.put("expenses", expenses);
        
        return {
          success: true,
          message: `Added expense: $${amount} for ${category} - ${description}`,
          expense
        };
      },

      addBill: async ({ name, amount, dueDate, category, recurring }) => {
        const id = crypto.randomUUID();
        
        const bill = { id, name, amount, due_date: dueDate, recurring, category };
        
        // Get existing bills and add new one
        const bills = await this.state.storage.get("bills") || [];
        bills.push(bill);
        await this.state.storage.put("bills", bills);
        
        return {
          success: true,
          message: `Added bill: ${name} - $${amount} due ${dueDate}`,
          bill
        };
      },

      setSavingsGoal: async ({ name, targetAmount, targetDate, monthlyContribution }) => {
        const id = crypto.randomUUID();
        
        const goal = { id, name, target_amount: targetAmount, target_date: targetDate, monthly_contribution: monthlyContribution, current_amount: 0 };
        
        // Get existing goals and add new one
        const goals = await this.state.storage.get("savings_goals") || [];
        goals.push(goal);
        await this.state.storage.put("savings_goals", goals);
        
        return {
          success: true,
          message: `Set savings goal: ${name} - $${targetAmount} by ${targetDate}`,
          goal
        };
      }
    };
  }
}
