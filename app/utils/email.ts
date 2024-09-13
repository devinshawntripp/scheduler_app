import type { ExtendedBooking } from "~/types";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendEmailNotification(email: string, booking: ExtendedBooking): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@scheduler.com',
    to: email,
    subject: 'New Booking Notification',
    text: `You have a new booking:
    Customer: ${booking.customerFirstName} ${booking.customerLastName}
    Address: ${booking.address}, ${booking.city}, ${booking.state}
    Date/Time: ${booking.dateTime}
    Description: ${booking.description}`,
  };

  await transporter.sendMail(mailOptions);
}