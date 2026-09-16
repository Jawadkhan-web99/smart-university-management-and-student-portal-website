export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: unknown;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
