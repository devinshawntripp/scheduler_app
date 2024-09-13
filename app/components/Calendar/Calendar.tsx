import React, { useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useFetcher } from '@remix-run/react';

interface CalendarProps {
  userId: string;
}

const Calendar: React.FC<CalendarProps> = React.memo(({ userId }) => {
  const fetcher = useFetcher();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (userId && fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/events?userId=${userId}`);
    }
  }, [userId]);

  useEffect(() => {
    if (fetcher.data && fetcher.data.events) {
      setEvents(fetcher.data.events);
    }
  }, [fetcher.data]);

  const calendarOptions = useMemo(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    events: events,
    eventContent: (arg: any) => {
      return (
        <>
          <b>{arg.timeText}</b>
          <i>{arg.event.title}</i>
        </>
      )
    }
  }), [events]);

  if (fetcher.state === "loading") {
    return <div className="text-neon-blue">Loading events...</div>;
  }

  return (
    <div className="calendar-container">
      <FullCalendar {...calendarOptions} />
    </div>
  );
});

export default Calendar;
