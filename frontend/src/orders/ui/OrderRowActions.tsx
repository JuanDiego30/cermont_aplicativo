"use client";

import type { Order } from "@cermont/shared-types";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Copy, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useDeleteOrder } from "@/orders/queries";

interface OrderRowActionsProps {
	order: Order;
	onView: (orderId: string) => void;
}

export function OrderRowActions({ order, onView }: OrderRowActionsProps) {
	const deleteOrder = useDeleteOrder();

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					type="button"
					className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] transition hover:bg-[var(--color-info-bg)] hover:text-[var(--color-brand-blue)]"
					aria-label={`Acciones de la orden ${order.code}`}
				>
					<MoreHorizontal className="h-4 w-4" aria-hidden="true" />
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					sideOffset={5}
					className="z-50 min-w-[176px] overflow-hidden rounded-lg border border-[var(--border-default)] bg-[var(--surface-primary)] p-1 shadow-[var(--shadow-2)]"
				>
					<DropdownMenu.Item
						className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-[var(--text-primary)] outline-none hover:bg-[var(--surface-secondary)] focus:bg-[var(--surface-secondary)]"
						onSelect={() => onView(order._id)}
					>
						<Eye className="h-4 w-4" aria-hidden="true" />
						Ver detalle
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild>
						<Link
							href={`/orders/${order._id}/edit`}
							className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
						>
							<Edit className="h-4 w-4" aria-hidden="true" />
							Editar
						</Link>
					</DropdownMenu.Item>
					<DropdownMenu.Item asChild>
						<Link
							href={`/orders/new?duplicateFrom=${order._id}`}
							className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]"
						>
							<Copy className="h-4 w-4" aria-hidden="true" />
							Duplicar
						</Link>
					</DropdownMenu.Item>
					<DropdownMenu.Separator className="my-1 h-px bg-[var(--border-default)]" />
					<DropdownMenu.Item
						className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-3 text-sm text-red-600 outline-none hover:bg-red-50 focus:bg-red-50"
						onSelect={async () => {
							await deleteOrder.mutateAsync(order._id);
							toast.success("Orden cancelada");
						}}
					>
						<Trash2 className="h-4 w-4" aria-hidden="true" />
						Cancelar
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
