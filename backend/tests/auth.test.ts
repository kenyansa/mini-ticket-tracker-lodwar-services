import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { createUser, loginAs } from './helpers';

describe('authentication', () => {
  it('rejects unauthenticated requests', async () => {
    expect((await request(app).get('/tickets')).status).toBe(401);
    expect((await request(app).get('/auth/me')).status).toBe(401);
  });

  it('registers a requester, keeps the session, and logs out', async () => {
    const agent = request.agent(app);
    const reg = await agent
      .post('/auth/register')
      .send({ name: 'Ann', email: 'ann@test.com', password: 'password123' });

    expect(reg.status).toBe(201);
    expect(reg.body.role).toBe('requester');
    expect(reg.body.passwordHash).toBeUndefined();
    expect((await agent.get('/auth/me')).status).toBe(200);

    expect((await agent.post('/auth/logout')).status).toBe(204);
    expect((await agent.get('/auth/me')).status).toBe(401);
  });

  it('rejects a duplicate email and a wrong password', async () => {
    await createUser('agent', 'a@test.com');

    const dup = await request(app)
      .post('/auth/register')
      .send({ name: 'X', email: 'a@test.com', password: 'password123' });
    expect(dup.status).toBe(409);

    const bad = await request(app)
      .post('/auth/login')
      .send({ email: 'a@test.com', password: 'wrong-password' });
    expect(bad.status).toBe(401);
  });
});

describe('authorization', () => {
  it('requesters see only their own tickets and cannot update', async () => {
    const { agent: admin } = await loginAs('admin');
    const { agent: requester } = await loginAs('requester');

    await admin.post('/tickets').send({ title: 'admin ticket' });
    const mine = await requester.post('/tickets').send({ title: 'my ticket' });

    const list = await requester.get('/tickets');
    expect(list.body.total).toBe(1);
    expect(list.body.data[0].title).toBe('my ticket');

    const stats = await requester.get('/tickets/stats');
    expect(stats.body).toEqual({ open: 1, in_progress: 0, closed: 0 });

    const patch = await requester.patch(`/tickets/${mine.body.id}`).send({ status: 'closed' });
    expect(patch.status).toBe(403);
  });

  it('agents can assign tickets, but only to staff', async () => {
    const { agent } = await loginAs('agent');
    const staff = await createUser('admin', 'boss@test.com');
    const requester = await createUser('requester', 'req@test.com');
    const ticket = await agent.post('/tickets').send({ title: 'x' });
    const url = `/tickets/${ticket.body.id}`;

    const ok = await agent.patch(url).send({ assigneeId: staff.id });
    expect(ok.status).toBe(200);
    expect(ok.body.assigneeId).toBe(staff.id);

    expect((await agent.patch(url).send({ assigneeId: requester.id })).status).toBe(400);

    const cleared = await agent.patch(url).send({ assigneeId: null });
    expect(cleared.body.assigneeId).toBeNull();
  });

  it('only admins can manage users', async () => {
    const body = { name: 'N', email: 'n@test.com', password: 'password123', role: 'agent' };

    const { agent } = await loginAs('agent');
    expect((await agent.post('/users').send(body)).status).toBe(403);

    const { agent: admin } = await loginAs('admin');
    expect((await admin.post('/users').send(body)).status).toBe(201);
  });
});
