# AI Features Implementation Guide

This guide provides practical implementation steps for developers working on the AI-powered features outlined in `AI_FEATURES_SPECIFICATION.md`.

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Firestore and Cloud Functions
- Google Cloud Platform account with AI/ML APIs enabled
- OpenAI API key (for NLP features)

### Initial Setup

1. **Enable Required APIs**
   ```bash
   # Google Cloud APIs
   gcloud services enable vision.googleapis.com
   gcloud services enable language.googleapis.com
   gcloud services enable automl.googleapis.com
   
   # Update Firebase configuration
   firebase functions:config:set \
     ai.google_cloud_project="your-project-id" \
     ai.openai_key="your-openai-key" \
     ai.weather_api_key="your-weather-key"
   ```

2. **Install Dependencies**
   ```bash
   cd server/functions
   npm install @google-cloud/vision @google-cloud/language openai axios
   ```

3. **Set up Database Collections**
   ```bash
   # Deploy Firestore rules and indexes
   firebase deploy --only firestore:rules,firestore:indexes
   ```

## Feature Implementation Order

### Phase 1: Smart Job Routing (Start Here)

**1. Create the routing service:**

```typescript
// src/services/aiRouting.ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

interface RoutingScore {
  workerId: string;
  score: number;
  factors: {
    skill: number;
    proximity: number;
    availability: number;
    performance: number;
  };
}

export class SmartJobRouter {
  async findBestWorker(jobId: string): Promise<string> {
    // Implementation starts with rule-based system
    const scores = await this.calculateWorkerScores(jobId);
    return scores[0]?.workerId || null;
  }

  private async calculateWorkerScores(jobId: string): Promise<RoutingScore[]> {
    // Initial implementation: weighted scoring
    // TODO: Replace with ML model in Phase 2
  }
}
```

**2. Add routing Cloud Function:**

```typescript
// server/functions/src/aiRouting.ts
export const routeJob = functions.https.onCall(async (data, context) => {
  const { jobId } = data;
  
  // Validate authentication and permissions
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const router = new SmartJobRouter();
    const recommendedWorkerId = await router.findBestWorker(jobId);
    
    // Log the decision for training data
    await db.collection('ai_routing_decisions').add({
      jobId,
      recommendedWorkerId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      // ... other fields
    });

    return { recommendedWorkerId };
  } catch (error) {
    console.error('Routing error:', error);
    throw new functions.https.HttpsError('internal', 'Routing failed');
  }
});
```

**3. Update the Jobs admin screen:**

```tsx
// src/screens/admin/Jobs.tsx
import { routeJob } from '../services/aiRouting';

const handleAutoAssign = async (jobId: string) => {
  try {
    setLoading(true);
    const result = await routeJob({ jobId });
    
    if (result.recommendedWorkerId) {
      // Update job with recommended worker
      await updateJob(jobId, { 
        workerId: result.recommendedWorkerId,
        status: 'active'
      });
      showSuccess('Job automatically assigned!');
    }
  } catch (error) {
    showError('Auto-assignment failed');
  } finally {
    setLoading(false);
  }
};

// Add "Auto Assign" button to job cards
```

### Phase 2: Automated Quoting

**1. Set up image processing service:**

```typescript
// src/services/aiQuoting.ts
import vision from '@google-cloud/vision';

export class AutomatedQuoting {
  private visionClient = new vision.ImageAnnotatorClient();

  async generateQuote(description: string, images: string[]): Promise<GeneratedQuote> {
    const analysis = await this.analyzeImages(images);
    const workItems = await this.parseDescription(description);
    const pricing = await this.calculatePricing(workItems, analysis);
    
    return {
      lineItems: pricing.lineItems,
      totalCost: pricing.total,
      estimatedHours: pricing.hours,
      confidence: pricing.confidence
    };
  }

  private async analyzeImages(imageUrls: string[]) {
    // Use Google Vision API to detect objects, text, and damage
    const analyses = await Promise.all(
      imageUrls.map(url => this.visionClient.objectLocalization(url))
    );
    
    return this.interpretImageAnalysis(analyses);
  }
}
```

**2. Add quote generation endpoint:**

```typescript
// server/functions/src/aiQuoting.ts
export const generateQuote = functions.https.onCall(async (data, context) => {
  const { description, images, clientId } = data;
  
  try {
    const quotingService = new AutomatedQuoting();
    const quote = await quotingService.generateQuote(description, images);
    
    // Save to database
    const quoteDoc = await db.collection('automated_quotes').add({
      clientId,
      inputDescription: description,
      inputImages: images,
      generatedQuote: quote,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { quoteId: quoteDoc.id, quote };
  } catch (error) {
    console.error('Quote generation error:', error);
    throw new functions.https.HttpsError('internal', 'Quote generation failed');
  }
});
```

### Phase 3: Predictive Scheduling

**1. Create scheduling predictor:**

```typescript
// src/services/aiScheduling.ts
export class PredictiveScheduler {
  async suggestOptimalTime(jobId: string): Promise<SchedulePrediction> {
    const job = await this.getJob(jobId);
    const worker = await this.getWorker(job.workerId);
    
    const factors = await this.analyzeFactors(job, worker);
    const timeSlots = await this.generateTimeSlots(factors);
    
    return {
      recommendedStartTime: timeSlots[0].startTime,
      estimatedDuration: timeSlots[0].duration,
      confidenceLevel: timeSlots[0].confidence,
      factors: factors,
      alternatives: timeSlots.slice(1, 4)
    };
  }

  private async analyzeFactors(job: any, worker: any) {
    // Consider weather, traffic, worker efficiency patterns
    const weather = await this.getWeatherForecast(job.location);
    const traffic = await this.getTrafficPatterns(job.location);
    const efficiency = this.getWorkerEfficiencyPattern(worker.id);
    
    return { weather, traffic, efficiency };
  }
}
```

### Phase 4: Chatbot Support

**1. Set up basic chatbot:**

```typescript
// src/services/aiChatbot.ts
import OpenAI from 'openai';

export class ChatbotService {
  private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async processMessage(message: string, context: ChatContext): Promise<ChatbotResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const response = completion.choices[0].message.content;
    const needsEscalation = this.detectEscalationNeeds(message, response);
    
    return {
      message: response,
      needsHumanEscalation: needsEscalation,
      confidence: this.calculateConfidence(response),
      actions: this.extractActions(response)
    };
  }

  private buildSystemPrompt(context: ChatContext): string {
    return `You are a helpful assistant for a handyman service app. 
    Current user: ${context.userRole}
    Recent jobs: ${context.recentJobs.join(', ')}
    
    Help with scheduling, pricing questions, job status, and general support.
    If you can't help, suggest contacting human support.`;
  }
}
```

**2. Add chatbot screen:**

```tsx
// src/screens/common/ChatbotScreen.tsx
export default function ChatbotScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    setLoading(true);
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call chatbot service
      const response = await processChatbotMessage({
        message: text,
        context: await buildChatContext()
      });

      // Add bot response
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isBot: true,
        timestamp: new Date(),
        actions: response.actions
      };
      setMessages(prev => [...prev, botMessage]);

      // Handle escalation if needed
      if (response.needsHumanEscalation) {
        await escalateToHuman();
      }
    } catch (error) {
      console.error('Chatbot error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <ChatMessage message={item} />}
        keyExtractor={item => item.id}
      />
      <ChatInput onSend={sendMessage} loading={loading} />
    </View>
  );
}
```

## Testing Strategy

### Unit Tests

```typescript
// __tests__/aiRouting.test.ts
describe('SmartJobRouter', () => {
  test('should recommend closest available worker', async () => {
    const router = new SmartJobRouter();
    const result = await router.findBestWorker('test-job-id');
    expect(result).toBeTruthy();
  });

  test('should handle no available workers', async () => {
    // Test edge cases
  });
});

// __tests__/aiQuoting.test.ts
describe('AutomatedQuoting', () => {
  test('should generate quote from description', async () => {
    const quoting = new AutomatedQuoting();
    const quote = await quoting.generateQuote(
      'Fix leaky faucet in kitchen',
      []
    );
    expect(quote.totalCost).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/aiFeatures.test.ts
describe('AI Features Integration', () => {
  test('complete job routing flow', async () => {
    // Create test job
    const job = await createTestJob();
    
    // Test routing
    const routing = await routeJob({ jobId: job.id });
    expect(routing.recommendedWorkerId).toBeTruthy();
    
    // Test scheduling
    const schedule = await predictSchedule({ jobId: job.id });
    expect(schedule.recommendedStartTime).toBeTruthy();
  });
});
```

## Monitoring and Analytics

### Performance Monitoring

```typescript
// src/utils/aiMetrics.ts
export class AIMetrics {
  static async recordRoutingDecision(
    jobId: string, 
    recommendedWorker: string, 
    actualWorker: string,
    outcome: 'success' | 'rejected' | 'changed'
  ) {
    await db.collection('ai_metrics').add({
      type: 'routing',
      jobId,
      recommendedWorker,
      actualWorker,
      outcome,
      timestamp: new Date()
    });
  }

  static async recordQuoteAccuracy(
    quoteId: string,
    predictedCost: number,
    actualCost: number
  ) {
    const accuracy = 1 - Math.abs(predictedCost - actualCost) / actualCost;
    
    await db.collection('ai_metrics').add({
      type: 'quoting',
      quoteId,
      predictedCost,
      actualCost,
      accuracy,
      timestamp: new Date()
    });
  }
}
```

### Admin Dashboard Widgets

```tsx
// src/components/admin/AIMetricsWidget.tsx
export function AIMetricsWidget() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadAIMetrics();
  }, []);

  const loadAIMetrics = async () => {
    // Load AI performance metrics
    const routingAccuracy = await getRoutingAccuracy();
    const quotingAccuracy = await getQuotingAccuracy();
    const chatbotResolution = await getChatbotResolutionRate();
    
    setMetrics({
      routing: routingAccuracy,
      quoting: quotingAccuracy,
      chatbot: chatbotResolution
    });
  };

  return (
    <Card style={styles.metricsCard}>
      <Card.Title title="AI Performance" />
      <Card.Content>
        <Text>Routing Accuracy: {metrics?.routing}%</Text>
        <Text>Quote Accuracy: {metrics?.quoting}%</Text>
        <Text>Chatbot Resolution: {metrics?.chatbot}%</Text>
      </Card.Content>
    </Card>
  );
}
```

## Deployment Checklist

### Development Environment
- [ ] Enable required Google Cloud APIs
- [ ] Set up OpenAI API key
- [ ] Configure Weather API access
- [ ] Deploy Cloud Functions
- [ ] Test basic routing functionality
- [ ] Verify image upload and processing
- [ ] Test chatbot responses

### Staging Environment
- [ ] Deploy with feature flags disabled by default
- [ ] Load test with realistic data volumes
- [ ] Verify fallback to manual processes
- [ ] Test error handling and recovery
- [ ] Validate privacy and security measures

### Production Deployment
- [ ] Gradual rollout using feature flags
- [ ] Monitor performance metrics
- [ ] Set up alerts for failures
- [ ] Implement A/B testing
- [ ] Collect user feedback
- [ ] Monitor costs and API usage

## Troubleshooting

### Common Issues

**1. Routing not finding workers:**
- Check worker availability data
- Verify skill matching logic
- Ensure location data is accurate

**2. Quote generation failing:**
- Verify image upload permissions
- Check API rate limits
- Validate pricing data completeness

**3. Chatbot not responding:**
- Check OpenAI API key and limits
- Verify context building logic
- Ensure proper error handling

**4. Performance issues:**
- Monitor Cloud Function execution times
- Check database query efficiency
- Implement caching where appropriate

### Debug Tools

```typescript
// src/utils/aiDebug.ts
export class AIDebugger {
  static async logRoutingDecision(jobId: string, factors: any) {
    if (__DEV__) {
      console.log('Routing Decision:', {
        jobId,
        factors,
        timestamp: new Date()
      });
    }
  }

  static async validateQuoteData(quote: GeneratedQuote) {
    const issues = [];
    
    if (quote.totalCost <= 0) {
      issues.push('Invalid total cost');
    }
    
    if (quote.lineItems.length === 0) {
      issues.push('No line items generated');
    }
    
    if (issues.length > 0) {
      console.warn('Quote validation issues:', issues);
    }
    
    return issues.length === 0;
  }
}
```

## Next Steps

1. **Start with Phase 1** (Smart Job Routing) as it provides immediate value
2. **Collect training data** from manual processes to improve AI models
3. **Implement gradual rollout** using feature flags
4. **Monitor performance** and user satisfaction metrics
5. **Iterate based on feedback** and real-world usage patterns

Remember to:
- Keep manual fallbacks for all AI features
- Implement comprehensive error handling
- Monitor costs and API usage limits
- Collect user feedback for continuous improvement
- Maintain data privacy and security standards