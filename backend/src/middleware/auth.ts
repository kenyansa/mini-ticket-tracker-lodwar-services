import type { RequestHandler } from 'express';
import { can } from '../auth/permissions';
import type { Permission } from '../auth/permissions';
import * as usersRepo from '../repositories/users.repo';
import { HttpError } from './errorHandler';

// Loads the user from the session on every request, so role changes and deactivation take effect immediately.
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const userId = req.session.userId;
  if (!userId) throw new HttpError(401, 'Authentication required');

  const user = await usersRepo.findAuthUserById(userId);
  if (!user || !user.isActive) throw new HttpError(401, 'Authentication required');

  req.user = user;
  next();
};

export const requirePermission =
  (...permissions: Permission[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw new HttpError(401, 'Authentication required');
    if (!permissions.every((p) => can(req.user!, p))) {
      throw new HttpError(403, 'You do not have permission to do this');
    }
    next();
  };
