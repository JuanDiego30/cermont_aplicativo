'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

// Dynamic import para evitar SSR issues con ApexCharts
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    )
});

interface MonthlyOrdersChartProps {
    data?: {
        months: string[];
        completadas: number[];
        pendientes: number[];
        enProceso: number[];
    };
}

// Mock data - En producción vendría del API
const defaultData = {
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    completadas: [45, 52, 38, 61, 55, 67, 70, 65, 58, 72, 68, 75],
    pendientes: [12, 8, 15, 10, 7, 5, 8, 12, 10, 6, 9, 4],
    enProceso: [18, 22, 25, 20, 15, 18, 12, 16, 22, 18, 15, 20],
};

export default function MonthlyOrdersChart({ data = defaultData }: MonthlyOrdersChartProps) {
    const options: ApexOptions = {
        chart: {
            type: 'area',
            height: 320,
            fontFamily: 'inherit',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        colors: ['#10B981', '#F59E0B', '#3B82F6'],
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100],
            },
        },
        xaxis: {
            categories: data.months,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px',
                },
            },
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            labels: { colors: '#64748b' },
            markers: { size: 8, shape: 'circle' as const },
        },
        tooltip: {
            theme: 'dark',
            y: { formatter: (val: number) => `${val} órdenes` },
        },
    };

    const series = [
        { name: 'Completadas', data: data.completadas },
        { name: 'Pendientes', data: data.pendientes },
        { name: 'En Proceso', data: data.enProceso },
    ];

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Órdenes por Mes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tendencia anual de órdenes de trabajo
                </p>
            </div>
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={320}
            />
        </div>
    );
}
