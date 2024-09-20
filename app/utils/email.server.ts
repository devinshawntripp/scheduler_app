import nodemailer from "nodemailer";
import { prisma } from "~/db.server"; // Add this import

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  secure: process.env.SMTP_SECURE === "true", // Use TLS
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates
  }
});

export async function sendEventNotification(to: string, eventDetails: any) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "scheduler@example.com",
    to,
    subject: "New Event Assigned",
    text: `You have been assigned to a new event: ${JSON.stringify(eventDetails)}`,
    html: `<p>You have been assigned to a new event:</p><pre>${JSON.stringify(eventDetails, null, 2)}</pre>`,
  });
}

export async function sendInvitationEmail(email: string, invitationIdOrUserId: string) {
  const isExistingUser = await prisma.user.findUnique({ where: { id: invitationIdOrUserId } });
  
  const invitationUrl = isExistingUser
    ? `${process.env.APP_URL}/accept-invitation/${invitationIdOrUserId}`
    : `${process.env.APP_URL}/register?invitation=${invitationIdOrUserId}`;

  const emailSubject = isExistingUser
    ? 'Invitation to join a team'
    : 'Invitation to join as a contractor';

  const emailBody = isExistingUser
    ? `<p>You've been invited to join a team. Click the link below to accept:</p>`
    : `<p>You've been invited to join as a contractor. Click the link below to create your account and accept the invitation:</p>`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "scheduler@example.com",
      to: email,
      subject: emailSubject,
      html: `
        ${emailBody}
        <a href="${invitationUrl}">${invitationUrl}</a>
      `,
    });
    console.log(`Invitation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}