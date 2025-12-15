'use client';

import dynamic from 'next/dynamic';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with FullCalendar
const Calendar = dynamic(
    () => import('@/components/calendar/Calendar'),
    {
        ssr: false,
        loading: () => (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 flex items-center justify-center min-h-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }
);

export default function CalendarioPage() {
    const handleEventClick = (eventId: string) => {
        console.log('Event clicked:', eventId);
        // Navigate to order detail page
        window.location.href = `/dashboard/ordenes/${eventId}`;
    };

    const handleDateSelect = (start: Date, end: Date) => {
        console.log('Date selected:', start, end);
        // Navigate to create order page with pre-selected dates
        const startDate = start.toISOString().split('T')[0];
        const endDate = end.toISOString().split('T')[0];
        window.location.href = `/dashboard/ordenes/nueva?start=${startDate}&end=${endDate}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            📅 Calendario de Órdenes
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Visualiza y gestiona las órdenes de trabajo programadas
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/ordenes/nueva"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        Nueva Orden
                    </Link>
                </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">En Proceso</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Completada</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="text-gray-600 dark:text-gray-400">Cancelada</span>
                </div>
            </div>

            {/* Calendar */}
            <Calendar
                onEventClick={handleEventClick}
                onDateSelect={handleDateSelect}
            />
        </div>
    );
}
