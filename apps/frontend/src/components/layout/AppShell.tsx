'use client';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
return (
<div className="relative min-h-screen">
<Header />
<div className="mx-auto flex max-w-7xl gap-4 px-4 py-4">
<Sidebar />
<main className="min-h-[calc(100vh-5rem)] flex-1 rounded-lg bg-white/90 p-4 shadow-md">
{children}
</main>
</div>
</div>
);
}