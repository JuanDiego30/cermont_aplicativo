import Link from "next/link";
import { Button } from "@/core/ui/Button";
import {
	RESOURCE_TYPE_LABELS,
	STATUS_DISPLAY,
	STATUS_STYLES,
	UNIT_LABELS,
} from "./resource-constants";

interface ResourceTableRowProps {
	resource: {
		_id?: string;
		name?: string;
		type?: string;
		unit?: string;
		totalInstances?: number;
		availableInstances?: number;
		primaryStatus?: string;
	};
}

export function ResourceTableRow({ resource }: ResourceTableRowProps) {
	const name = resource.name ?? "";
	const type = resource.type ?? "";
	const unit = resource.unit ?? "";
	const totalInstances = resource.totalInstances ?? 0;
	const availableInstances = resource.availableInstances ?? 0;
	const primaryStatus = resource.primaryStatus ?? "";
	const _id = resource._id ?? "";

	return (
		<tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
			<th scope="row" className="px-4 py-3 text-left font-medium text-slate-900 dark:text-white">
				{name}
			</th>
			<td className="px-4 py-3 text-slate-700 dark:text-slate-300">
				{RESOURCE_TYPE_LABELS[type] ?? type}
			</td>
			<td className="px-4 py-3 text-slate-700 dark:text-slate-300">{UNIT_LABELS[unit] ?? unit}</td>
			<td className="px-4 py-3 text-slate-700 dark:text-slate-300">{totalInstances}</td>
			<td className="px-4 py-3 font-medium text-green-700 dark:text-green-400">
				{availableInstances}
			</td>
			<td className="px-4 py-3">
				<span
					className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[primaryStatus] ?? "bg-slate-50 text-slate-700 ring-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"}`}
				>
					{STATUS_DISPLAY[primaryStatus] ?? primaryStatus.replaceAll("_", " ")}
				</span>
			</td>
			<td className="px-4 py-3">
				<Button asChild variant="outline" size="sm">
					<Link href={`/resources/${_id}`}>Ver detalle</Link>
				</Button>
			</td>
		</tr>
	);
}
