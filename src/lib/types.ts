export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'stylist' | 'assistant';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffService {
  id: string;
  staff_id: string;
  service_id: string;
  created_at: string;
}

export interface WorkingHours {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  notes?: string;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
  last_visit?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  staff_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}