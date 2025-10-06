// AI Financial Tracker Frontend
class FinancialTrackerApp {
    constructor() {
        this.apiBase = 'http://127.0.0.1:8787';
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        this.initializeEventListeners();
        this.loadFinancialData();
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick action buttons
        document.querySelectorAll('.quick-action').forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                this.messageInput.value = message;
                this.sendMessage();
            });
        });

        // Auto-resize input
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        // Disable input and show loading
        this.setLoading(true);
        this.updateStatus('thinking', 'AI is thinking...');

        try {
            // Send to AI
            const response = await fetch(`${this.apiBase}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add AI response to chat
            this.addMessage(data.message, 'ai', data.data);
            
            // Update financial data
            await this.loadFinancialData();
            
            this.updateStatus('ready', 'Ready');
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'ai');
            this.updateStatus('error', 'Error occurred');
        } finally {
            this.setLoading(false);
        }
    }

    addMessage(content, sender, data = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Add main content
        const contentP = document.createElement('p');
        contentP.textContent = content;
        messageContent.appendChild(contentP);
        
        // Add data if available
        if (data && sender === 'ai') {
            this.addDataToMessage(messageContent, data);
        }
        
        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'message-timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        messageContent.appendChild(timestamp);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addDataToMessage(messageContent, data) {
        if (data.amount || data.target_amount) {
            const dataDiv = document.createElement('div');
            dataDiv.style.cssText = 'margin-top: 0.5rem; padding: 0.5rem; background: rgba(102, 126, 234, 0.1); border-radius: 8px; font-size: 0.9rem;';
            
            if (data.amount) {
                dataDiv.innerHTML = `
                    <strong>Amount:</strong> $${data.amount}<br>
                    <strong>Category:</strong> ${data.category}<br>
                    <strong>Description:</strong> ${data.description}
                `;
            } else if (data.target_amount) {
                dataDiv.innerHTML = `
                    <strong>Goal:</strong> ${data.name}<br>
                    <strong>Target:</strong> $${data.target_amount}<br>
                    <strong>Target Date:</strong> ${data.target_date}<br>
                    <strong>Monthly Contribution:</strong> $${data.monthly_contribution}
                `;
            }
            
            messageContent.appendChild(dataDiv);
        }
    }

    async loadFinancialData() {
        try {
            const response = await fetch(`${this.apiBase}/api/financial-data`);
            if (!response.ok) return;
            
            const data = await response.json();
            this.updateDashboard(data);
        } catch (error) {
            console.error('Error loading financial data:', error);
        }
    }

    updateDashboard(data) {
        // Update financial overview
        document.getElementById('monthly-expenses').textContent = `$${data.summary.monthlyExpenses.toFixed(2)}`;
        document.getElementById('upcoming-bills').textContent = `$${data.summary.upcomingBills.toFixed(2)}`;
        document.getElementById('total-saved').textContent = `$${data.summary.totalSaved.toFixed(2)}`;
        document.getElementById('net-worth').textContent = `$${data.summary.netWorth.toFixed(2)}`;
        
        // Update recent expenses
        this.updateExpenseList(data.expenses);
        
        // Update upcoming bills
        this.updateBillsList(data.bills);
    }

    updateExpenseList(expenses) {
        const container = document.getElementById('recent-expenses');
        container.innerHTML = '';
        
        if (expenses.length === 0) {
            container.innerHTML = '<p class="no-data">No expenses yet</p>';
            return;
        }
        
        expenses.slice(0, 5).forEach(expense => {
            const expenseDiv = document.createElement('div');
            expenseDiv.className = 'expense-item';
            expenseDiv.innerHTML = `
                <div>
                    <div class="expense-category">${expense.category}</div>
                    <div style="font-size: 0.8rem; color: #a0aec0;">${expense.description}</div>
                </div>
                <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
            `;
            container.appendChild(expenseDiv);
        });
    }

    updateBillsList(bills) {
        const container = document.getElementById('upcoming-bills-list');
        container.innerHTML = '';
        
        if (bills.length === 0) {
            container.innerHTML = '<p class="no-data">No bills scheduled</p>';
            return;
        }
        
        bills.slice(0, 5).forEach(bill => {
            const billDiv = document.createElement('div');
            billDiv.className = 'bill-item';
            billDiv.innerHTML = `
                <div>
                    <div class="bill-name">${bill.name}</div>
                    <div style="font-size: 0.8rem; color: #a0aec0;">Due: ${new Date(bill.due_date).toLocaleDateString()}</div>
                </div>
                <div class="bill-amount">$${bill.amount.toFixed(2)}</div>
            `;
            container.appendChild(billDiv);
        });
    }

    updateStatus(type, text) {
        this.statusIndicator.className = `status-indicator ${type}`;
        this.statusText.textContent = text;
    }

    setLoading(loading) {
        if (loading) {
            this.loadingOverlay.classList.add('show');
            this.sendButton.disabled = true;
            this.messageInput.disabled = true;
        } else {
            this.loadingOverlay.classList.remove('show');
            this.sendButton.disabled = false;
            this.messageInput.disabled = false;
            this.messageInput.focus();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FinancialTrackerApp();
});

// Add some helpful utility functions
window.FinancialTracker = {
    // Test function for development
    testAI: async function(message) {
        try {
            const response = await fetch('http://127.0.0.1:8787/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            return await response.json();
        } catch (error) {
            console.error('Test error:', error);
            return { error: error.message };
        }
    },
    
    // Get financial data
    getFinancialData: async function() {
        try {
            const response = await fetch('http://127.0.0.1:8787/api/financial-data');
            return await response.json();
        } catch (error) {
            console.error('Data error:', error);
            return { error: error.message };
        }
    }
};
