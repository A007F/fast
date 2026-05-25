import { db } from "./db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);

  const session = await db.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return session;
}

export async function getSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          captainProfile: true,
        },
      },
    },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function destroySession(token: string) {
  try {
    await db.session.delete({ where: { token } });
    return true;
  } catch (error) {
    return false;
  }
}

export function getTokenFromHeaders(headers: Headers) {
  const authHeader = headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

export function formatUser(user: any) {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
