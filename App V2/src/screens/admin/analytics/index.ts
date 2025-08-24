// Analytics module exports
// This file provides centralized access to all Data Insights components

export { default as AnalyticsDashboard } from './AnalyticsDashboard';
export { default as ChurnDashboard } from './ChurnDashboard';
export { default as SentimentDashboard } from './SentimentDashboard';

// Re-export analytics services for convenience
export * from '../../services/analytics';