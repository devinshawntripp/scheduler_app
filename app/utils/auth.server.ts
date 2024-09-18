import { createCookieSessionStorage, redirect } from "@remix-run/node";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getUserByEmail, createUser as createUserInDB, getUserById, getUserRoles } from "~/models/user.server";
import type { UserRole } from "../models/user.server";
import { getSession } from "~/utils/session.server"; // Update this import path

type LoginForm = {
  email: string;
  password: string;
};

export async function login({email, password} : LoginForm) {
  const user = await getUserByEmail(email);
  console.log("found User:", user);
  if (!user || !await bcrypt.compare(password, user.password)) {
    return null;
  }
  return user;
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUser(email: string, password: string, roles: string[]) {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return null;
  }

  const user = await createUserInDB(email, password, roles);
  if (!user) {
    return null;
  }

  return { id: user.id, email };
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getUserId(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function requireUserId(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    throw new Response("Unauthorized", { status: 401 });
  }
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await getUserById(userId);
    return user;
  } catch {
    throw await logout(request);
  }
}

export async function logout(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function requireRole(request: Request, ...roles: string[]) {
  const userId = await requireUserId(request);
  const userRoles = await getUserRoles(userId);
  
  const hasRequiredRole = roles.some(role => userRoles.some(userRole => userRole.name === role));
  
  if (!hasRequiredRole) {
    throw new Response("Unauthorized", { status: 403 });
  }
  
  return userId;
}