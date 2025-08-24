// Analytics service types and interfaces for Data Insights module
// This file serves as a placeholder for the analytics implementation

export interface ChurnRiskFactors {
  bookingFrequencyScore: number;
  paymentBehaviorScore: number;
  satisfactionTrendScore: number;
  engagementLevelScore: number;
}

export interface ChurnPrediction {
  id: string;
  clientId: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  factors: ChurnRiskFactors;
  predictions: {
    next30Days: number;
    next60Days: number;
    next90Days: number;
  };
  recommendations: string[];
  interventionsSuggested: string[];
}

export interface SentimentResult {
  id: string;
  sourceType: 'review' | 'chat' | 'support' | 'survey' | 'social';
  sourceId: string;
  clientId?: string;
  workerId?: string;
  jobId?: string;
  content: string;
  sentiment: {
    score: number; // -1 to 1
    magnitude: number; // 0 to 1
    confidence: number; // 0 to 1
    classification: 'positive' | 'neutral' | 'negative';
  };
  topics: string[];
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
  actionRequired: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  processedAt: Date;
}

export interface AnalyticsAlert {
  id: string;
  type: 'churn_risk' | 'negative_sentiment' | 'performance_drop' | 'revenue_decline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  targetId?: string;
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  recommendations: string[];
  createdAt: Date;
}

export interface AnalyticsTrend {
  id: string;
  metricType: 'revenue' | 'satisfaction' | 'churn' | 'sentiment' | 'performance';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  date: Date;
  value: number;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Placeholder service classes - to be implemented in Phase 1
export class ChurnPredictor {
  // TODO: Implement churn prediction algorithms
  async predictChurnRisk(clientId: string): Promise<ChurnPrediction> {
    throw new Error('ChurnPredictor.predictChurnRisk not implemented yet');
  }

  async calculateRiskFactors(clientId: string): Promise<ChurnRiskFactors> {
    throw new Error('ChurnPredictor.calculateRiskFactors not implemented yet');
  }

  async generateRecommendations(prediction: ChurnPrediction): Promise<string[]> {
    throw new Error('ChurnPredictor.generateRecommendations not implemented yet');
  }
}

export class SentimentAnalyzer {
  // TODO: Implement sentiment analysis
  async analyzeText(text: string): Promise<SentimentResult> {
    throw new Error('SentimentAnalyzer.analyzeText not implemented yet');
  }

  async analyzeBatch(texts: Array<{id: string, content: string}>): Promise<SentimentResult[]> {
    throw new Error('SentimentAnalyzer.analyzeBatch not implemented yet');
  }

  async detectTopics(text: string): Promise<string[]> {
    throw new Error('SentimentAnalyzer.detectTopics not implemented yet');
  }
}

export class AnalyticsService {
  // TODO: Implement analytics aggregation and dashboard data
  async getChurnDashboardData(): Promise<any> {
    throw new Error('AnalyticsService.getChurnDashboardData not implemented yet');
  }

  async getSentimentDashboardData(): Promise<any> {
    throw new Error('AnalyticsService.getSentimentDashboardData not implemented yet');
  }

  async getAnalyticsTrends(metricType: string, period: string): Promise<AnalyticsTrend[]> {
    throw new Error('AnalyticsService.getAnalyticsTrends not implemented yet');
  }

  async getActiveAlerts(): Promise<AnalyticsAlert[]> {
    throw new Error('AnalyticsService.getActiveAlerts not implemented yet');
  }
}

// Export instances for use throughout the app
export const churnPredictor = new ChurnPredictor();
export const sentimentAnalyzer = new SentimentAnalyzer();
export const analyticsService = new AnalyticsService();