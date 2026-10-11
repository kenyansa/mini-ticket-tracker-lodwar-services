import type { ErrorRequestHandler, RequestHandler } from 'express';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.path}` },
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { message: err.message, details: err.details },
    });
    return;
  }

  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { message: "Malformed JSON body" } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
};
