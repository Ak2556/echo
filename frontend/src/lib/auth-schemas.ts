/**
 * Authentication schemas and types
 */

import { z } from 'zod';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  email_verified: boolean;
  is_admin?: boolean;
  totp_enabled?: boolean;
}

export interface Session {
  id: string;
  user_id: string;
  created_at: string;
  last_active: string;
  last_activity?: string;
  user_agent: string;
  ip_address: string;
  is_current?: boolean;
  device_type?: string;
  device_name?: string;
  location?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  full_name?: string;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
  full_name?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface TwoFactorData {
  code: string;
}

export interface SessionData {
  id: string;
  user_id: string;
  created_at: string;
  last_active: string;
  user_agent: string;
  ip_address: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface Setup2FAResponse {
  secret: string;
  qr_code: string;
  backup_codes: string[];
}

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
