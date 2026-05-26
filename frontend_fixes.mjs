import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "frontend/src";

const regexEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function fix(path, replacements) {
	let c = readFileSync(path, "utf8");
	for (const [from, to] of replacements) {
		c = c.replace(new RegExp(regexEscape(from), "g"), to);
	}
	writeFileSync(path, c, "utf8");
	console.log("Fixed:", path);
}

fix(join(BASE, "app/(dashboard)/billing/ses/page.tsx"), [
	[
		'import { format } from "date-fns"',
		'import { formatDate } from "@/_shared/lib/utils/format-date"',
	],
	['import { es } from "date-fns/locale"', ""],
	[
		'format(new Date(ses.createdAt), "dd MMM yyyy", { locale: es })',
		'formatDate(ses.createdAt, "dd MMM yyyy")',
	],
	["suppressHydrationWarning", ""],
]);

fix(join(BASE, "maintenance/ui/MaintenanceTable.tsx"), [
	[
		'import { format } from "date-fns"',
		'import { formatDate } from "@/_shared/lib/utils/format-date"',
	],
	['import { es } from "date-fns/locale"', ""],
	[
		'format(new Date(kit.updatedAt), "dd MMM yyyy", { locale: es })',
		'formatDate(kit.updatedAt, "dd MMM yyyy")',
	],
	["suppressHydrationWarning", ""],
]);

fix(join(BASE, "app/(dashboard)/reports/[id]/page.tsx"), [
	[
		'import { format } from "date-fns"',
		'import { formatDate } from "@/_shared/lib/utils/format-date"',
	],
	['import { es } from "date-fns/locale"', ""],
	[
		'format(new Date(report.createdAt), "dd MMM yyyy HH:mm", { locale: es })',
		'formatDate(report.createdAt, "dd MMM yyyy HH:mm")',
	],
	["suppressHydrationWarning", ""],
]);

fix(join(BASE, "app/(dashboard)/reports/archive/page.tsx"), [["suppressHydrationWarning", ""]]);

fix(join(BASE, "invoices/ui/InvoicesLedgerView.tsx"), [["suppressHydrationWarning", ""]]);

fix(join(BASE, "app/(dashboard)/resources/[id]/page.tsx"), [["suppressHydrationWarning", ""]]);

fix(join(BASE, "app/(dashboard)/admin/users/[id]/page.tsx"), [["suppressHydrationWarning", ""]]);

console.log("All hydration fixes applied!");
