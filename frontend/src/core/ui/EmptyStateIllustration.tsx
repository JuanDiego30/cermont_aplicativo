import {
	BarChart3,
	Bell,
	BriefcaseBusiness,
	Building2,
	CalendarRange,
	Camera,
	Car,
	ClipboardCheck,
	ClipboardList,
	CreditCard,
	FileCheck2,
	FileText,
	FolderKanban,
	HandCoins,
	History,
	Inbox,
	type LucideIcon,
	MapPinned,
	PackageOpen,
	ReceiptText,
	Route,
	Search,
	Settings2,
	ShieldCheck,
	ShoppingCart,
	Warehouse,
	Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

export type EmptyStateKind =
	| "work-requests"
	| "site-visits"
	| "proposals"
	| "purchase-orders"
	| "planning"
	| "execution"
	| "evidences"
	| "delivery-records"
	| "ses"
	| "invoices"
	| "payments"
	| "assets"
	| "maintenance"
	| "fleet"
	| "inventory"
	| "service-cases"
	| "notifications"
	| "templates"
	| "costs"
	| "dispatch"
	| "orders"
	| "documents"
	| "resources"
	| "reports"
	| "audit"
	| "settings"
	| "search"
	| "generic";

const ILLUSTRATION_ICONS: Record<EmptyStateKind, LucideIcon> = {
	"work-requests": ClipboardList,
	"site-visits": MapPinned,
	proposals: FileText,
	"purchase-orders": ShoppingCart,
	planning: CalendarRange,
	execution: Wrench,
	evidences: Camera,
	"delivery-records": ClipboardCheck,
	ses: FileCheck2,
	invoices: ReceiptText,
	payments: CreditCard,
	assets: Building2,
	maintenance: Wrench,
	fleet: Car,
	inventory: Warehouse,
	"service-cases": FolderKanban,
	notifications: Bell,
	templates: ClipboardList,
	costs: HandCoins,
	dispatch: Route,
	orders: BriefcaseBusiness,
	documents: FileText,
	resources: PackageOpen,
	reports: BarChart3,
	audit: History,
	settings: Settings2,
	search: Search,
	generic: Inbox,
};

interface EmptyStateIllustrationProps {
	kind: EmptyStateKind;
	customIcon?: ComponentType<{ className?: string }>;
}

export function EmptyStateIllustration({
	kind,
	customIcon: CustomIcon,
}: EmptyStateIllustrationProps) {
	const Icon = CustomIcon ?? ILLUSTRATION_ICONS[kind];

	return (
		<div
			data-testid="empty-state-illustration"
			data-illustration={kind}
			className="relative h-28 w-44 text-[var(--color-brand-blue)]"
			aria-hidden="true"
		>
			<svg viewBox="0 0 176 112" className="absolute inset-0 size-full" focusable="false">
				<title>Ilustración de estado vacío</title>
				<path
					d="M22 91c9-23 28-35 57-35 32 0 51 12 74 35"
					fill="none"
					stroke="currentColor"
					strokeOpacity="0.14"
					strokeWidth="2"
				/>
				<rect
					x="31"
					y="24"
					width="114"
					height="68"
					rx="18"
					fill="currentColor"
					fillOpacity="0.06"
					stroke="currentColor"
					strokeOpacity="0.16"
				/>
				<circle cx="42" cy="19" r="7" fill="var(--color-cermont-green)" fillOpacity="0.24" />
				<circle cx="150" cy="79" r="10" fill="currentColor" fillOpacity="0.1" />
				<path
					d="M20 45h22M134 16h22M18 74h12M147 48h13"
					stroke="currentColor"
					strokeLinecap="round"
					strokeOpacity="0.2"
					strokeWidth="2"
				/>
			</svg>
			<div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] text-[var(--color-brand-blue)] shadow-[var(--shadow-1)]">
				<Icon className="size-8" />
			</div>
			<ShieldCheck className="absolute bottom-1 right-6 size-5 text-[var(--color-cermont-green)]" />
		</div>
	);
}
