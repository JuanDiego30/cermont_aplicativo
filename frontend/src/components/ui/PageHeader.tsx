import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: LucideIcon;
  iconBg?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  iconBg = "bg-brand-blue/10 text-brand-blue",
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("flex size-11 items-center justify-center rounded-full", iconBg)}>
            <Icon className="size-5" aria-hidden="true" />
          </div>
        )}
        <div>
          <h1 className="text-h1 font-bold text-ink">{title}</h1>
          {description && (
            <p className="mt-0.5 text-body-sm text-charcoal">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}

export const PAGE_HEADER_CONFIG = {
  "service-cases":    { icon: "Kanban",      iconBg: "bg-brand-blue/10 text-brand-blue" },
  "work-requests":    { icon: "FileText",    iconBg: "bg-brand-blue/10 text-brand-blue" },
  "site-visits":      { icon: "MapPin",      iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "proposals":        { icon: "FileSpreadsheet", iconBg: "bg-brand-blue/10 text-brand-blue" },
  "purchase-orders":  { icon: "ShoppingCart",iconBg: "bg-brand-blue/10 text-brand-blue" },
  "orders":           { icon: "ClipboardList",iconBg: "bg-brand-blue/10 text-brand-blue" },
  "planning":         { icon: "CalendarCheck",iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "execution":        { icon: "PlayCircle",  iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "evidences":        { icon: "Camera",      iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "dispatch":         { icon: "Truck",       iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "maintenance":      { icon: "Wrench",      iconBg: "bg-brand-warn/10 text-brand-warn" },
  "sla":              { icon: "Timer",       iconBg: "bg-brand-warn/10 text-brand-warn" },
  "reports":          { icon: "FileBarChart",iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "delivery-records": { icon: "FileSignature",iconBg: "bg-brand-warn/10 text-brand-warn" },
  "billing":          { icon: "Receipt",     iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "billing-ses":      { icon: "FileCheck",   iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "billing-invoices": { icon: "DollarSign",  iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "payments":         { icon: "CreditCard",  iconBg: "bg-brand-annotate/10 text-brand-annotate" },
  "costs":            { icon: "TrendingDown",iconBg: "bg-brand-warn/10 text-brand-warn" },
  "documents":        { icon: "FolderOpen",  iconBg: "bg-brand-blue/10 text-brand-blue" },
  "templates":        { icon: "FileJson",    iconBg: "bg-brand-blue/10 text-brand-blue" },
  "resources":        { icon: "Package",     iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "inventory":        { icon: "PackageSearch",iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "fleet":            { icon: "Truck",       iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "assets":           { icon: "Building2",   iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "customers":        { icon: "Users",       iconBg: "bg-brand-blue/10 text-brand-blue" },
  "admin-users":      { icon: "UserCog",     iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "admin-settings":   { icon: "Settings",    iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
  "admin-audit":      { icon: "ScrollText",  iconBg: "bg-brand-blue-deep/10 text-brand-blue-deep" },
} as const;
