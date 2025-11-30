'use client';

/**
 * Activity Timeline Widget
 * Shows recent activity with animated entries
 */

import { motion } from 'framer-motion';
import { LucideIcon, Clock, FileText, Users, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'workplan' | 'alert' | 'maintenance';
  title: string;
  description: string;
  time: string;
  user?: string;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const iconMap: Record<string, { icon: LucideIcon; color: string }> = {
  order: { icon: FileText, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
  user: { icon: Users, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' },
  workplan: { icon: CheckCircle, color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' },
  alert: { icon: AlertCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' },
  maintenance: { icon: Wrench, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' },
};

export function ActivityTimeline({ activities, maxItems = 5 }: ActivityTimelineProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Actividad Reciente
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          <span>Últimas actualizaciones</span>
        </div>
      </div>

      <div className="space-y-4">
        {displayedActivities.map((activity, index) => {
          const { icon: Icon, color } = iconMap[activity.type] || iconMap.order;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex gap-4"
            >
              {/* Timeline Line */}
              <div className="relative flex flex-col items-center">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
                {index < displayedActivities.length - 1 && (
                  <div className="mt-2 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </h4>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                    {activity.time}
                  </span>
                </div>
                {activity.user && (
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                    por {activity.user}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {activities.length > maxItems && (
        <button className="mt-4 w-full rounded-lg border border-gray-200 py-2 text-center text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
          Ver todas ({activities.length})
        </button>
      )}
    </div>
  );
}

export default ActivityTimeline;
