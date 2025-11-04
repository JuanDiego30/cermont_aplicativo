import api from '@/lib/api/client';
export async function getKPIs() {
    try {
        const { data } = await api.get('/system/metrics');
        const open = data?.orders?.open ?? data?.open ?? 0;
        const inProgress = data?.orders?.inProgress ?? data?.inProgress ?? 0;
        const closed = data?.orders?.closed ?? data?.closed ?? 0;
        const last7 = data?.orders?.last7 ?? data?.last7 ?? 0;
        return { open, inProgress, closed, last7 };
    }
    catch {
        const { data } = await api.get('/stats/kpis');
        return data;
    }
}
//# sourceMappingURL=dashboard.service.js.map