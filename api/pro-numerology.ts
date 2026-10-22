import type { VercelRequest, VercelResponse } from '@vercel/node';

// Numerology reduction rules
function reduceNumber(n: number): number {
    if (n === 11 || n === 22 || n === 33 || n === 44) return n;
    let sum = 0;
    while (n > 0 || sum > 9) {
        if (n === 0) {
            n = sum;
            sum = 0;
            if (n === 11 || n === 22 || n === 33 || n === 44) return n;
        }
        sum += n % 10;
        n = Math.floor(n / 10);
    }
    return sum;
}

function reduceCycle(n: number): number {
    while (n > 9) {
        let sum = 0;
        while (n > 0) {
            sum += n % 10;
            n = Math.floor(n / 10);
        }
        n = sum;
    }
    return n;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { month, day, year, isProUser } = req.body || {};

    if (!month || !day || !year) {
        return res.status(400).json({ error: 'Month, Day, and Year are required' });
    }

    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);

    if (isNaN(m) || isNaN(d) || isNaN(y)) {
        return res.status(400).json({ error: 'Invalid date values' });
    }

    // Protected / Pro features: Pinnacles, Challenges, Deep cycles
    if (!isProUser) {
        return res.status(403).json({
            error: 'PRO_REQUIRED',
            message: 'Pro access required to unlock Pinnacles, Compatibility & Advanced cycles on the server.',
            locked: true
        });
    }

    // Server-computed Pro calculations
    const pinnacle1 = reduceCycle(m + d);
    const pinnacle2 = reduceCycle(d + y);
    const pinnacle3 = reduceCycle(pinnacle1 + pinnacle2);
    const pinnacle4 = reduceCycle(m + y);

    const challenge1 = Math.abs(reduceCycle(m) - reduceCycle(d));
    const challenge2 = Math.abs(reduceCycle(d) - reduceCycle(y));
    const challenge3 = Math.abs(challenge1 - challenge2);
    const challenge4 = Math.abs(reduceCycle(m) - reduceCycle(y));

    return res.status(200).json({
        success: true,
        pinnacles: {
            first: pinnacle1,
            second: pinnacle2,
            third: pinnacle3,
            fourth: pinnacle4,
            currentVibration: pinnacle1
        },
        challenges: {
            first: challenge1,
            second: challenge2,
            third: challenge3,
            fourth: challenge4
        }
    });
}
