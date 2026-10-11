import type { RequestHandler } from "express";
import * as ticketsService from "../services/tickets.service";

export const create: RequestHandler = async (req, res) => {
  const ticket = await ticketsService.createTicket(req.body);
  res.status(201).json(ticket);
};