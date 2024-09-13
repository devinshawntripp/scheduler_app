declare module '@fullcalendar/react' {
  import { Calendar } from '@fullcalendar/core';
  import * as React from 'react';

  interface FullCalendarProps {
    events?: any;
    plugins?: any[];
    initialView?: string;
    headerToolbar?: {
      left: string;
      center: string;
      right: string;
    };
    selectable?: boolean;
    select?: (arg: any) => void;
    eventClick?: (arg: any) => void;
  }

  export default class FullCalendar extends React.Component<FullCalendarProps> {}
}

declare module '@fullcalendar/daygrid' {}
declare module '@fullcalendar/timegrid' {}
declare module '@fullcalendar/interaction' {}