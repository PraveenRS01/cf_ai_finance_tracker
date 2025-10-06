// Utility functions for the Financial Agent

export function generateId() {
  return crypto.randomUUID();
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function calculateDaysUntilDue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function validateAmount(amount) {
  return typeof amount === 'number' && amount > 0;
}

export function validateDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}
