import type { ExtendedBooking } from "~/types";
import nodemailer from 'nodemailer';
import { formatInTimeZone } from 'date-fns-tz';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  secure: false,
  ignoreTLS: true,
});

export async function sendEmailNotification(email: string, booking: ExtendedBooking): Promise<void> {
  const formatDate = (date: Date) => {
    return formatInTimeZone(date, 'America/Chicago', 'MMM d, yyyy h:mm a zzz');
  };

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@scheduler.com',
    to: email,
    subject: 'New Booking Notification',
    text: `You have a new booking:
    Customer: ${booking.customerFirstName} ${booking.customerLastName}
    Address: ${booking.address}, ${booking.city}, ${booking.state}
    Start Date/Time: ${formatDate(new Date(booking.startDateTime))}
    End Date/Time: ${formatDate(new Date(booking.endDateTime))}
    Description: ${booking.description}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}