
export type Role = 'admin'|'worker'|'client';
export type Job = {
  id?: string;
  title: string;
  description: string;
  address: string;
  lat?: number;
  lng?: number;
  scheduledAt?: number;
  status?: 'new'|'scheduled'|'in_progress'|'done'|'cancelled';
  assignedTo?: string[];
  priceType?: 'hourly'|'fixed';
  fixedPrice?: number;
  hourlyRate?: number;
};
