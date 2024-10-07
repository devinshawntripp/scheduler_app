import React, { useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useFetcher } from '@remix-run/react';
import { APP_TIME_ZONE } from '~/config/app-config';

interface CalendarProps {
  userId: string;
  events?: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    userId: string;
  }>;
}

const Calendar: React.FC<CalendarProps> = React.memo(({ userId, events: propEvents }) => {
  const fetcher = useFetcher();
  const [events, setEvents] = useState(propEvents || []);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (propEvents) {
      setEvents(propEvents);
    } else if (userId && fetcher.state === 'idle' && !fetcher.data) {
      fetcher.load(`/api/events?userId=${userId}`);
    }
  }, [userId, propEvents]);

  useEffect(() => {
    if (!propEvents && fetcher.data && fetcher.data.events) {
      setEvents(fetcher.data.events);
    }
  }, [fetcher.data, propEvents]);

  const handleDateSelect = (selectInfo: any) => {
    setSelectedSlot({
      start: selectInfo.start,
      end: selectInfo.end,
    });
  };

  const handleBookAppointment = () => {
    if (selectedSlot) {
      // Implement the logic to book the appointment
      console.log('Booking appointment:', selectedSlot);
      // You can use a fetcher here to send the booking data to your server
      // After successful booking, update the events state
      setSelectedSlot(null);
    }
  };

  const calendarOptions = useMemo(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: isMobile ? 'listWeek' : 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    views: {
      listWeek: { buttonText: 'List' }
    },
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00',
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    events: events,
    timeZone: APP_TIME_ZONE,
    eventContent: (arg: any) => {
      return (
        <>
          <b>{arg.timeText}</b>
          <i>{arg.event.title}</i>
        </>
      )
    },
    height: 'auto',
    aspectRatio: isMobile ? 0.8 : 1.35,
    handleWindowResize: true,
    stickyHeaderDates: false,
    selectable: true,
    select: handleDateSelect,
  }), [events, isMobile]);

  const mobileStyles = `
    @media (max-width: 767px) {
      .fc .fc-toolbar {
        flex-direction: column;
        gap: 0.5rem;
      }
      .fc .fc-toolbar-title {
        font-size: 1.2em;
      }
      .fc .fc-button {
        padding: 0.3em 0.5em;
        font-size: 0.9em;
      }
    }
  `;

  if (fetcher.state === "loading") {
    return <div className="text-neon-blue">Loading events...</div>;
  }

  return (
    <div className="calendar-container">
      <style>{mobileStyles}</style>
      <FullCalendar {...calendarOptions} />
      {selectedSlot && (
        <div className="appointment-form">
          <h3>Book Appointment</h3>
          <p>Start: {selectedSlot.start.toLocaleString()}</p>
          <p>End: {selectedSlot.end.toLocaleString()}</p>
          <button onClick={handleBookAppointment}>Book</button>
          <button onClick={() => setSelectedSlot(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
});

export default Calendar;

