import type { User } from '../types/user';
import { request } from './http';

export const me = () => request<User>('/api/auth/me');

export const login = (email: string, password: string) =>
  request<User>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const register = (name: string, email: string, password: string) =>
  request<User>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const logout = () => request<void>('/api/auth/logout', { method: 'POST' });
