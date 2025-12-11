'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    )
});

interface OrderStatusChartProps {
    data?: {
        completadas: number;
        enProceso: number;
        pendientes: number;
        canceladas: number;
    };
}

const defaultData = {
    completadas: 156,
    enProceso: 42,
    pendientes: 28,
    canceladas: 8,
};

export default function OrderStatusChart({ data = defaultData }: OrderStatusChartProps) {
    const total = data.completadas + data.enProceso + data.pendientes + data.canceladas;

    const options: ApexOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'inherit',
        },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
        labels: ['Completadas', 'En Proceso', 'Pendientes', 'Canceladas'],
        dataLabels: { enabled: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            offsetY: 20,
                            color: '#64748b',
                        },
                        value: {
                            show: true,
                            offsetY: -20,
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: '#1e293b',
                            formatter: (val: string) => val,
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '14px',
                            color: '#64748b',
                            formatter: () => total.toString(),
                        },
                    },
                },
            },
        },
        legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            labels: { colors: '#64748b' },
            markers: { size: 10, shape: 'circle' as const },
            itemMargin: { horizontal: 12, vertical: 8 },
        },
        stroke: { width: 0 },
        tooltip: {
            theme: 'dark',
            y: { formatter: (val: number) => `${val} órdenes (${((val / total) * 100).toFixed(1)}%)` },
        },
        responsive: [
            {
                breakpoint: 480,
                options: {
                    chart: { height: 280 },
                    legend: { position: 'bottom' },
                },
            },
        ],
    };

    const series = [data.completadas, data.enProceso, data.pendientes, data.canceladas];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Estado de Órdenes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Distribución actual por estado
                </p>
            </div>
            <ReactApexChart
                options={options}
                series={series}
                type="donut"
                height={300}
            />
        </div>
    );
}
