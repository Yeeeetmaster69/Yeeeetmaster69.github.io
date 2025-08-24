
export type Role = 'admin'|'worker'|'client';

export type JobStatus = 'pending' | 'active' | 'upcoming' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'one-time';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'pending';

export type IncidentType = 'injury' | 'property_damage' | 'equipment_failure' | 'safety_violation' | 'emergency' | 'other';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ReminderType = 'job_scheduled' | 'payment_due' | 'review_request' | 'maintenance' | 'subscription_renewal' | 'custom';
export type NotificationChannel = 'push' | 'sms' | 'email' | 'in_app';
export type CallType = 'voice' | 'video';

export type Job = {
  id?: string;
  title: string;
  description: string;
  address: string;
  lat?: number;
  lng?: number;
  scheduledAt?: number;
  status?: JobStatus;
  priority?: JobPriority;
  assignedTo?: string[];
  clientId?: string;
  workerId?: string;
  priceType?: 'hourly'|'fixed';
  fixedPrice?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  actualHours?: number;
  totalCost?: number;
  notes?: string;
  beforeImages?: string[];
  afterImages?: string[];
  createdAt?: number;
  updatedAt?: number;
  completedAt?: number;
  startedAt?: number;
  pausedAt?: number;
  timeline?: JobEvent[];
};

export type JobEvent = {
  id?: string;
  jobId: string;
  type: 'created' | 'assigned' | 'started' | 'paused' | 'resumed' | 'completed' | 'cancelled' | 'rescheduled';
  timestamp: number;
  userId?: string;
  notes?: string;
  reason?: string;
  images?: string[];
};

export type Client = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'residential' | 'commercial';
  totalJobs: number;
  totalSpent: number;
  averageRating?: number;
  notes?: string;
  preferredContactMethod?: 'email' | 'phone' | 'sms';
  createdAt?: number;
  updatedAt?: number;
};

export type Worker = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  hourlyRate: number;
  skills: string[];
  isActive: boolean;
  totalJobs: number;
  totalEarnings: number;
  totalMilesDriven: number;
  averageRating?: number;
  hireDate: number;
  profileImage?: string;
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
  createdAt?: number;
  updatedAt?: number;
};

export type Reference = {
  id?: string;
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
  createdAt?: number;
  updatedAt?: number;
};

export type Message = {
  id?: string;
  chatId: string;
  senderId: string;
  senderRole: Role;
  content: string;
  timestamp: number;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
};

export type Chat = {
  id?: string;
  participants: string[];
  participantRoles: Role[];
  type: 'support' | 'job' | 'general';
  title?: string;
  lastMessage?: Message;
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
};

export type Notification = {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: 'job' | 'payment' | 'message' | 'system';
  isRead: boolean;
  data?: any;
  createdAt?: number;
};

export type TimeEntry = {
  id?: string;
  jobId: string;
  workerId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  hourlyRate: number;
  earnings: number;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
  createdAt?: number;
};

export type Expense = {
  id?: string;
  jobId?: string;
  workerId?: string;
  amount: number;
  category: string;
  description: string;
  receipt?: string;
  isReimbursed: boolean;
  createdAt?: number;
  approvedAt?: number;
  approvedBy?: string;
};

export type Income = {
  id?: string;
  jobId: string;
  clientId: string;
  amount: number;
  type: 'hourly' | 'fixed' | 'materials' | 'bonus';
  isPaid: boolean;
  paidAt?: number;
  paymentMethod?: string;
  invoiceId?: string;
  createdAt?: number;
};

export type EstimateRequest = {
  id?: string;
  clientId: string;
  title: string;
  description: string;
  address: string;
  preferredDate?: number;
  urgency: JobPriority;
  budget?: number;
  images?: string[];
  status: 'pending' | 'scheduled' | 'completed' | 'converted';
  estimatedAmount?: number;
  estimatedHours?: number;
  notes?: string;
  createdAt?: number;
  scheduledAt?: number;
  completedAt?: number;
};

export type DashboardStats = {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalRevenue: number;
  totalClients: number;
  totalWorkers: number;
  averageJobValue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
};

export type SubscriptionPlan = {
  id?: string;
  name: string;
  description: string;
  frequency: SubscriptionFrequency;
  basePrice: number;
  estimatedHours: number;
  services: string[];
  isActive: boolean;
  createdAt?: number;
  updatedAt?: number;
};

export type ClientSubscription = {
  id?: string;
  clientId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: number;
  endDate?: number;
  lastServiceDate?: number;
  nextServiceDate?: number;
  customPrice?: number;
  notes?: string;
  autoRenew: boolean;
  createdAt?: number;
  updatedAt?: number;
};

export type IncidentReport = {
  id?: string;
  reporterId: string;
  reporterRole: Role;
  jobId?: string;
  type: IncidentType;
  severity: IncidentSeverity;
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
  reportedAt: number;
  investigatedAt?: number;
  investigatedBy?: string;
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  createdAt?: number;
  updatedAt?: number;
};

export type EmergencyContact = {
  id?: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt?: number;
  updatedAt?: number;
};

export type BackgroundCheck = {
  id?: string;
  workerId: string;
  provider: string;
  checkType: 'criminal' | 'driving' | 'reference' | 'identity' | 'credit';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  requestedAt: number;
  completedAt?: number;
  expiresAt?: number;
  results?: {
    passed: boolean;
    details?: string;
    documentUrl?: string;
  };
  cost?: number;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
};

export type AutomatedReminder = {
  id?: string;
  type: ReminderType;
  title: string;
  message: string;
  recipientId: string;
  recipientRole: Role;
  channels: NotificationChannel[];
  scheduledAt: number;
  sentAt?: number;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  relatedEntityId?: string; // job, invoice, subscription, etc.
  relatedEntityType?: string;
  isRecurring: boolean;
  recurringInterval?: number; // in milliseconds
  nextScheduledAt?: number;
  metadata?: {
    [key: string]: any;
  };
  createdAt?: number;
  updatedAt?: number;
};

export type CallSession = {
  id?: string;
  initiatorId: string;
  participantId: string;
  type: CallType;
  status: 'initiated' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  startedAt: number;
  endedAt?: number;
  duration?: number; // in seconds
  recordingUrl?: string;
  jobId?: string;
  notes?: string;
  quality?: {
    rating: number; // 1-5
    issues?: string[];
  };
  createdAt?: number;
  updatedAt?: number;
};

export type PersonalizedNotification = {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: 'job' | 'payment' | 'message' | 'system' | 'reminder' | 'promotion';
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  personalizationData: {
    userName: string;
    jobCount?: number;
    earnings?: number;
    completionRate?: number;
    preferredTime?: string;
    interests?: string[];
  };
  sentAt?: number;
  readAt?: number;
  clickedAt?: number;
  isRead: boolean;
  data?: any;
  createdAt?: number;
};

export type CommunicationPreferences = {
  id?: string;
  userId: string;
  channels: {
    push: boolean;
    sms: boolean;
    email: boolean;
    inApp: boolean;
  };
  frequency: {
    jobReminders: 'none' | 'minimal' | 'normal' | 'frequent';
    paymentNotifications: 'none' | 'minimal' | 'normal' | 'frequent';
    promotions: 'none' | 'minimal' | 'normal' | 'frequent';
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
  };
  language: string;
  timezone: string;
  updatedAt?: number;
};
