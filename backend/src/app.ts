import connectPgSimple from 'connect-pg-simple';
import express from 'express';
import session from 'express-session';
import { config } from './config';
import { pool } from './db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRouter from './routes/auth.routes';
import ticketsRouter from './routes/tickets.routes';
import usersRouter from './routes/users.routes';

const PgStore = connectPgSimple(session);

export const app = express();

// we always sit behind a proxy (Vite, nginx or the host); needed for secure cookies and client IPs
app.set('trust proxy', 1);

app.use(express.json());

app.use(
  session({
    store: new PgStore({
      pool,
      tableName: 'session',
      pruneSessionInterval: config.isTest ? false : 15 * 60,
    }),
    name: 'sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false, // no cookie until someone logs in
    rolling: true, // activity extends the session
    cookie: {
      httpOnly: true, // JavaScript cannot read the cookie
      sameSite: 'lax',
      secure: config.cookieSecure,
      maxAge: 8 * 60 * 60 * 1000,
    },
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/tickets', ticketsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
