import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { ExtendedUser } from "~/types";
import { prisma } from "~/db.server";

// Remove this line as we're importing prisma from db.server
// import { prisma } from "~/db.server";

// Remove this line as we're using the imported prisma
// const prisma = new PrismaClient();

export type UserRole = "user" | "admin" | "team_owner" | "employee" | "contractor";

export async function createUser(email: string, password: string, role: UserRole): Promise<ExtendedUser> {
  console.log("Creating user:", { email, role });
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });
    console.log("User created:", user);
    return user;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error("A user with this email already exists");
      }
    }
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<ExtendedUser | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string): Promise<ExtendedUser | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getEmployeesByTeamOwnerId(teamOwnerId: string) {
  return prisma.user.findMany({
    where: {
      teamOwnerId: teamOwnerId,
      role: "contractor",
    },
    select: {
      id: true,
      email: true,
      // Remove 'name' if it's not a field in your User model
      // name: true,
      // Add any other fields you need
    },
  });
}

export async function updateUserGoogleCalendar(userId: string, googleCalendarId: string): Promise<ExtendedUser> {
  return prisma.user.update({
    where: { id: userId },
    data: { googleCalendarId },
  });
}

// Add more user-related functions as needed