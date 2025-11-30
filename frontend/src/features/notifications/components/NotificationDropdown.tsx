/**
 * Componente NotificationDropdown
 * 
 * Dropdown con lista de notificaciones y badge contador
 * 
 * @file frontend/src/features/notifications/components/NotificationDropdown.tsx
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications, useNotificationActions } from '../hooks/useNotifications';
import type { Notification, NotificationType } from '../api/notifications-service';

// ==========================================
// Icons
// ==========================================

const BellIcon = ({ className = '' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CheckAllIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </svg>
);

// ==========================================
// Config
// ==========================================

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, { icon: string; color: string }> = {
  ORDER_ASSIGNED: { icon: '📋', color: 'bg-blue-100 text-blue-600' },
  ORDER_STATE_CHANGED: { icon: '🔄', color: 'bg-purple-100 text-purple-600' },
  WORKPLAN_APPROVED: { icon: '✅', color: 'bg-green-100 text-green-600' },
  WORKPLAN_REJECTED: { icon: '❌', color: 'bg-red-100 text-red-600' },
  EVIDENCE_APPROVED: { icon: '📸', color: 'bg-emerald-100 text-emerald-600' },
  EVIDENCE_REJECTED: { icon: '🚫', color: 'bg-orange-100 text-orange-600' },
  DEADLINE_APPROACHING: { icon: '⏰', color: 'bg-yellow-100 text-yellow-600' },
  GENERAL: { icon: '📢', color: 'bg-gray-100 text-gray-600' },
};

const PRIORITY_STYLES = {
  LOW: 'border-l-gray-300',
  MEDIUM: 'border-l-yellow-400',
  HIGH: 'border-l-red-500',
};

// ==========================================
// Helpers
// ==========================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins}m`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function getNotificationLink(notification: Notification): string | null {
  if (notification.context?.orderId) {
    return `/orders/${notification.context.orderId}`;
  }
  if (notification.context?.workPlanId) {
    return `/workplans/${notification.context.workPlanId}`;
  }
  return null;
}

// ==========================================
// Subcomponents
// ==========================================

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type] || NOTIFICATION_TYPE_CONFIG.GENERAL;
  const priorityStyle = PRIORITY_STYLES[notification.priority || 'LOW'];
  const link = getNotificationLink(notification);

  const content = (
    <div
      className={`
        relative p-3 border-l-4 ${priorityStyle}
        ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}
        hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
          <span className="text-lg">{config.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.read && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAsRead(notification.id);
            }}
            className="p-1 text-gray-400 hover:text-brand-500 transition-colors"
            title="Marcar como leída"
          >
            <CheckIcon />
          </button>
        )}
      </div>
      {!notification.read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-brand-500 rounded-full" />
      )}
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

// ==========================================
// Main Component
// ==========================================

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data, isLoading } = useNotifications();
  const { markAsRead, markAllAsRead, isMarkingAllAsRead } = useNotificationActions();

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Notificaciones"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
                className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 disabled:opacity-50"
              >
                <CheckAllIcon />
                Marcar todas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <BellIcon className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tienes notificaciones
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <Link
                href="/notifications"
                className="text-xs text-center block text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                onClick={() => setIsOpen(false)}
              >
                Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
