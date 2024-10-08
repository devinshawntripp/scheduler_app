import { PrismaClient } from "@prisma/client";
import { sendEmailNotification } from "../utils/email";
import type { ExtendedBooking } from "../types";
import { prisma } from "~/db.server";

const prisma = new PrismaClient();

export async function createBooking(
  teamOwnerId: string,
  contractorId: string,
  customerFirstName: string,
  customerLastName: string,
  address: string,
  city: string,
  state: string,
  description: string,
  startDateTime: Date,
  endDateTime: Date
): Promise<ExtendedBooking> {
  const booking = await prisma.booking.create({
    data: {
      teamOwnerId,
      contractorId,
      customerFirstName,
      customerLastName,
      address,
      city,
      state,
      description,
      startDateTime,
      endDateTime,
    },
  });

  const contractor = await prisma.user.findUnique({ where: { id: contractorId } });
  if (contractor && contractor.email) {
    await sendEmailNotification(contractor.email, booking);
  }

  return booking;
}

export async function getBookingsByTeamOwnerId(teamOwnerId: string): Promise<ExtendedBooking[]> {
  return prisma.booking.findMany({
    where: { teamOwnerId },
    include: { contractor: true },
    orderBy: { startDateTime: 'asc' },
  });
}

export async function getBookingsByContractorId(contractorId: string): Promise<ExtendedBooking[]> {
  return prisma.booking.findMany({
    where: { contractorId },
    orderBy: { startDateTime: 'asc' },
  });
}

// Add more booking-related functions as needed