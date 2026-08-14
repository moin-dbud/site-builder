/**
 * server/lib/settings.ts
 *
 * Shared helper for reading SystemSetting values from the database.
 * Used by generation controllers so they pick up admin-configured values
 * instead of hardcoded literals.
 *
 * Default values are used if a setting has never been seeded/updated.
 */
import prisma from './prisma.js';

export const SETTING_DEFAULTS: Record<string, string> = {
    creditsPerGeneration: '5',
    creditsPerRevision:   '5',
    freeSignupCredits:    '20',
    activeModel:          'cohere/north-mini-code:free',
    maintenanceMode:      'false',
    cashfreeFrozen:       'false',
    openrouterDailyCap:   '200',
    openrouterRequestsToday: '0',
    openrouterRequestsDate:  '',
    emailVerificationRequired: 'true',
};

export const getSetting = async (key: string): Promise<string> => {
    const s = await prisma.systemSetting.findUnique({ where: { id: key } });
    return s?.value ?? SETTING_DEFAULTS[key] ?? '';
};

export const getSettingInt = async (key: string): Promise<number> => {
    const val = await getSetting(key);
    return parseInt(val) || 0;
};

/**
 * Increment the daily OpenRouter request counter.
 * Resets if the date has changed (new day).
 */
export const incrementOpenrouterCounter = async (): Promise<void> => {
    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const dateSetting = await prisma.systemSetting.findUnique({
            where: { id: 'openrouterRequestsDate' }
        });

        const isSameDay = dateSetting?.value === today;

        if (!isSameDay) {
            await prisma.$transaction([
                prisma.systemSetting.upsert({
                    where: { id: 'openrouterRequestsDate' },
                    create: { id: 'openrouterRequestsDate', value: today },
                    update: { value: today }
                }),
                prisma.systemSetting.upsert({
                    where: { id: 'openrouterRequestsToday' },
                    create: { id: 'openrouterRequestsToday', value: '1' },
                    update: { value: '1' }
                })
            ]);
        } else {
            const currentSetting = await prisma.systemSetting.findUnique({
                where: { id: 'openrouterRequestsToday' }
            });
            const currentCount = parseInt(currentSetting?.value || '0', 10) || 0;
            await prisma.systemSetting.upsert({
                where: { id: 'openrouterRequestsToday' },
                create: { id: 'openrouterRequestsToday', value: '1' },
                update: { value: (currentCount + 1).toString() }
            });
        }
    } catch (err: any) {
        console.error('[incrementOpenrouterCounter] Error:', err.message);
    }
};
