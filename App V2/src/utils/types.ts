
export type Role = 'admin'|'worker'|'client';

export type JobStatus = 'pending' | 'active' | 'upcoming' | 'completed' | 'cancelled';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

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
