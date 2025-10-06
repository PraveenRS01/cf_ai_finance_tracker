// Main entry point for the Financial Agent
export { FinancialAgent } from "./server.js";

// Default export for the Worker
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Route requests to the FinancialAgent Durable Object
    if (url.pathname === "/chat" || url.pathname === "/api/financial-data") {
      const id = env.FinancialAgent.idFromName("financial-agent");
      const obj = env.FinancialAgent.get(id);
      const response = await obj.fetch(request);
      
      // Add CORS headers to the response
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers,
      });
    }
    
    return new Response("Financial Agent Worker - Step 6 Complete", { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/plain',
      }
    });
  }
};