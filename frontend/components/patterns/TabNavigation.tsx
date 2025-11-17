// components/patterns/TabNavigation.tsx
import { LucideIcon } from 'lucide-react';

type Tab = {
  key: string;
  label: string;
  icon: LucideIcon;
};

type TabNavigationProps = {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
};

export function TabNavigation({ tabs, activeTab, onChange }: TabNavigationProps) {
  return (
    <div className="rounded-3xl border-2 border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
      <div className="p-2">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-4 font-bold transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
