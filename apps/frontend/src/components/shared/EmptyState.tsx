export default function EmptyState({ title, hint }:{title:string;hint?:string}) {
  return <div className="rounded-md border bg-white/90 p-6 text-center">
    <p className="text-sm font-semibold">{title}</p>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>;
}