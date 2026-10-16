import type { Request, RequestHandler } from "express";
import * as authService from "../services/auth.service";
import * as usersService from "../services/users.service";

const regenerate = (req: Request) =>
  new Promise<void>((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve()))
  );

const save = (req: Request) =>
  new Promise<void>((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve()))
  );

// a fresh session ID on login prevents session fixation
async function startSession(req: Request, userId: number) {
  await regenerate(req);
  req.session.userId = userId;
  await save(req);
}

export const register: RequestHandler = async (req, res) => {
  const user = await usersService.createUser({ ...req.body, role: "requester" });
  await startSession(req, user.id);
  res.status(201).json(user);
};

export const login: RequestHandler = async (req, res) => {
  const user = await authService.authenticate(req.body.email, req.body.password);
  await startSession(req, user.id);
  res.json(user);
};

export const logout: RequestHandler = async (req, res) => {
  await new Promise<void>((resolve, reject) =>
    req.session.destroy((err) => (err ? reject(err) : resolve()))
  );
  res.clearCookie("sid");
  res.status(204).end();
};

export const me: RequestHandler = (req, res) => {
  res.json(req.user);
};