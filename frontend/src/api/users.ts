import type { UserSummary } from '../types/user';
import { request } from './http';

export const listAssignableUsers = () => request<UserSummary[]>('/api/users?assignable=true');
