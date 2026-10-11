import type { RequestHandler } from "express";
import * as ticketsService from "../services/tickets.service";

export const create: RequestHandler = async (req, res) => {
  const ticket = await ticketsService.createTicket(req.body);
  res.status(201).json(ticket);
};

export const list: RequestHandler = async (_req, res) => {
  const result = await ticketsService.listTickets(res.locals.query);
  res.json(result);
};

export const update: RequestHandler = async (req, res) => {
  const ticket = await ticketsService.updateTicket(
    res.locals.params.id,
    req.body
  );
  res.json(ticket);
};

export const stats: RequestHandler = async (_req, res) => {
  res.json(await ticketsService.getStats());
};