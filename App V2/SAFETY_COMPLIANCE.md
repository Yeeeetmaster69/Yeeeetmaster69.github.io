# Safety & Compliance System

This document outlines the requirements and proposed architecture for the Safety & Compliance features in the Handyman Pro application, including Incident Reporting, Emergency Contact/SOS functionality, and Background Checks integration.

## Overview

The Safety & Compliance system ensures worker and client safety through three core components:
1. **Incident Reporting** - Allow workers and clients to report safety incidents with documentation
2. **Emergency Contact/SOS** - Provide emergency assistance for on-site workers
3. **Background Checks** - Integrate background verification for worker onboarding

## Requirements

### 1. Incident Reporting System

#### User Stories
- **As a worker**, I want to report safety incidents during job execution so that proper documentation and follow-up can occur
- **As a client**, I want to report safety concerns or incidents related to work performed at my property
- **As an admin**, I want to review, track, and manage all reported incidents for compliance and safety improvement

#### Functional Requirements
- Workers and clients can create incident reports with the following information:
  - Incident type (injury, property damage, near miss, safety violation, other)
  - Date, time, and location of incident
  - Detailed description of what happened
  - Severity level (low, medium, high, critical)
  - Photos and documentation (up to 10 images)
  - Witness information (if applicable)
  - Immediate actions taken
- Reports are automatically timestamped and geo-tagged if location services are enabled
- Workers can report incidents related to specific jobs
- Clients can report incidents related to completed or ongoing work
- Admins can review, investigate, and close incidents
- Automated notifications to relevant parties based on severity
- Integration with job records for incident tracking

#### Non-Functional Requirements
- Reports must be submitted within 24 hours for time-sensitive incidents
- Photos must be automatically uploaded to secure cloud storage
- All incident data must be encrypted and access-controlled
- System must support offline report creation with sync when connectivity returns

### 2. Emergency Contact/SOS System

#### User Stories
- **As a worker**, I want to quickly contact emergency services or designated contacts if I'm in danger on a job site
- **As an admin**, I want to be notified immediately when a worker activates emergency protocols
- **As an emergency contact**, I want to receive location and context information when a worker needs help

#### Functional Requirements
- One-tap SOS button accessible from all worker app screens
- Automatic location sharing when SOS is activated
- Configurable emergency contact list (911, company emergency line, supervisors, family)
- Progressive escalation system:
  1. Send alert to company emergency contact
  2. If no response in 5 minutes, escalate to supervisor
  3. If no response in 10 minutes, contact emergency services
- Workers can set up personal emergency contacts during onboarding
- Real-time location tracking during emergency situations
- Emergency status visible to admins with ability to dispatch help
- Silent alarm option for situations where noise could increase danger
- Check-in system for lone workers (configurable intervals)

#### Non-Functional Requirements
- SOS activation must work even with poor cellular coverage
- Location accuracy within 10 meters when GPS is available
- Emergency contacts notified within 30 seconds of activation
- System must function offline and sync when connection is restored
- Battery optimization to prevent drain during emergencies

### 3. Background Checks Integration

#### User Stories
- **As an admin**, I want to verify worker backgrounds before allowing them to accept jobs
- **As a client**, I want assurance that workers have been properly vetted
- **As a worker**, I want a streamlined background check process during onboarding

#### Functional Requirements
- Integration with third-party background check providers (Checkr, Sterling, etc.)
- Support for different background check levels:
  - Basic criminal history
  - Extended criminal history
  - Motor vehicle records (for workers who drive)
  - Identity verification
  - Professional license verification
- Automated workflow for new worker onboarding
- Background check status tracking and expiration monitoring
- Configurable requirements based on job type or client preferences
- Secure document storage for background check results
- Compliance reporting for regulatory requirements
- Re-verification scheduling for expired checks

#### Non-Functional Requirements
- Background check results must be stored securely and access-controlled
- Integration API calls must be encrypted and logged
- System must comply with relevant employment and privacy laws
- Results must be processed and available within 48-72 hours

## Proposed Architecture

### Database Schema Extensions

#### Firestore Collections

##### 1. `incidents`
```typescript
{
  id: string;
  reporterId: string; // User ID of person reporting
  reporterRole: 'worker' | 'client' | 'admin';
  jobId?: string; // Associated job if applicable
  type: 'injury' | 'property_damage' | 'near_miss' | 'safety_violation' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  incidentDate: timestamp;
  images: string[]; // Firebase Storage URLs
  witnesses: {
    name: string;
    contact: string;
    statement?: string;
  }[];
  immediateActions: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  assignedInvestigator?: string; // Admin user ID
  resolutionNotes?: string;
  followUpRequired: boolean;
  createdAt: timestamp;
  updatedAt: timestamp;
  resolvedAt?: timestamp;
}
```

##### 2. `emergency_contacts`
```typescript
{
  id: string;
  userId: string; // Worker's user ID
  contacts: {
    id: string;
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    isPrimary: boolean;
    notificationMethods: ('sms' | 'call' | 'email')[];
  }[];
  companyEmergencyNumber: string;
  emergencyServices: string; // Usually 911
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

##### 3. `sos_events`
```typescript
{
  id: string;
  workerId: string;
  jobId?: string;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
    address?: string;
  };
  triggerTime: timestamp;
  status: 'active' | 'responded' | 'false_alarm' | 'resolved';
  escalationLevel: number; // 0-3 (company, supervisor, emergency services)
  notificationsSent: {
    contactId: string;
    method: 'sms' | 'call' | 'email';
    sentAt: timestamp;
    delivered: boolean;
    responseReceived?: timestamp;
  }[];
  responderId?: string; // Admin who responded
  responseTime?: number; // in minutes
  resolution: string;
  notes?: string;
  resolvedAt?: timestamp;
}
```

##### 4. `background_checks`
```typescript
{
  id: string;
  workerId: string;
  provider: string; // 'checkr', 'sterling', etc.
  providerRequestId: string;
  type: 'basic' | 'extended' | 'mvr' | 'identity' | 'license';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  requestedAt: timestamp;
  completedAt?: timestamp;
  expiresAt?: timestamp;
  results: {
    passed: boolean;
    score?: number;
    findings: {
      category: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
    }[];
    documents: string[]; // Secure storage URLs
  };
  adminReview: {
    reviewerId: string;
    approved: boolean;
    notes: string;
    reviewedAt: timestamp;
  };
  complianceNotes?: string;
}
```

##### 5. `worker_check_ins`
```typescript
{
  id: string;
  workerId: string;
  jobId: string;
  scheduledTime: timestamp;
  actualTime?: timestamp;
  location?: {
    lat: number;
    lng: number;
  };
  status: 'scheduled' | 'completed' | 'missed' | 'overdue';
  responseMethod?: 'automatic' | 'manual';
  escalated: boolean;
  escalationTime?: timestamp;
  notes?: string;
}
```

### User Interface Design

#### Worker Interface
- **Safety Dashboard**: Quick access to incident reporting, SOS button, and safety resources
- **Incident Report Form**: Step-by-step form with photo upload and offline capability
- **Emergency Button**: Prominent, always-accessible SOS functionality
- **Check-in System**: Automated prompts for lone worker check-ins
- **Safety Profile**: View background check status and emergency contacts

#### Client Interface
- **Report Incident**: Simplified incident reporting for property or service issues
- **Worker Safety Info**: View worker background check status (privacy-compliant)
- **Emergency Contact**: Access to report concerns about worker safety

#### Admin Interface
- **Incident Management Dashboard**: Overview of all incidents with filtering and search
- **Emergency Response Center**: Real-time SOS monitoring and response tools
- **Background Check Console**: Manage worker verification process and renewals
- **Safety Analytics**: Reports on incident trends and safety metrics
- **Compliance Center**: Regulatory reporting and documentation management

### Integration Points

#### External Services
- **Background Check Providers**: API integration with Checkr, Sterling, or similar services
- **Emergency Services**: SMS/phone integration for automated emergency notifications
- **Mapping Services**: Google Maps or similar for location services and geocoding
- **Document Storage**: Firebase Storage with encryption for sensitive documents

#### Existing Features
- **User Management**: Leverage existing role-based access control
- **Job System**: Link incidents to specific jobs for better tracking
- **Notification System**: Extend existing push notifications for safety alerts
- **Photo Upload**: Use existing image handling system for incident documentation

### Security & Privacy Considerations

#### Data Protection
- All incident reports and background check data encrypted at rest and in transit
- Access controls based on role and need-to-know basis
- Regular data retention policy with automatic purging of expired records
- Audit logging for all access to sensitive safety data

#### Privacy Compliance
- Worker consent required for background checks and emergency contact sharing
- Client notification when incidents are reported on their property
- GDPR/CCPA compliance for data handling and deletion requests
- Anonymous reporting option for certain incident types

#### Emergency Protocols
- SOS system must function independently of regular app authentication
- Emergency contact information stored locally for offline access
- Automatic location sharing only during active emergencies
- Clear escalation procedures with defined response timeframes

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
- Database schema implementation
- Basic incident reporting UI
- Emergency contact management
- Admin incident review interface

### Phase 2: Core Features (Weeks 3-4)
- SOS system with location services
- Photo upload for incident reports
- Background check provider integration
- Worker check-in system

### Phase 3: Advanced Features (Weeks 5-6)
- Automated escalation systems
- Offline functionality
- Safety analytics and reporting
- Compliance dashboard

### Phase 4: Testing & Refinement (Weeks 7-8)
- End-to-end testing of emergency procedures
- Performance optimization
- Security audit and penetration testing
- User acceptance testing

## Success Metrics

- Incident response time reduced by 50%
- 100% of workers complete background checks within onboarding timeframe
- Zero missed emergency responses
- 95% user satisfaction with safety features
- Full regulatory compliance maintained

## Compliance Considerations

- OSHA compliance for workplace safety reporting
- State and local regulations for background checks
- Privacy laws (GDPR, CCPA) for personal data handling
- Industry-specific safety standards for handyman services
- Emergency response protocols aligned with local emergency services

## Future Enhancements

- AI-powered incident analysis and prediction
- Integration with wearable safety devices
- Real-time environmental hazard monitoring
- Safety training module integration
- Predictive analytics for safety risk assessment