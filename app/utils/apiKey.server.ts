import crypto from 'crypto';
import { prisma } from '~/db.server';

export function generateApiKey() {
    return crypto.randomBytes(32).toString('hex');
}

export async function validateApiKey(apiKey: string) {
    const user = await prisma.user.findUnique({ where: { apiKey } });
    if (!user) return false;

    const usageLimit = user.tier === 'basic' ? 50 : user.tier === 'pro' ? 500 : Infinity;
    return user.usageCount < usageLimit;
}