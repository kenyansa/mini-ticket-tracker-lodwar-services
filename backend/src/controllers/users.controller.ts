import type { RequestHandler } from 'express';
import * as usersService from '../services/users.service';

export const list: RequestHandler = async (_req, res) => {
  res.json(await usersService.listUsers(res.locals.query.assignable === 'true'));
};

export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await usersService.createUser(req.body));
};

export const update: RequestHandler = async (req, res) => {
  res.json(await usersService.updateUser(res.locals.params.id, req.body, req.user!));
};
