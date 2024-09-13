import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DateSelectArg, EventInput } from '@fullcalendar/core';
import { useFetcher } from '@remix-run/react';
import EventModal from './EventModal';
import type { ExtendedEvent } from '~/types';

interface CalendarProps {
  userId: string;
}

export default function Calendar({ userId }: CalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fetcher = useFetcher<{ events: ExtendedEvent[] }>();

  React.useEffect(() => {
    if (fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/events?userId=${userId}`);
    }
  }, [fetcher, userId]);

  const events = fetcher.data?.events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.description
  })) || [];

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedEvent(arg.event.toPlainObject());
    setShowModal(true);
  };

  const handleDateSelect = (arg: DateSelectArg) => {
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        selectable={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
      />
      {showModal && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          userId={userId}
        />
      )}
    </div>
  );
}