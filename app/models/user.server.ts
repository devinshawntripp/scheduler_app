import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { ExtendedUser } from "~/types";
import { prisma } from "~/db.server";

// Remove this line as we're importing prisma from db.server
// import { prisma } from "~/db.server";

// Remove this line as we're using the imported prisma
// const prisma = new PrismaClient();

export type UserRole = "user" | "admin" | "team_owner" | "employee" | "contractor";

export async function createUser(email: string, password: string, roles: string[]): Promise<ExtendedUser> {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roles: {
          connectOrCreate: roles.map(role => ({
            where: { id: role },
            create: { id: role, name: role }
          }))
        }
      },
      include: { roles: true }
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

export async function getEmailById(id: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user?.email || null;
}

export async function getUserById(id: string): Promise<ExtendedUser | null> {
  return prisma.user.findUnique({ where: { id }, include: { roles: true } });
}

export async function getEmployeesByTeamOwnerId(teamOwnerId: string) {
  return prisma.user.findMany({
    where: {
      teamOwnerId: teamOwnerId,
      roles: {
        some: {
          name: "contractor"
        }
      }
    },
    select: {
      id: true,
      email: true,
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

export async function getTeamMembers(teamOwnerId: string) {
  console.log('Fetching team members for teamOwnerId:', teamOwnerId);
  const members = await prisma.user.findMany({
    where: { teamOwnerId },
    select: { 
      id: true, 
      email: true, 
      roles: {
        select: {
          name: true
        }
      }
    },
  });
  console.log('Found team members:', members);
  return members;
}

export async function addRoleToUser(userId: string, roleName: string) {
  // First, find the role by name
  const role = await prisma.userRole.findFirst({
    where: { name: roleName }
  });
  console.log('Role found:', role);

  if (!role) {
    // Instead of throwing an error, return an object indicating the role doesn't exist
    return { success: false, message: `Role "${roleName}" does not exist. Please create it first.` };
  }

  if (role.name === 'team_owner') {
    // update the user's teamOwnerId to the current teamOwnerId
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`User ${userId} does not exist`);
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { teamOwnerId: userId },
    });
  }

  // Then, add the role to the user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        connect: { id: role.id }
      }
    },
    include: { roles: true }
  });
  console.log('User updated:', updatedUser);

  return { success: true, user: updatedUser };
}

export async function removeRoleFromUser(userId: string, roleName: string) {
  const role = await prisma.userRole.findUnique({ where: { name: roleName } });
  if (!role) {
    throw new Error(`Role ${roleName} does not exist`);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      roles: {
        disconnect: { id: role.id }
      }
    },
    include: { roles: true }
  });
}

export async function getUserRoles(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: true }
  });
  return user?.roles || [];
}

export async function hasRole(userId: string, roleName: string) {
  const roles = await getUserRoles(userId);
  return roles.some(role => role.name === roleName);
}

// Add more user-related functions as needed
//getAllUsers
export async function getAllUsers() {
  return prisma.user.findMany({
    include: { roles: true }
  });
}

//add new role
export async function addNewRole(roleName: string) {
  return prisma.userRole.create({ data: { name: roleName } });
}

//remove role
export async function removeRole(roleName: string) {
  return prisma.userRole.delete({ where: { name: roleName } });
}

export async function getAllRoles() {
  return prisma.userRole.findMany();
}

// Add this function at the end of the file
export async function removeUser(userId: string) {
  return prisma.user.delete({
    where: { id: userId }
  });
}

export async function updateUser(userId: string, data: Partial<User>) {
  return prisma.user.update({
    where: { id: userId },
    data
  });
} 