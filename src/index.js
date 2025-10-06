// Main entry point for the Financial Agent
export { FinancialAgent } from "./server.js";

// Default export for the Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Route requests to the FinancialAgent Durable Object
    if (url.pathname === "/chat" || url.pathname === "/api/financial-data") {
      const id = env.FinancialAgent.idFromName("financial-agent");
      const obj = env.FinancialAgent.get(id);
      return obj.fetch(request);
    }
    
    return new Response("Financial Agent Worker - Step 4 Complete", { status: 200 });
  }
};