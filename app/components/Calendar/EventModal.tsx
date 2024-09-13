import React, { useState } from 'react';
import { Form, useActionData, useSubmit, useNavigation } from '@remix-run/react';
import { EventInput } from '@fullcalendar/core';

interface EventModalProps {
  event: EventInput | null;
  onClose: () => void;
  userId: string;
}

export default function EventModal({ event, onClose, userId }: EventModalProps) {
  const [title, setTitle] = useState(event?.title as string || '');
  const [start, setStart] = useState(event?.start ? new Date(event.start as string) : new Date());
  const [end, setEnd] = useState(event?.end ? new Date(event.end as string) : new Date());
  const [description, setDescription] = useState(event?.extendedProps?.description as string || '');

  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('start', start.toISOString());
    formData.append('end', end.toISOString());
    formData.append('description', description);
    formData.append('userId', userId);

    if (event && event.id) {
      formData.append('eventId', event.id as string);
      submit(formData, { method: 'put', action: '/api/events' });
    } else {
      submit(formData, { method: 'post', action: '/api/events' });
    }
    onClose();
  };

  const handleDelete = async () => {
    if (event && event.id) {
      const formData = new FormData();
      formData.append('eventId', event.id as string);
      submit(formData, { method: 'delete', action: '/api/events' });
      onClose();
    }
  };

  return (
    <div className="modal">
      <Form method="post" onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Title"
          required
        />
        <input
          type="datetime-local"
          value={start.toISOString().slice(0, 16)}
          onChange={(e) => setStart(new Date(e.target.value))}
          required
        />
        <input
          type="datetime-local"
          value={end.toISOString().slice(0, 16)}
          onChange={(e) => setEnd(new Date(e.target.value))}
          required
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event Description"
        />
        <button type="submit" disabled={navigation.state === 'submitting'}>
          {navigation.state === 'submitting' ? 'Saving...' : 'Save Event'}
        </button>
        {event && (
          <button type="button" onClick={handleDelete}>
            Delete Event
          </button>
        )}
      </Form>
      <button onClick={onClose}>Close</button>
    </div>
  );
}