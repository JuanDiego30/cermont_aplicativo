'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { Plus, X } from 'lucide-react';

interface CalendarEvent extends EventInput {
    extendedProps: {
        orderId?: string;
        status: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
        client?: string;
        technician?: string;
    };
}

interface CalendarProps {
    events?: CalendarEvent[];
    onEventClick?: (eventId: string) => void;
    onDateSelect?: (start: Date, end: Date) => void;
}

// TODO: Estos eventos vendrán del API - GET /api/ordenes con fechas
const mockEvents: CalendarEvent[] = [
    {
        id: '1',
        title: 'Mant. Preventivo #1234',
        start: new Date().toISOString().split('T')[0],
        extendedProps: { orderId: '1234', status: 'en_proceso', client: 'Sierracol Energy', technician: 'Carlos R.' },
    },
    {
        id: '2',
        title: 'Instalación Eléctrica #1235',
        start: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        extendedProps: { orderId: '1235', status: 'pendiente', client: 'Ecopetrol', technician: 'María G.' },
    },
    {
        id: '3',
        title: 'Revisión Torres #1236',
        start: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        end: new Date(Date.now() + 259200000).toISOString().split('T')[0],
        extendedProps: { orderId: '1236', status: 'pendiente', client: 'Sierracol Energy', technician: 'Juan M.' },
    },
    {
        id: '4',
        title: 'Mant. Correctivo #1230',
        start: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        extendedProps: { orderId: '1230', status: 'completada', client: 'Sierracol Energy', technician: 'Ana L.' },
    },
];

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    pendiente: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-800' },
    en_proceso: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' },
    completada: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' },
    cancelada: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' },
};

export default function Calendar({ events = mockEvents, onEventClick, onDateSelect }: CalendarProps) {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const calendarRef = useRef<FullCalendar>(null);

    const handleEventClick = (clickInfo: EventClickArg) => {
        const evt = clickInfo.event;
        setSelectedEvent({
            id: evt.id,
            title: evt.title,
            start: evt.start?.toISOString(),
            end: evt.end?.toISOString(),
            extendedProps: evt.extendedProps as CalendarEvent['extendedProps'],
        });
        setShowEventModal(true);
        if (onEventClick) onEventClick(evt.id);
    };

    const handleDateSelect = (selectInfo: DateSelectArg) => {
        if (onDateSelect) {
            onDateSelect(selectInfo.start, selectInfo.end);
        }
    };

    const getEventColor = (status: string) => {
        switch (status) {
            case 'pendiente': return '#f59e0b';
            case 'en_proceso': return '#3b82f6';
            case 'completada': return '#10b981';
            case 'cancelada': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
            {/* Calendar Styles */}
            <style jsx global>{`
        .fc {
          --fc-border-color: rgb(229, 231, 235);
          --fc-button-bg-color: rgb(59, 130, 246);
          --fc-button-border-color: rgb(59, 130, 246);
          --fc-button-hover-bg-color: rgb(37, 99, 235);
          --fc-button-active-bg-color: rgb(29, 78, 216);
          --fc-today-bg-color: rgba(59, 130, 246, 0.1);
          font-family: inherit;
        }
        .dark .fc {
          --fc-border-color: rgb(55, 65, 81);
          --fc-page-bg-color: rgb(17, 24, 39);
          --fc-neutral-bg-color: rgb(31, 41, 55);
          --fc-today-bg-color: rgba(59, 130, 246, 0.15);
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .fc .fc-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.5rem;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active {
          background-color: var(--fc-button-active-bg-color);
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border-color: var(--fc-border-color);
        }
        .fc .fc-daygrid-day-number {
          padding: 0.5rem;
          font-size: 0.875rem;
        }
        .fc-event {
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        @media (max-width: 640px) {
          .fc .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }
          .fc .fc-toolbar-title {
            font-size: 1rem;
          }
          .fc .fc-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
          }
        }
      `}</style>

            <div className="p-4 sm:p-6">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale="es"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    buttonText={{
                        today: 'Hoy',
                        month: 'Mes',
                        week: 'Semana',
                        day: 'Día',
                    }}
                    events={events.map(evt => ({
                        ...evt,
                        backgroundColor: getEventColor(evt.extendedProps.status),
                        borderColor: getEventColor(evt.extendedProps.status),
                    }))}
                    selectable={true}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    height="auto"
                    aspectRatio={1.8}
                    dayMaxEvents={3}
                    moreLinkText={(num) => `+${num} más`}
                />
            </div>

            {/* Event Detail Modal */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Detalle de Orden
                            </h3>
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="px-6 py-4 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Orden</p>
                                <p className="font-medium text-gray-900 dark:text-white">{selectedEvent.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Cliente</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedEvent.extendedProps.client || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Técnico</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedEvent.extendedProps.technician || 'Sin asignar'}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedEvent.extendedProps.status]?.bg} ${statusColors[selectedEvent.extendedProps.status]?.text}`}>
                                    {selectedEvent.extendedProps.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                            <a
                                href={`/dashboard/ordenes/${selectedEvent.extendedProps.orderId}`}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                Ver Orden
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
