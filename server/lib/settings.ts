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
        const [dateSetting, countSetting] = await Promise.all([
            prisma.systemSetting.findUnique({ where: { id: 'openrouterRequestsDate' } }),
            prisma.systemSetting.findUnique({ where: { id: 'openrouterRequestsToday' } }),
        ]);

        const storedDate = dateSetting?.value ?? '';
        const storedCount = parseInt(countSetting?.value ?? '0') || 0;
        const newCount = storedDate === today ? storedCount + 1 : 1;

        await Promise.all([
            prisma.systemSetting.upsert({
                where: { id: 'openrouterRequestsToday' },
                update: { value: String(newCount) },
                create: { id: 'openrouterRequestsToday', value: String(newCount) }
            }),
            prisma.systemSetting.upsert({
                where: { id: 'openrouterRequestsDate' },
                update: { value: today },
                create: { id: 'openrouterRequestsDate', value: today }
            }),
        ]);
    } catch (err: any) {
        console.error('[incrementOpenrouterCounter] Error:', err.message);
    }
};
