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

### 15. incidents

Stores safety incident reports (See SAFETY_COMPLIANCE.md for full schema).


```typescript
{
  id: string;
  reporterId: string;

  reporterRole: 'worker' | 'client' | 'admin';
  jobId?: string;
  type: 'injury' | 'property_damage' | 'near_miss' | 'safety_violation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  createdAt: timestamp;
  // ... additional fields in SAFETY_COMPLIANCE.md

}
```

### 16. emergency_contacts

Stores worker emergency contact information.


```typescript
{
  id: string;

  userId: string;
  contacts: Array<{
    name: string;
    phoneNumber: string;
    relationship: string;
    isPrimary: boolean;
  }>;
  createdAt: timestamp;
  // ... additional fields in SAFETY_COMPLIANCE.md
}
```

### 17. sos_events
Stores emergency SOS activations and responses.


```typescript
{
  id: string;
  workerId: string;

  location: { lat: number; lng: number; };
  triggerTime: timestamp;
  status: 'active' | 'responded' | 'false_alarm' | 'resolved';
  escalationLevel: number;
  // ... additional fields in SAFETY_COMPLIANCE.md

}
```

### 18. background_checks

Stores worker background verification records.


```typescript
{
  id: string;
  workerId: string;

  provider: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  results: {
    passed: boolean;
    findings: Array<object>;
  };
  // ... additional fields in SAFETY_COMPLIANCE.md

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
    
    // Incidents - reporters and admins can read/write, assigned investigators can read/write
    match /incidents/{incidentId} {
      allow read: if request.auth != null && (
        resource.data.reporterId == request.auth.uid ||
        resource.data.assignedInvestigator == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
        (resource.data.reporterId == request.auth.uid && resource.data.status == 'reported')
      );
    }
    
    // Emergency contacts - workers can read/write their own, admins can read all
    match /emergency_contacts/{contactId} {
      allow read, write: if request.auth != null && (
        resource.data.workerId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    // Emergency alerts - workers can create their own, admins and emergency contacts can read
    match /emergency_alerts/{alertId} {
      allow read: if request.auth != null && (
        resource.data.workerId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
      allow create: if request.auth != null && resource.data.workerId == request.auth.uid;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Background checks - admin only
    match /background_checks/{checkId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
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
8. **incidents**: `reporterId ASC, status ASC, createdAt DESC`
9. **incidents**: `jobId ASC, createdAt DESC`
10. **incidents**: `severity ASC, status ASC, createdAt DESC`

11. **sos_events**: `workerId ASC, status ASC, triggerTime DESC`
12. **background_checks**: `workerId ASC, status ASC, requestedAt DESC`
13. **emergency_contacts**: `userId ASC`


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

### Incident Reporting:
1. Worker/client creates incident in `incidents` collection
2. System auto-tags location and job context
3. Admin receives notification for high-severity incidents
4. System creates job event if incident is job-related

### Emergency SOS Activation:
1. Worker triggers SOS, creates `sos_events` record
2. System immediately notifies emergency contacts
3. System begins location tracking and escalation timer
4. Admin dashboard shows active emergency status
5. Response creates resolution record and notifications

### Background Check Process:
1. New worker triggers background check in `background_checks`
2. System calls external provider API
3. Provider webhook updates status and results
4. Admin reviews and approves/rejects worker
5. System updates worker profile and permissions