import { beforeEach, describe, expect, it } from 'vitest';
import { loginAs } from './helpers';

let agent: Awaited<ReturnType<typeof loginAs>>['agent'];

// runs after the setup file's truncate, so each test gets a fresh admin session
beforeEach(async () => {
  ({ agent } = await loginAs('admin'));
});

async function createTicket(body: Record<string, unknown>) {
  return agent.post('/tickets').send(body);
}

describe('POST /tickets', () => {
  it('creates a ticket with defaults', async () => {
    const res = await createTicket({ title: 'Printer is on fire' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      title: 'Printer is on fire',
      description: null,
      status: 'open',
      priority: 'medium',
      assigneeId: null,
    });
    expect(res.body.createdBy).toBeTruthy();
    expect(res.body.createdAt).toBeTruthy();
  });

  it('rejects a missing title', async () => {
    const res = await createTicket({});

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('rejects an invalid priority and unknown fields', async () => {
    expect((await createTicket({ title: 'x', priority: 'urgent' })).status).toBe(400);
    expect((await createTicket({ title: 'x', status: 'closed' })).status).toBe(400);
  });
});

describe('GET /tickets/stats', () => {
  it('returns zero counts for an empty table', async () => {
    const res = await agent.get('/tickets/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ open: 0, in_progress: 0, closed: 0 });
  });

  it('returns counts grouped by status, including zeros', async () => {
    await createTicket({ title: 'a' });
    await createTicket({ title: 'b' });
    const third = await createTicket({ title: 'c' });
    await agent.patch(`/tickets/${third.body.id}`).send({ status: 'in_progress' });

    const res = await agent.get('/tickets/stats');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ open: 2, in_progress: 1, closed: 0 });
  });
});

describe('GET /tickets', () => {
  it('paginates newest first', async () => {
    for (const title of ['one', 'two', 'three']) {
      await createTicket({ title });
    }

    const page1 = await agent.get('/tickets?limit=2&page=1');
    expect(page1.status).toBe(200);
    expect(page1.body.data.map((t: { title: string }) => t.title)).toEqual(['three', 'two']);
    expect(page1.body).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });

    const page2 = await agent.get('/tickets?limit=2&page=2');
    expect(page2.body.data.map((t: { title: string }) => t.title)).toEqual(['one']);
  });

  it('filters by status', async () => {
    await createTicket({ title: 'a' });
    const b = await createTicket({ title: 'b' });
    await agent.patch(`/tickets/${b.body.id}`).send({ status: 'closed' });

    const res = await agent.get('/tickets?status=closed');

    expect(res.body.total).toBe(1);
    expect(res.body.data[0].title).toBe('b');
  });

  it('rejects an invalid status filter', async () => {
    const res = await agent.get('/tickets?status=banana');
    expect(res.status).toBe(400);
  });
});

describe('PATCH /tickets/:id', () => {
  it('updates status and priority', async () => {
    const created = await createTicket({ title: 'a' });

    const res = await agent
      .patch(`/tickets/${created.body.id}`)
      .send({ status: 'in_progress', priority: 'high' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'in_progress', priority: 'high' });
  });

  it('returns 404 for an unknown id', async () => {
    const res = await agent.patch('/tickets/9999').send({ status: 'closed' });
    expect(res.status).toBe(404);
  });

  it('rejects an invalid status, an empty body and unknown fields', async () => {
    const created = await createTicket({ title: 'a' });
    const url = `/tickets/${created.body.id}`;

    expect((await agent.patch(url).send({ status: 'done' })).status).toBe(400);
    expect((await agent.patch(url).send({})).status).toBe(400);
    expect((await agent.patch(url).send({ title: 'hacked' })).status).toBe(400);
  });
});
