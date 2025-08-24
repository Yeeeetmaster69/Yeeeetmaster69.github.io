# Data Insights: Churn Prediction, Sentiment Analysis, and Analytics Dashboard

This document outlines the implementation plan for advanced data analytics features to enhance business intelligence and customer retention for the Handyman Pro application.

## Overview

The Data Insights module will provide three core capabilities:
1. **Churn Prediction** - Identify at-risk clients before they leave
2. **Sentiment Analysis** - Analyze feedback and reviews to detect trends and issues
3. **Enhanced Analytics Dashboard** - Comprehensive business intelligence interface

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Insights Module                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Churn          │   Sentiment     │   Analytics             │
│  Prediction     │   Analysis      │   Dashboard             │
│                 │                 │                         │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────────────┐ │
│ │ ML Models   │ │ │ NLP Engine  │ │ │ Real-time Metrics   │ │
│ │ Risk Scores │ │ │ Sentiment   │ │ │ Trend Analysis      │ │
│ │ Alerts      │ │ │ Classifiers │ │ │ Performance KPIs    │ │
│ └─────────────┘ │ └─────────────┘ │ └─────────────────────┘ │
└─────────────────┴─────────────────┴─────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase/Firestore                       │
│  ┌───────────────┬───────────────┬───────────────────────┐  │
│  │ Analytics     │ Feedback      │ User Behavior         │  │
│  │ Collections   │ Collections   │ Collections           │  │
│  └───────────────┴───────────────┴───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 1. Churn Prediction

### Objective
Identify clients who are likely to stop using services within the next 30, 60, or 90 days.

### Data Requirements
- **Historical Job Data**: Frequency, value, completion rates
- **Client Interaction Patterns**: Last service date, booking intervals, communication frequency
- **Payment Behavior**: Payment delays, dispute history, payment methods
- **Satisfaction Metrics**: Ratings, reviews, complaint history
- **Demographic Data**: Location, service types preferred, seasonal patterns

### Risk Factors
1. **Behavioral Indicators**:
   - Decreased booking frequency (>50% reduction from baseline)
   - Longer gaps between services (>90 days for regular clients)
   - Reduced average job value
   - Cancelled or rescheduled appointments

2. **Satisfaction Indicators**:
   - Declining review scores (trend analysis)
   - Increase in complaints or support tickets
   - Negative sentiment in feedback
   - Delayed responses to communications

3. **Financial Indicators**:
   - Payment delays or disputes
   - Switching to lower-cost services
   - Requesting discounts frequently

### Churn Prediction Model

#### Data Model Extensions
```typescript
// New Firestore collection: analytics_churn
{
  id: string;
  clientId: string;
  riskScore: number; // 0-100, higher = more risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: timestamp;
  factors: {
    bookingFrequency: number;
    paymentBehavior: number;
    satisfactionTrend: number;
    engagementLevel: number;
  };
  predictions: {
    next30Days: number;
    next60Days: number;
    next90Days: number;
  };
  recommendations: string[];
  interventionsSuggested: string[];
}

// Enhanced users/clients collection
{
  // ... existing fields
  analytics: {
    bookingPattern: {
      averageInterval: number; // days between bookings
      lastBooking: timestamp;
      totalBookings: number;
      cancelledBookings: number;
    };
    satisfactionTrend: {
      currentScore: number;
      trend: 'increasing' | 'stable' | 'decreasing';
      reviewCount: number;
      lastReviewDate: timestamp;
    };
    engagementMetrics: {
      responseRate: number; // % of messages responded to
      averageResponseTime: number; // hours
      lastInteraction: timestamp;
    };
  };
}
```

#### Algorithm Approach
1. **Feature Engineering**: Calculate rolling averages, trends, and anomaly scores
2. **Scoring Algorithm**: Weighted combination of risk factors
3. **Machine Learning**: Train on historical churn data (future enhancement)
4. **Real-time Updates**: Recalculate scores after each interaction

#### Implementation Strategy
```typescript
// src/services/analytics/churnPrediction.ts
export interface ChurnRiskFactors {
  bookingFrequencyScore: number;
  paymentBehaviorScore: number;
  satisfactionTrendScore: number;
  engagementLevelScore: number;
}

export interface ChurnPrediction {
  clientId: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: ChurnRiskFactors;
  recommendations: string[];
  lastCalculated: Date;
}

export class ChurnPredictor {
  calculateBookingFrequencyScore(client: Client): number;
  calculatePaymentBehaviorScore(client: Client): number;
  calculateSatisfactionTrendScore(client: Client): number;
  calculateEngagementScore(client: Client): number;
  generateRecommendations(prediction: ChurnPrediction): string[];
  predictChurnRisk(clientId: string): Promise<ChurnPrediction>;
}
```

## 2. Sentiment Analysis

### Objective
Analyze customer feedback, reviews, and communications to detect sentiment trends and identify potential issues early.

### Data Sources
- **Reviews and Ratings**: Job completion reviews, worker ratings
- **Support Communications**: Chat messages, support tickets
- **Feedback Forms**: Post-service surveys, improvement suggestions
- **Social Media**: External reviews, social mentions (future)

### Sentiment Analysis Framework

#### Data Model Extensions
```typescript
// New Firestore collection: analytics_sentiment
{
  id: string;
  sourceType: 'review' | 'chat' | 'support' | 'survey' | 'social';
  sourceId: string; // Reference to original content
  clientId?: string;
  workerId?: string;
  jobId?: string;
  content: string;
  sentiment: {
    score: number; // -1 to 1 (negative to positive)
    magnitude: number; // 0 to 1 (intensity)
    confidence: number; // 0 to 1
    classification: 'positive' | 'neutral' | 'negative';
  };
  topics: string[]; // Extracted topics/keywords
  emotions: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
  };
  actionRequired: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: timestamp;
  processedAt: timestamp;
}

// Enhanced reviews collection
{
  // ... existing fields
  sentimentAnalysis: {
    processed: boolean;
    sentimentScore: number;
    topics: string[];
    emotionalTone: string;
    flaggedForReview: boolean;
  };
}
```

#### Sentiment Analysis Engine
```typescript
// src/services/analytics/sentimentAnalysis.ts
export interface SentimentResult {
  score: number;
  magnitude: number;
  confidence: number;
  classification: 'positive' | 'neutral' | 'negative';
  topics: string[];
  emotions: EmotionScores;
  actionRequired: boolean;
}

export interface EmotionScores {
  joy: number;
  anger: number;
  fear: number;
  sadness: number;
  surprise: number;
}

export class SentimentAnalyzer {
  // Basic rule-based analysis (Phase 1)
  analyzeText(text: string): SentimentResult;
  extractTopics(text: string): string[];
  detectEmotions(text: string): EmotionScores;
  
  // Advanced ML analysis (Phase 2 - future)
  analyzeWithML(text: string): Promise<SentimentResult>;
  
  // Trend analysis
  analyzeSentimentTrends(timeframe: string): SentimentTrend[];
  detectAnomalies(sentiments: SentimentResult[]): Anomaly[];
}

// Implementation phases
// Phase 1: Rule-based sentiment analysis using keyword dictionaries
// Phase 2: Integration with cloud AI services (Google Cloud Natural Language API)
// Phase 3: Custom trained models for handyman service specific sentiment
```

#### Sentiment Monitoring Dashboard
- **Real-time Sentiment Feed**: Latest feedback with sentiment scores
- **Trend Analysis**: Sentiment trends over time, by worker, by service type
- **Alert System**: Automatic flags for negative sentiment requiring attention
- **Topic Clustering**: Common themes in feedback (pricing, quality, communication)

## 3. Enhanced Analytics Dashboard

### Objective
Provide comprehensive business intelligence with actionable insights for decision-making.

### Key Performance Indicators (KPIs)

#### Business Metrics
- **Revenue Analytics**: Trend analysis, forecasting, seasonal patterns
- **Client Metrics**: Acquisition, retention, lifetime value, satisfaction scores
- **Worker Performance**: Productivity, quality ratings, earnings, efficiency
- **Operational Metrics**: Job completion rates, response times, utilization

#### Advanced Analytics
- **Predictive Analytics**: Revenue forecasting, demand prediction
- **Cohort Analysis**: Client behavior over time
- **Geographic Analysis**: Service density, expansion opportunities
- **Competitive Analysis**: Market positioning insights

### Dashboard Components

#### Main Analytics Dashboard
```typescript
// src/screens/admin/analytics/AnalyticsDashboard.tsx
export interface AnalyticsDashboardProps {
  timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year';
  filters: AnalyticsFilters;
}

export interface AnalyticsData {
  businessMetrics: BusinessMetrics;
  churnAnalysis: ChurnAnalysis;
  sentimentAnalysis: SentimentAnalysis;
  predictiveInsights: PredictiveInsights;
}

// Dashboard sections:
// 1. Executive Summary - High-level KPIs
// 2. Revenue Intelligence - Financial analytics
// 3. Client Intelligence - Churn prediction, segmentation
// 4. Sentiment Monitor - Feedback analysis
// 5. Operational Intelligence - Worker and job analytics
// 6. Predictive Insights - Forecasting and recommendations
```

#### Churn Prediction Dashboard
```typescript
// src/screens/admin/analytics/ChurnDashboard.tsx
export interface ChurnDashboardData {
  atRiskClients: ChurnPrediction[];
  riskDistribution: RiskDistribution;
  interventionResults: InterventionResult[];
  recommendations: ActionableRecommendation[];
}

// Components:
// - Risk Heat Map
// - At-Risk Client List with intervention suggestions
// - Success Rate of retention efforts
// - Automated intervention triggers
```

#### Sentiment Analysis Dashboard
```typescript
// src/screens/admin/analytics/SentimentDashboard.tsx
export interface SentimentDashboardData {
  overallSentiment: SentimentOverview;
  sentimentTrends: SentimentTrend[];
  topicAnalysis: TopicAnalysis[];
  alerts: SentimentAlert[];
}

// Components:
// - Sentiment Score Timeline
// - Topic Word Cloud
// - Alert Feed for negative sentiment
// - Worker-specific sentiment analysis
```

### Data Visualization Components

#### Custom Chart Components
```typescript
// src/components/analytics/
// - ChurnRiskChart.tsx - Visual risk indicators
// - SentimentTrendChart.tsx - Sentiment over time
// - PredictiveAnalyticsChart.tsx - Forecasting visualizations
// - KPICard.tsx - Enhanced stats cards with trends
// - AlertCard.tsx - Action-required notifications
```

## 4. Implementation Plan

### Phase 1: Foundation (Week 1-2)
- [x] Create documentation and architecture design
- [ ] Set up analytics data models in Firestore
- [ ] Implement basic churn prediction algorithm (rule-based)
- [ ] Create basic sentiment analysis (keyword-based)
- [ ] Build foundation dashboard components

### Phase 2: Core Features (Week 3-4)
- [ ] Implement churn prediction dashboard
- [ ] Build sentiment analysis dashboard
- [ ] Add real-time data processing
- [ ] Create alert system for high-risk situations
- [ ] Implement basic intervention recommendations

### Phase 3: Advanced Features (Week 5-6)
- [ ] Enhance ML capabilities for churn prediction
- [ ] Integrate cloud AI for advanced sentiment analysis
- [ ] Add predictive analytics and forecasting
- [ ] Implement automated intervention triggers
- [ ] Create comprehensive reporting system

### Phase 4: Optimization (Week 7-8)
- [ ] Performance optimization
- [ ] Advanced visualizations
- [ ] Mobile-responsive design
- [ ] User testing and feedback integration
- [ ] Documentation and training materials

## 5. Technical Integration

### Firestore Schema Extensions
```typescript
// New Collections:
// - analytics_churn: Client churn predictions
// - analytics_sentiment: Sentiment analysis results
// - analytics_trends: Historical trend data
// - analytics_alerts: System-generated alerts
// - analytics_interventions: Retention intervention tracking

// Enhanced Existing Collections:
// - users: Add analytics metadata
// - jobs: Add performance metrics
// - reviews: Add sentiment analysis results
```

### Cloud Functions
```typescript
// server/functions/src/analytics/
// - churnCalculation.ts: Scheduled churn score updates
// - sentimentProcessor.ts: Process new feedback for sentiment
// - alertTrigger.ts: Generate alerts based on thresholds
// - dataAggregation.ts: Aggregate analytics data for dashboards
```

### Navigation Integration
```typescript
// Add to admin navigation:
// Analytics → Data Insights
//   ├── Dashboard Overview
//   ├── Churn Prediction
//   ├── Sentiment Analysis
//   └── Reports & Alerts
```

## 6. Success Metrics

### Churn Prediction Success
- **Accuracy**: Correctly identify 80%+ of clients who churn
- **Early Warning**: Predict churn 30+ days in advance
- **Retention Impact**: Improve retention rate by 15%+

### Sentiment Analysis Success
- **Coverage**: Analyze 95%+ of feedback within 24 hours
- **Accuracy**: 85%+ accuracy in sentiment classification
- **Response Time**: Identify critical issues within 2 hours

### Business Impact
- **Revenue Protection**: Reduce churn-related revenue loss by 20%
- **Customer Satisfaction**: Improve average satisfaction scores by 10%
- **Operational Efficiency**: Reduce time to identify issues by 60%

## 7. Privacy and Compliance

### Data Privacy
- All analytics respect user privacy settings
- Anonymize personal data in aggregated analytics
- Provide opt-out mechanisms for analytics tracking
- Comply with GDPR, CCPA, and other privacy regulations

### Data Security
- Encrypt sensitive analytics data
- Implement role-based access for analytics dashboards
- Regular security audits of analytics components
- Secure API endpoints for analytics data

## 8. Future Enhancements

### Advanced Machine Learning
- Custom trained models for handyman industry
- Deep learning for complex pattern recognition
- Real-time recommendation engines
- Automated A/B testing for interventions

### External Integrations
- Social media sentiment monitoring
- Competitive intelligence integration
- Market trend analysis
- Economic indicator correlation

### Mobile Analytics App
- Native mobile analytics dashboard
- Push notifications for critical alerts
- Offline analytics viewing
- Mobile-optimized data visualizations

---

This comprehensive Data Insights module will transform the Handyman Pro application into a data-driven business intelligence platform, enabling proactive customer retention and continuous service improvement.