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
			className="flex items-center justify-center"
			aria-hidden="true"
		>
			<div className="flex size-16 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue shadow-sm">
				<Icon className="size-8" />
			</div>
		</div>
	);
}
