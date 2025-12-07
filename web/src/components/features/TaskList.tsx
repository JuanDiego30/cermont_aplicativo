'use client';

import type { WorkPlanTask } from '@/types/workplan';

interface TaskListProps {
  tasks: WorkPlanTask[];
  onToggle?: (taskId: string, completed: boolean) => void;
  readOnly?: boolean;
}

export function TaskList({ tasks, onToggle, readOnly = false }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => a.orden - b.orden);
  const completedCount = tasks.filter((t) => t.completadoAt).length;

  const isCompleted = (task: WorkPlanTask) => !!task.completadoAt;

  return (
    <div className="space-y-3">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
        <span className="text-sm text-gray-500">
          {completedCount}/{tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedTasks.map((task) => (
          <li
            key={task.id}
            className="flex items-start gap-3 py-3"
          >
            {!readOnly ? (
              <input
                type="checkbox"
                checked={isCompleted(task)}
                onChange={(e) => onToggle?.(task.id, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            ) : (
              <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                isCompleted(task)
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300'
              }`}>
                {isCompleted(task) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
            <div className="flex-1">
              <p className={`font-medium ${isCompleted(task) ? 'line-through text-gray-400' : ''}`}>
                {task.titulo}
              </p>
              {task.descripcion && (
                <p className="text-sm text-gray-500">{task.descripcion}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="text-center py-6 text-gray-500">
          No hay tareas definidas
        </p>
      )}
    </div>
  );
}
