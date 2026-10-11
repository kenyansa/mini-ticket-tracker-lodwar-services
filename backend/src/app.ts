import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import ticketsRouter from "./routes/tickets.routes";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/tickets", ticketsRouter);

app.use(notFoundHandler);
app.use(errorHandler);