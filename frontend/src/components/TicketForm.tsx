import { useState } from 'react';
import type { FormEvent } from 'react';
import { createTicket } from '../api/tickets';
import type { Priority } from '../types/ticket';
import { PRIORITY_LABELS } from './Badge';

interface Props {
  onCreated: () => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export function TicketForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createTicket({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="ticket-form"
    >
      <h2 className="form-heading">Create a ticket</h2>

      <div className="form-grid">
        <label htmlFor="title" className="form-field form-field-wide">
          <span className="form-label">Title</span>
          <input
            id="title"
            className="form-control"
            value={title}
            maxLength={200}
            placeholder="What needs to get done?"
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label htmlFor="description" className="form-field form-field-wide">
          <span className="form-label">
            Description <span className="form-hint">(optional)</span>
          </span>
          <textarea
            id="description"
            rows={3}
            className="form-control"
            value={description}
            placeholder="Add any useful context..."
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <label htmlFor="priority" className="form-field">
          <span className="form-label">Priority</span>
          <select
            id="priority"
            className="form-control"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitting} className="primary-button">
          {submitting ? 'Creating…' : 'Create ticket'}
        </button>
      </div>

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
    </form>
  );
}
