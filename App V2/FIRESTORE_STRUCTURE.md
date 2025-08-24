# Firestore Database Structure

This document outlines the Firestore database structure for the Handyman Pro application.

## Collections

### 1. users
Stores user authentication and profile information.

```typescript
{
  id: string; // User UID from Firebase Auth
  email: string;
  role: 'admin' | 'worker' | 'client';
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
  
  // Client-specific fields
  totalJobs?: number;
  totalSpent?: number;
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  
  // Worker-specific fields
  hourlyRate?: number;
  skills?: string[];
  totalEarnings?: number;
  totalMilesDriven?: number;
  averageRating?: number;
  hireDate?: timestamp;
  certifications?: string[];
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}
```

### 2. jobs
Stores job information and status.

```typescript
{
  id: string;
  title: string;
  description: string;
  address: string;
  lat?: number;
  lng?: number;
  clientId: string;
  workerId?: string;
  status: 'pending' | 'active' | 'upcoming' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  priceType: 'hourly' | 'fixed';
  hourlyRate?: number;
  fixedPrice?: number;
  estimatedHours?: number;
  actualHours?: number;
  totalCost?: number;
  scheduledAt?: timestamp;
  startedAt?: timestamp;
  completedAt?: timestamp;
  beforeImages?: string[];
  afterImages?: string[];
  notes?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 3. job_events
Stores timeline events for jobs.

```typescript
{
  id: string;
  jobId: string;
  type: 'created' | 'assigned' | 'started' | 'paused' | 'resumed' | 'completed' | 'cancelled' | 'rescheduled';
  timestamp: timestamp;
  userId?: string;
  notes?: string;
  reason?: string;
  images?: string[];
  location?: {
    lat: number;
    lng: number;
  };
}
```

### 4. clients
Stores client-specific information (extends users collection).

```typescript
{
  id: string; // Reference to users collection
  type: 'residential' | 'commercial';
  city: string;
  state: string;
  zipCode: string;
  averageRating?: number;
  notes?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 5. workers
Stores worker-specific information (extends users collection).

```typescript
{
  id: string; // Reference to users collection
  jobsCompleted: number;
  currentlyWorking: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 6. chats
Stores chat conversations.

```typescript
{
  id: string;
  participants: string[]; // User IDs
  participantRoles: ('admin' | 'worker' | 'client')[];
  type: 'support' | 'job' | 'general';
  title?: string;
  lastMessage?: {
    content: string;
    timestamp: timestamp;
    senderId: string;
  };
  isActive: boolean;
  jobId?: string; // If job-related chat
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 7. messages
Stores individual chat messages.

```typescript
{
  id: string;
  chatId: string;
  senderId: string;
  senderRole: 'admin' | 'worker' | 'client';
  content: string;
  timestamp: timestamp;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
}
```

### 8. references
Stores trusted business references.

```typescript
{
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
  description: string;
  category: string;
  isActive: boolean;
  rating?: number;
  notes?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 9. notifications
Stores push notifications.

```typescript
{
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'job' | 'payment' | 'message' | 'system';
  isRead: boolean;
  data?: {
    jobId?: string;
    chatId?: string;
    [key: string]: any;
  };
  createdAt: timestamp;
}
```

### 10. time_entries
Stores worker time tracking.

```typescript
{
  id: string;
  jobId: string;
  workerId: string;
  startTime: timestamp;
  endTime?: timestamp;
  duration?: number; // in minutes
  hourlyRate: number;
  earnings: number;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: timestamp;
}
```

### 11. expenses
Stores job-related expenses.

```typescript
{
  id: string;
  jobId?: string;
  workerId?: string;
  amount: number;
  category: string;
  description: string;
  receipt?: string; // URL to receipt image
  isReimbursed: boolean;
  createdAt: timestamp;
  approvedAt?: timestamp;
  approvedBy?: string;
}
```

### 12. income
Stores payment records.

```typescript
{
  id: string;
  jobId: string;
  clientId: string;
  amount: number;
  type: 'hourly' | 'fixed' | 'materials' | 'bonus';
  isPaid: boolean;
  paidAt?: timestamp;
  paymentMethod?: string;
  invoiceId?: string;
  createdAt: timestamp;
}
```

### 13. estimate_requests
Stores estimate requests from clients.

```typescript
{
  id: string;
  clientId: string;
  title: string;
  description: string;
  address: string;
  preferredDate?: timestamp;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  budget?: number;
  images?: string[];
  status: 'pending' | 'scheduled' | 'completed' | 'converted';
  estimatedAmount?: number;
  estimatedHours?: number;
  notes?: string;
  createdAt: timestamp;
  scheduledAt?: timestamp;
  completedAt?: timestamp;
}
```

### 14. push_tokens
Stores device tokens for push notifications.

```typescript
{
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 15. subscription_plans
Stores subscription plan templates for landscaping services.

```typescript
{
  id: string;
  name: string;
  description: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'one-time';
  basePrice: number;
  estimatedHours: number;
  services: string[];
  isActive: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 16. client_subscriptions
Stores active client subscriptions to landscaping plans.

```typescript
{
  id: string;
  clientId: string;
  planId: string;
  status: 'active' | 'paused' | 'cancelled' | 'pending';
  startDate: timestamp;
  endDate?: timestamp;
  lastServiceDate?: timestamp;
  nextServiceDate?: timestamp;
  customPrice?: number;
  notes?: string;
  autoRenew: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 17. incident_reports
Stores safety incident reports from workers and clients.

```typescript
{
  id: string;
  reporterId: string;
  reporterRole: 'admin' | 'worker' | 'client';
  jobId?: string;
  type: 'injury' | 'property_damage' | 'equipment_failure' | 'safety_violation' | 'emergency' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  injuredParties?: string[];
  witnessInfo?: string;
  propertyDamage?: string;
  equipmentInvolved?: string;
  photos?: string[];
  actionsTaken: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  reportedAt: timestamp;
  investigatedAt?: timestamp;
  investigatedBy?: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 18. emergency_contacts
Stores emergency contact information for users.

```typescript
{
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 19. background_checks
Stores background check records for workers.

```typescript
{
  id: string;
  workerId: string;
  provider: string;
  checkType: 'criminal' | 'driving' | 'reference' | 'identity' | 'credit';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  requestedAt: timestamp;
  completedAt?: timestamp;
  expiresAt?: timestamp;
  results?: {
    passed: boolean;
    details?: string;
    documentUrl?: string;
  };
  cost?: number;
  notes?: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### 20. emergency_sos
Stores emergency SOS alerts triggered by workers.

```typescript
{
  id: string;
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  notes?: string;
  triggeredAt: timestamp;
  status: 'active' | 'responded' | 'resolved';
  responseTime?: timestamp;
  respondedBy?: string;
  updatedAt?: timestamp;
}
```

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Jobs - clients can read their own, workers can read assigned jobs, admins can read all
    match /jobs/{jobId} {
      allow read: if request.auth != null && (
        resource.data.clientId == request.auth.uid ||
        resource.data.workerId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        (resource.data.clientId == request.auth.uid && resource.data.status == 'pending')
      );
    }
    
    // Messages - participants can read/write
    match /messages/{messageId} {
      allow read, write: if request.auth != null && (
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants
      );
    }
    
    // Admin-only collections
    match /{collection}/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Indexes

### Composite Indexes Required:

1. **jobs**: `clientId ASC, status ASC, createdAt DESC`
2. **jobs**: `workerId ASC, status ASC, scheduledAt ASC`
3. **messages**: `chatId ASC, timestamp ASC`
4. **job_events**: `jobId ASC, timestamp ASC`
5. **time_entries**: `workerId ASC, createdAt DESC`
6. **notifications**: `userId ASC, isRead ASC, createdAt DESC`
7. **income**: `clientId ASC, createdAt DESC`
8. **subscription_plans**: `isActive ASC, frequency ASC, basePrice ASC`
9. **client_subscriptions**: `clientId ASC, status ASC, createdAt DESC`
10. **client_subscriptions**: `status ASC, nextServiceDate ASC`
11. **incident_reports**: `reporterId ASC, reportedAt DESC`
12. **incident_reports**: `type ASC, severity ASC, reportedAt DESC`
13. **incident_reports**: `status ASC, reportedAt DESC`
14. **background_checks**: `workerId ASC, requestedAt DESC`
15. **background_checks**: `status ASC, requestedAt DESC`
16. **emergency_contacts**: `userId ASC, isPrimary DESC, createdAt DESC`
17. **emergency_sos**: `status ASC, triggeredAt DESC`

## Data Flow Examples

### Creating a Job:
1. Client creates job in `jobs` collection
2. System creates initial event in `job_events`
3. Admin assigns worker, updates job status
4. System sends notification to worker

### Job Completion:
1. Worker marks job as completed
2. System creates completion event in `job_events`
3. System calculates earnings and creates `income` record
4. System sends completion notification to client

### Chat Message:
1. User sends message to `messages` collection
2. System updates `lastMessage` in `chats` collection
3. System sends push notification to other participants

### Subscription Management:
1. Admin creates subscription plan in `subscription_plans` collection
2. Client subscribes to plan, creates record in `client_subscriptions`
3. System calculates next service date based on frequency
4. System auto-generates jobs for upcoming service dates
5. System updates subscription status after service completion

### Incident Reporting:
1. Worker/client reports incident in `incident_reports` collection
2. System creates incident with photos and details
3. Admin investigates incident, updates status to 'investigating'
4. Admin resolves incident with notes and actions taken
5. System tracks follow-up requirements and completion

### Emergency SOS:
1. Worker triggers emergency SOS with location
2. System creates record in `emergency_sos` collection
3. System automatically creates incident report
4. System notifies emergency contacts and supervisors
5. Admin responds to SOS and marks as resolved

### Background Check Process:
1. Admin requests background check in `background_checks` collection
2. System tracks check status and provider information
3. Admin updates status when check is in progress
4. Admin completes check with results and documentation
5. System maintains audit trail of all check activities