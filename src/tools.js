import { z } from "zod";

// Financial tracking tools (simplified version for now)
// We'll implement proper tool() function in Step 5 with AI integration
export const addExpense = {
  description: "Add a new expense to track spending",
  parameters: z.object({
    amount: z.number().describe("The amount spent"),
    category: z.string().describe("Category of expense (e.g., food, transport, entertainment)"),
    description: z.string().describe("Description of the expense"),
    recurring: z.boolean().optional().describe("Whether this is a recurring expense")
  })
};

export const addBill = {
  description: "Add a recurring bill or payment reminder",
  parameters: z.object({
    name: z.string().describe("Name of the bill"),
    amount: z.number().describe("Amount of the bill"),
    dueDate: z.string().describe("Due date in YYYY-MM-DD format"),
    category: z.string().describe("Category of the bill (e.g., utilities, rent, insurance)"),
    recurring: z.boolean().optional().describe("Whether this bill recurs monthly")
  })
};

export const setSavingsGoal = {
  description: "Set a savings goal with target amount and timeline",
  parameters: z.object({
    name: z.string().describe("Name of the savings goal"),
    targetAmount: z.number().describe("Target amount to save"),
    targetDate: z.string().describe("Target date in YYYY-MM-DD format"),
    monthlyContribution: z.number().describe("Monthly contribution amount")
  })
};

export const getFinancialSummary = {
  description: "Get a comprehensive financial summary including expenses, bills, and savings",
  parameters: z.object({}),
  execute: async ({}, { env, state }) => {
    const expensesResult = await state.storage.prepare(`
      SELECT SUM(amount) as total_expenses FROM expenses 
      WHERE date >= date('now', '-30 days')
    `).first();
    
    const billsResult = await state.storage.prepare(`
      SELECT SUM(amount) as total_bills FROM bills 
      WHERE due_date >= date('now')
    `).first();
    
    const savingsResult = await state.storage.prepare(`
      SELECT SUM(current_amount) as total_saved FROM savings_goals
    `).first();
    
    return {
      success: true,
      summary: {
        monthlyExpenses: expensesResult.total_expenses || 0,
        upcomingBills: billsResult.total_bills || 0,
        totalSaved: savingsResult.total_saved || 0,
        netWorth: (savingsResult.total_saved || 0) - (expensesResult.total_expenses || 0)
      },
      message: "Here's your financial summary for the last 30 days"
    };
  }
};

// Export all tools
export const financialTools = [
  addExpense,
  addBill,
  setSavingsGoal,
  getFinancialSummary
];
