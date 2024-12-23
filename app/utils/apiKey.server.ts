import crypto from 'crypto';
import { prisma } from '~/db.server';

export function generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
}

export async function validateApiKey(apiKey: string) {
    const user = await prisma.user.findUnique({
        where: { apiKey },
        select: {
            tier: true,
            usageCount: true,
            activeSubscription: true
        }
    });

    if (!user) {
        throw new Error("Invalid API key");
    }

    if (!user.activeSubscription) {
        throw new Error("Your subscription is no longer active. Please renew your subscription to continue using the scheduler.");
    }

    const usageLimit = user.tier === 'basic' ? 50 : user.tier === 'pro' ? 500 : Infinity;

    if (user.usageCount >= usageLimit) {
        throw new Error(`You have reached the usage limit for your ${user.tier} tier (${usageLimit} bookings). Please upgrade your plan to continue using the scheduler.`);
    }

    return true;
}