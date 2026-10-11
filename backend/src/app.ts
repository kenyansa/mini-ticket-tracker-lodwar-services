import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

//mount ticket routes here 

app.use(notFoundHandler);
app.use(errorHandler);