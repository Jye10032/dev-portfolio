const UMAMI_GATEWAY = 'https://gateway-us.umami.is/api';
const CACHE_TTL_MS = 5 * 60 * 1000;

type UmamiShare = {
    token: string;
    websiteId: string;
    parameters?: { overview?: boolean };
};

type UmamiStats = {
    pageviews: number;
    visitors: number;
    visits: number;
};

export type VisitorStats = {
    today: UmamiStats;
    total: UmamiStats;
    updatedAt: string;
};

type VisitorStatsOptions = {
    websiteId: string;
    shareId: string;
    now?: Date;
    fetchImpl?: typeof fetch;
};

let cachedStats: { key: string; expiresAt: number; value: VisitorStats } | null = null;

function startOfShanghaiDay(date: Date): number {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), -8);
}

async function readJson<T>(response: Response): Promise<T> {
    if (!response.ok) throw new Error(`Umami request failed with ${response.status}`);
    return response.json() as Promise<T>;
}

export async function fetchVisitorStats({ websiteId, shareId, now = new Date(), fetchImpl = fetch }: VisitorStatsOptions): Promise<VisitorStats> {
    const share = await readJson<UmamiShare>(await fetchImpl(`${UMAMI_GATEWAY}/share/${shareId}`));

    if (share.websiteId !== websiteId || !share.token || share.parameters?.overview === false) {
        throw new Error('Umami share does not allow website overview access');
    }

    const headers = {
        'x-umami-share-token': share.token,
        'x-umami-share-context': '1'
    };
    const endAt = now.getTime();
    const statsUrl = (startAt: number) => {
        const params = new URLSearchParams({ startAt: String(startAt), endAt: String(endAt) });
        return `${UMAMI_GATEWAY}/websites/${websiteId}/stats?${params}`;
    };
    const [today, total] = await Promise.all([
        fetchImpl(statsUrl(startOfShanghaiDay(now)), { headers }).then(readJson<UmamiStats>),
        fetchImpl(statsUrl(0), { headers }).then(readJson<UmamiStats>)
    ]);

    return { today, total, updatedAt: now.toISOString() };
}

export async function getVisitorStats(options: VisitorStatsOptions): Promise<VisitorStats> {
    const now = options.now ?? new Date();
    const key = `${options.websiteId}:${options.shareId}`;

    if (cachedStats?.key === key && cachedStats.expiresAt > now.getTime()) return cachedStats.value;

    const value = await fetchVisitorStats({ ...options, now });
    cachedStats = { key, expiresAt: now.getTime() + CACHE_TTL_MS, value };
    return value;
}
