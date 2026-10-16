import type { RequestHandler } from 'express';
import * as ticketsService from '../services/tickets.service';

export const create: RequestHandler = async (req, res) => {
  res.status(201).json(await ticketsService.createTicket(req.body, req.user!));
};

export const list: RequestHandler = async (req, res) => {
  res.json(await ticketsService.listTickets(res.locals.query, req.user!));
};

export const update: RequestHandler = async (req, res) => {
  res.json(await ticketsService.updateTicket(res.locals.params.id, req.body, req.user!));
};

export const stats: RequestHandler = async (req, res) => {
  res.json(await ticketsService.getStats(req.user!));
};
