export interface User {
  id: string;
  email: string;
  role: 'admin' | 'team_lead' | 'member';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface Field {
  name: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date' | 'multi-select' | 'project-select';
  label: string | Record<string, string>;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface Page {
  type: string;
  entity: string;
  title: string;
  fields?: Field[];
}

export interface AppConfig {
  id: string;
  name: string;
  pages: Page[];
  config?: Record<string, any>;
}

export interface DataRecord {
  id: string;
  entity_name: string;
  data: Record<string, any>;
  user_id: string;
  app_id?: string;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}