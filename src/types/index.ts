/**
 * Commercial-grade TypeScript type definitions
 * Comprehensive types for all app features
 */

// Base types
export type UserRole = 'admin' | 'worker' | 'client';

export interface User {
  uid: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  phone?: string;
}

// Authentication & Onboarding
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  hasSelectedRole: boolean;
  setHasSelectedRole: (selected: boolean) => void;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

// Location & GPS
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface JobLocation extends LocationCoords {
  address: string;
  radius: number; // meters for geofencing
  city?: string;
  state?: string;
  zipCode?: string;
}

// Time Tracking
export interface TimeEntry {
  id: string;
  jobId: string;
  workerId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  startLocation: LocationCoords;
  endLocation?: LocationCoords;
  isWithinGeofence: boolean;
  notes?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  breaks?: TimeBreak[];
}

export interface TimeBreak {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  reason?: string;
}

// Jobs & Services
export interface Job {
  id: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  workerId?: string;
  workerName?: string;
  location: JobLocation;
  status: JobStatus;
  priority: JobPriority;
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  hourlyRate: number;
  fixedPrice?: number;
  category: ServiceCategory;
  skills: string[];
  scheduledDate: string;
  completedDate?: string;
  createdAt: string;
  updatedAt?: string;
  photos?: JobPhoto[];
  materials?: Material[];
  notes?: string;
}

export type JobStatus = 
  | 'draft' 
  | 'posted' 
  | 'assigned' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'on_hold';

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ServiceCategory = 
  | 'plumbing' 
  | 'electrical' 
  | 'carpentry' 
  | 'painting' 
  | 'cleaning' 
  | 'landscaping' 
  | 'appliance_repair' 
  | 'hvac' 
  | 'general';

export interface JobPhoto {
  id: string;
  url: string;
  type: 'before' | 'during' | 'after' | 'material' | 'damage';
  description?: string;
  timestamp: string;
  location?: LocationCoords;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  receipt?: string;
}

// Invoicing & Payments
export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  workerId?: string;
  workerName?: string;
  jobId?: string;
  amount: number;
  subtotal: number;
  tax: number;
  discount?: number;
  status: InvoiceStatus;
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
}

export type InvoiceStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'paid' 
  | 'partially_paid' 
  | 'overdue' 
  | 'cancelled' 
  | 'refunded';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: 'labor' | 'material' | 'service' | 'expense';
}

export interface Estimate {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  projectDescription: string;
  amount: number;
  subtotal: number;
  tax: number;
  status: EstimateStatus;
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
  validUntil: string;
  items: InvoiceItem[];
  notes?: string;
  acceptedInvoiceId?: string;
}

export type EstimateStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'declined' 
  | 'expired' 
  | 'cancelled';

export type PaymentMethod = 
  | 'cash' 
  | 'check' 
  | 'credit_card' 
  | 'debit_card' 
  | 'bank_transfer' 
  | 'paypal' 
  | 'venmo' 
  | 'square' 
  | 'stripe';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  RoleSelect: undefined;
  ForgotPassword: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  Permissions: undefined;
  FeaturesOverview: { role: UserRole };
  Completion: undefined;
};

export type AdminStackParamList = {
  Dashboard: undefined;
  Users: undefined;
  Jobs: undefined;
  Clients: undefined;
  Workers: undefined;
  Analytics: undefined;
  Settings: undefined;
  AdminPortal: undefined;
  InvoiceList: undefined;
  CreateEstimate: undefined;
  CreateInvoice: undefined;
};

export type WorkerStackParamList = {
  Home: undefined;
  Jobs: undefined;
  JobDetail: { jobId: string };
  Earnings: undefined;
  TimeTracking: undefined;
  GeofencedTimer: undefined;
  Photos: { jobId: string };
  Profile: undefined;
  EmergencyContact: undefined;
};

export type ClientStackParamList = {
  Home: undefined;
  RequestService: undefined;
  MyJobs: undefined;
  JobDetail: { jobId: string };
  Payments: undefined;
  Reviews: undefined;
  Profile: undefined;
};

// Theme & UI
export interface ThemeConfig {
  primary: string;
  accent: string;
  mode: 'light' | 'dark' | 'auto';
  animations: boolean;
  reducedMotion: boolean;
}

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  animationDuration?: number;
}

// App Configuration
export interface AppConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  stripe: {
    publishableKey: string;
  };
  square: {
    appId: string;
    locationId: string;
  };
  features: {
    enableOnboarding: boolean;
    enableGeofencedTracking: boolean;
    enablePayments: boolean;
  };
  adminPortalUrl: string;
  googleMapsApiKey: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Utility types
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Partial<T> = { [P in keyof T]?: T[P] };
export type Required<T> = { [P in keyof T]-?: T[P] };