/**
 * 📁 app/(auth)/register/loading.tsx
 *
 * ✨ Loading state para la página de registro
 */

export default function RegisterLoading() {
  return (
    <div className="animate-pulse space-y-5">
      {/* Title skeleton */}
      <div className="mb-5 sm:mb-8">
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-5">
        {/* Name field */}
        <div>
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Email field */}
        <div>
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Phone field */}
        <div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Password field */}
        <div>
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Confirm Password field */}
        <div>
          <div className="h-4 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>

        {/* Terms checkbox */}
        <div className="flex gap-3">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
          <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>

        {/* Button */}
        <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}
