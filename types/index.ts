export interface User {
  id: string;
  email: string;
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
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
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

// Changed from 'Record' to 'DataRecord' to avoid conflict with TypeScript's built-in Record type
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