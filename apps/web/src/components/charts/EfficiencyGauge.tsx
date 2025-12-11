'use client';

import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
    loading: () => (
        <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    )
});

interface EfficiencyGaugeProps {
    value?: number; // 0-100
    title?: string;
    subtitle?: string;
}

export default function EfficiencyGauge({
    value = 87,
    title = 'Eficiencia Operativa',
    subtitle = 'Meta: 90%'
}: EfficiencyGaugeProps) {
    const getColor = (val: number) => {
        if (val >= 90) return '#10B981'; // green
        if (val >= 70) return '#3B82F6'; // blue
        if (val >= 50) return '#F59E0B'; // amber
        return '#EF4444'; // red
    };

    const options: ApexOptions = {
        chart: {
            type: 'radialBar',
            fontFamily: 'inherit',
            sparkline: { enabled: true },
        },
        colors: [getColor(value)],
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: {
                    size: '70%',
                },
                track: {
                    background: '#e2e8f0',
                    strokeWidth: '100%',
                    margin: 0,
                },
                dataLabels: {
                    name: {
                        show: true,
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#64748b',
                        offsetY: 70,
                    },
                    value: {
                        show: true,
                        fontSize: '36px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        offsetY: -10,
                        formatter: (val: number) => `${val}%`,
                    },
                },
            },
        },
        stroke: { lineCap: 'round' },
        labels: [subtitle],
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="text-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h3>
            </div>
            <ReactApexChart
                options={options}
                series={[value]}
                type="radialBar"
                height={220}
            />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">156</span>
                    <span className="text-gray-500 dark:text-gray-400">Completadas</span>
                </div>
                <div>
                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">12</span>
                    <span className="text-gray-500 dark:text-gray-400">Retrasadas</span>
                </div>
                <div>
                    <span className="block text-2xl font-bold text-gray-900 dark:text-white">3.5h</span>
                    <span className="text-gray-500 dark:text-gray-400">Tiempo Prom.</span>
                </div>
            </div>
        </div>
    );
}
