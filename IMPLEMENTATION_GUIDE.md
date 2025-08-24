# Monetization Implementation Guide

This document provides specific technical implementation details for integrating monetization features into the existing Handyman Pro codebase.

## Quick Start Implementation

### 1. Subscription System Integration

#### Step 1: Add Stripe Dependencies
```bash
# In App V2/
npm install @stripe/stripe-js @stripe/react-stripe-js
npm install stripe  # For server functions
```

#### Step 2: Update Firestore Schema
Add these collections to your Firestore database:

```javascript
// In server/functions/src/index.ts - Add new collection schemas
const subscriptionSchema = {
  userId: 'string',
  plan: 'free|professional|business|enterprise',
  status: 'active|canceled|past_due|trialing',
  stripeSubscriptionId: 'string',
  currentPeriodStart: 'timestamp',
  currentPeriodEnd: 'timestamp',
  features: {
    maxJobsPerMonth: 'number',
    maxWorkers: 'number',
    advancedAnalytics: 'boolean',
    customBranding: 'boolean',
    apiAccess: 'boolean'
  }
};
```

#### Step 3: Create Subscription Service
```typescript
// App V2/src/services/subscription.ts
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface SubscriptionFeatures {
  maxJobsPerMonth: number;
  maxWorkers: number;
  advancedAnalytics: boolean;
  customBranding: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      maxJobsPerMonth: 5,
      maxWorkers: 1,
      advancedAnalytics: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false
    }
  },
  professional: {
    name: 'Professional',
    price: 19.99,
    features: {
      maxJobsPerMonth: -1, // unlimited
      maxWorkers: 1,
      advancedAnalytics: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true
    }
  },
  business: {
    name: 'Business',
    price: 49.99,
    features: {
      maxJobsPerMonth: -1,
      maxWorkers: 10,
      advancedAnalytics: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true
    }
  }
};

export async function getUserSubscription(userId: string) {
  const subDoc = await getDoc(doc(db, 'subscriptions', userId));
  if (subDoc.exists()) {
    return subDoc.data();
  }
  return SUBSCRIPTION_PLANS.free; // Default to free plan
}

export async function checkFeatureAccess(userId: string, feature: keyof SubscriptionFeatures): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  return subscription.features[feature] || false;
}

export async function checkJobLimit(userId: string): Promise<{ canCreate: boolean; currentCount: number; limit: number }> {
  const subscription = await getUserSubscription(userId);
  const limit = subscription.features.maxJobsPerMonth;
  
  if (limit === -1) return { canCreate: true, currentCount: 0, limit: -1 }; // unlimited
  
  // Count current month's jobs
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);
  
  // You'll need to implement this query based on your jobs collection structure
  // const jobCount = await countUserJobsThisMonth(userId, currentMonth);
  const jobCount = 0; // Placeholder
  
  return {
    canCreate: jobCount < limit,
    currentCount: jobCount,
    limit
  };
}
```

#### Step 4: Create Feature Gate Component
```typescript
// App V2/src/components/FeatureGate.tsx
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { checkFeatureAccess, SubscriptionFeatures } from '../services/subscription';
import { useAuth } from '../hooks/useAuth';

interface FeatureGateProps {
  feature: keyof SubscriptionFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkFeatureAccess(user.uid, feature).then(access => {
        setHasAccess(access);
        setLoading(false);
      });
    }
  }, [user, feature]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    fallback || (
      <Card style={{ margin: 16, padding: 16 }}>
        <Text>This feature requires a premium subscription</Text>
        <Button mode="contained" onPress={() => {/* Navigate to subscription */}}>
          Upgrade Now
        </Button>
      </Card>
    )
  );
}
```

#### Step 5: Add Subscription Screen
```typescript
// App V2/src/screens/admin/SubscriptionScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { SUBSCRIPTION_PLANS, getUserSubscription } from '../../services/subscription';
import { useAuth } from '../../hooks/useAuth';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      getUserSubscription(user.uid).then(setCurrentSubscription);
    }
  }, [user]);

  const handleUpgrade = (planKey: string) => {
    // Implement Stripe checkout flow
    console.log('Upgrading to:', planKey);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Subscription Plans
      </Text>
      
      {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
        <Card key={key} style={{ marginBottom: 16, padding: 16 }}>
          <Text variant="headlineSmall">{plan.name}</Text>
          <Text variant="bodyLarge">${plan.price}/month</Text>
          
          <View style={{ marginTop: 8 }}>
            <Text>Features:</Text>
            <Text>• Jobs: {plan.features.maxJobsPerMonth === -1 ? 'Unlimited' : plan.features.maxJobsPerMonth}</Text>
            <Text>• Workers: {plan.features.maxWorkers === -1 ? 'Unlimited' : plan.features.maxWorkers}</Text>
            <Text>• Analytics: {plan.features.advancedAnalytics ? 'Yes' : 'No'}</Text>
            <Text>• Custom Branding: {plan.features.customBranding ? 'Yes' : 'No'}</Text>
            <Text>• API Access: {plan.features.apiAccess ? 'Yes' : 'No'}</Text>
          </View>
          
          <Button
            mode="contained"
            style={{ marginTop: 16 }}
            onPress={() => handleUpgrade(key)}
            disabled={currentSubscription?.plan === key}
          >
            {currentSubscription?.plan === key ? 'Current Plan' : 'Select Plan'}
          </Button>
        </Card>
      ))}
    </ScrollView>
  );
}
```

### 2. Ad Network Integration

#### Step 1: Create Ad Components
```typescript
// App V2/src/components/AdBanner.tsx
import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { Text, Card } from 'react-native-paper';

interface AdCampaign {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  destinationUrl: string;
  callToAction: string;
}

interface AdBannerProps {
  placement: string;
  serviceType?: string;
  zipCode?: string;
}

export default function AdBanner({ placement, serviceType, zipCode }: AdBannerProps) {
  const [ad, setAd] = useState<AdCampaign | null>(null);

  useEffect(() => {
    fetchTargetedAd(placement, serviceType, zipCode).then(setAd);
  }, [placement, serviceType, zipCode]);

  const handleAdClick = () => {
    if (ad) {
      // Track click
      trackAdInteraction(ad.id, 'click', placement);
      Linking.openURL(ad.destinationUrl);
    }
  };

  const trackAdImpression = () => {
    if (ad) {
      trackAdInteraction(ad.id, 'impression', placement);
    }
  };

  useEffect(() => {
    if (ad) {
      trackAdImpression();
    }
  }, [ad]);

  if (!ad) return null;

  return (
    <Card style={{ margin: 8 }}>
      <TouchableOpacity onPress={handleAdClick}>
        <View style={{ padding: 16 }}>
          <Text variant="labelSmall" style={{ opacity: 0.6 }}>Sponsored</Text>
          <Text variant="titleMedium">{ad.title}</Text>
          <Text variant="bodyMedium">{ad.description}</Text>
          <Text variant="labelLarge" style={{ color: '#1976d2', marginTop: 8 }}>
            {ad.callToAction}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

async function fetchTargetedAd(placement: string, serviceType?: string, zipCode?: string): Promise<AdCampaign | null> {
  try {
    // This would call your backend to get targeted ads
    const response = await fetch('/api/ads/targeted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placement, serviceType, zipCode })
    });
    return response.json();
  } catch {
    return null;
  }
}

async function trackAdInteraction(adId: string, type: 'impression' | 'click', placement: string) {
  try {
    await fetch('/api/ads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adId, type, placement, timestamp: Date.now() })
    });
  } catch (error) {
    console.error('Failed to track ad interaction:', error);
  }
}
```

#### Step 2: Integrate Ads into Existing Screens
```typescript
// Example: Add to job creation screen
// App V2/src/screens/admin/JobCreate.tsx (modify existing)

// Add import at top
import AdBanner from '../../components/AdBanner';

// Add this component within your form, perhaps after service type selection
<AdBanner 
  placement="job-creation" 
  serviceType={selectedServiceType}
  zipCode={jobData.zipCode}
/>
```

### 3. Plugin API Foundation

#### Step 1: Create Plugin Manager Service
```typescript
// App V2/src/services/pluginManager.ts
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  permissions: string[];
  webhookUrl?: string;
  isActive: boolean;
}

export class PluginManager {
  static async getInstalledPlugins(userId: string): Promise<Plugin[]> {
    const q = query(
      collection(db, 'plugin_installations'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    
    const installations = await getDocs(q);
    const plugins: Plugin[] = [];
    
    for (const installation of installations.docs) {
      const pluginDoc = await getDocs(
        query(collection(db, 'plugins'), where('id', '==', installation.data().pluginId))
      );
      
      if (!pluginDoc.empty) {
        plugins.push(pluginDoc.docs[0].data() as Plugin);
      }
    }
    
    return plugins;
  }

  static async installPlugin(userId: string, pluginId: string): Promise<boolean> {
    try {
      await setDoc(doc(db, 'plugin_installations', `${userId}_${pluginId}`), {
        userId,
        pluginId,
        isActive: true,
        installedAt: new Date(),
        configuration: {}
      });
      return true;
    } catch (error) {
      console.error('Failed to install plugin:', error);
      return false;
    }
  }

  static async uninstallPlugin(userId: string, pluginId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'plugin_installations', `${userId}_${pluginId}`));
      return true;
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      return false;
    }
  }

  static async executePluginHooks(event: string, data: any, userId: string): Promise<void> {
    const plugins = await this.getInstalledPlugins(userId);
    
    for (const plugin of plugins) {
      if (plugin.webhookUrl) {
        try {
          await fetch(plugin.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, data, timestamp: Date.now() })
          });
        } catch (error) {
          console.error(`Failed to execute plugin hook for ${plugin.name}:`, error);
        }
      }
    }
  }
}
```

#### Step 2: Create Plugin Store Screen
```typescript
// App V2/src/screens/admin/PluginStore.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { PluginManager } from '../../services/pluginManager';

interface PluginListing {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  downloads: number;
  isInstalled: boolean;
}

export default function PluginStore() {
  const [plugins, setPlugins] = useState<PluginListing[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    // Fetch from your backend
    // This is a placeholder implementation
    const mockPlugins: PluginListing[] = [
      {
        id: '1',
        name: 'QuickBooks Integration',
        description: 'Sync jobs and invoices with QuickBooks',
        category: 'accounting',
        price: 9.99,
        rating: 4.5,
        downloads: 1250,
        isInstalled: false
      },
      {
        id: '2',
        name: 'Advanced Analytics',
        description: 'Detailed business insights and reports',
        category: 'analytics',
        price: 14.99,
        rating: 4.8,
        downloads: 890,
        isInstalled: false
      }
    ];
    setPlugins(mockPlugins);
  };

  const handleInstall = async (pluginId: string) => {
    // Implement installation logic
    console.log('Installing plugin:', pluginId);
  };

  const categories = ['all', 'accounting', 'analytics', 'communication', 'integration'];

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
        Plugin Store
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {categories.map(category => (
          <Chip
            key={category}
            selected={filter === category}
            onPress={() => setFilter(category)}
            style={{ marginRight: 8 }}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Chip>
        ))}
      </ScrollView>

      {plugins
        .filter(plugin => filter === 'all' || plugin.category === filter)
        .map(plugin => (
          <Card key={plugin.id} style={{ marginBottom: 16, padding: 16 }}>
            <Text variant="titleLarge">{plugin.name}</Text>
            <Text variant="bodyMedium">{plugin.description}</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text variant="bodySmall">
                ★ {plugin.rating} • {plugin.downloads} downloads
              </Text>
              <Text variant="labelLarge">
                {plugin.price === 0 ? 'Free' : `$${plugin.price}/month`}
              </Text>
            </View>
            
            <Button
              mode="contained"
              style={{ marginTop: 16 }}
              onPress={() => handleInstall(plugin.id)}
              disabled={plugin.isInstalled}
            >
              {plugin.isInstalled ? 'Installed' : 'Install'}
            </Button>
          </Card>
        ))}
    </ScrollView>
  );
}
```

## Integration with Existing Code

### 1. Add Feature Gates to Existing Components

```typescript
// Example: Modify existing job creation
// App V2/src/screens/admin/JobCreate.tsx

import FeatureGate from '../../components/FeatureGate';
import { checkJobLimit } from '../../services/subscription';

// Add job limit check before allowing creation
const handleCreateJob = async () => {
  const { canCreate, currentCount, limit } = await checkJobLimit(user.uid);
  
  if (!canCreate) {
    alert(`Job limit reached (${currentCount}/${limit}). Please upgrade your plan.`);
    return;
  }
  
  // Proceed with existing job creation logic
};

// Wrap advanced features with FeatureGate
<FeatureGate feature="advancedAnalytics">
  <AdvancedJobMetrics />
</FeatureGate>
```

### 2. Add Navigation Items

```typescript
// App V2/src/navigation/AdminNavigator.tsx (modify existing)

// Add these screens to your admin navigation
<Stack.Screen name="Subscription" component={SubscriptionScreen} />
<Stack.Screen name="PluginStore" component={PluginStore} />

// Add menu items in your admin dashboard
const adminMenuItems = [
  // ... existing items
  { title: 'Subscription', screen: 'Subscription', icon: 'crown' },
  { title: 'Plugin Store', screen: 'PluginStore', icon: 'puzzle' },
];
```

### 3. Add Plugin Hooks to Existing Events

```typescript
// Example: Add to job completion
// App V2/src/screens/worker/JobDetails.tsx

import { PluginManager } from '../../services/pluginManager';

const handleJobComplete = async () => {
  // Existing job completion logic
  await updateJob(jobId, { status: 'completed' });
  
  // Execute plugin hooks
  await PluginManager.executePluginHooks('job.completed', {
    jobId,
    workerId: user.uid,
    completedAt: new Date()
  }, user.uid);
};
```

## Cloud Functions Updates

Add these to your `server/functions/src/index.ts`:

```typescript
// Subscription webhook handler
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Handle Stripe subscription events
  const event = req.body;
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update user subscription in Firestore
      break;
    case 'customer.subscription.deleted':
      // Downgrade to free plan
      break;
  }
  
  res.json({ received: true });
});

// Ad targeting function
export const getTargetedAds = functions.https.onRequest(async (req, res) => {
  const { placement, serviceType, zipCode } = req.body;
  
  // Query ad campaigns based on targeting criteria
  const ads = await db.collection('ad_campaigns')
    .where('isActive', '==', true)
    .where('targetingCriteria.serviceTypes', 'array-contains', serviceType)
    .limit(1)
    .get();
    
  if (!ads.empty) {
    res.json(ads.docs[0].data());
  } else {
    res.json(null);
  }
});

// Plugin validation function
export const validatePlugin = functions.https.onRequest(async (req, res) => {
  const { pluginCode, permissions } = req.body;
  
  // Perform security validation
  const isValid = await performSecurityScan(pluginCode);
  
  res.json({ isValid, permissions });
});
```

## Testing the Implementation

### 1. Test Subscription Features
```bash
# Test subscription creation
curl -X POST http://localhost:5001/your-project/us-central1/createSubscription \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","plan":"professional"}'

# Test feature access
# Use the FeatureGate component in your app to verify gating works
```

### 2. Test Ad Network
```bash
# Test ad serving
curl -X POST http://localhost:5001/your-project/us-central1/getTargetedAds \
  -H "Content-Type: application/json" \
  -d '{"placement":"job-creation","serviceType":"plumbing","zipCode":"12345"}'
```

### 3. Test Plugin System
```bash
# Test plugin installation
# Use the PluginStore component to install and uninstall plugins
```

## Security Considerations

1. **Payment Security**: All payment processing goes through Stripe
2. **Plugin Security**: Validate all plugin code before approval
3. **Data Privacy**: Ensure GDPR/CCPA compliance for user data
4. **API Rate Limiting**: Implement rate limiting for all API endpoints
5. **Access Control**: Use Firebase Security Rules to control data access

## Performance Optimization

1. **Caching**: Cache subscription status and plugin data
2. **Lazy Loading**: Load plugin code only when needed
3. **CDN**: Use CDN for static assets and ad images
4. **Database Indexing**: Add proper indexes for subscription and ad queries

This implementation guide provides the foundation for building all three monetization features while integrating seamlessly with your existing Handyman Pro application.