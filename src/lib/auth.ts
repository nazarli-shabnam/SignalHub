import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function getOrCreateCurrentUser() {
  const { userId, ...rest } = await auth();
  if (!userId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: (rest.sessionClaims?.email as string) ?? undefined,
        name: (rest.sessionClaims?.name as string) ?? undefined,
      },
    });
  }
  return user;
}

export async function getCurrentClerkUserId() {
  const { userId } = await auth();
  return userId;
}
