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

        await prisma.$executeRaw`
            INSERT INTO "SystemSetting" ("id", "value")
            VALUES
                ('openrouterRequestsDate', ${today}),
                ('openrouterRequestsToday', '1')
            ON CONFLICT ("id") DO UPDATE SET
                "value" = CASE
                    WHEN EXCLUDED."id" = 'openrouterRequestsToday' THEN
                        CASE
                            WHEN (SELECT "value" FROM "SystemSetting" WHERE "id" = 'openrouterRequestsDate') = ${today}
                                THEN CAST(CAST("SystemSetting"."value" AS INTEGER) + 1 AS TEXT)
                            ELSE '1'
                        END
                    WHEN EXCLUDED."id" = 'openrouterRequestsDate' THEN ${today}
                    ELSE "SystemSetting"."value"
                END;
        `;
    } catch (err: any) {
        console.error('[incrementOpenrouterCounter] Error:', err.message);
    }
};
