/**
 * @file EjecucionCardSkeleton.tsx
 * @description Skeleton loader para EjecucionCard
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export function EjecucionCardSkeleton() {
  return (
    <Card className="p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-1"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="mb-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </Card>
  );
}
