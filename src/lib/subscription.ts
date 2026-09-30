import { prisma } from "@/lib/prisma";

export async function checkTrialStatus(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      createdAt: true,
    },
  });

  if (!tenant) return { isExpired: true, daysLeft: 0, isPaid: false };

  // 30 Din ka Free Trial calculation
  const createdTime = new Date(tenant.createdAt).getTime();
  const trialDurationMs = 30 * 24 * 60 * 60 * 1000; // 30 Days in Milliseconds
  const expiryTime = createdTime + trialDurationMs;
  const now = Date.now();

  const diffMs = expiryTime - now;
  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  return {
    isExpired: now > expiryTime,
    daysLeft,
    isPaid: false,
  };
}