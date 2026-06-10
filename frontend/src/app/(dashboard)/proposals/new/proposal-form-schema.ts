import { z } from "zod";

const ProposalItemFormSchema = z.object({
	description: z.string().min(1, "La descripción es requerida").max(300),
	unit: z.string().min(1, "La unidad es requerida").max(50),
	quantity: z.number().positive("Debe ser mayor a 0"),
	unitCost: z.number().nonnegative("Debe ser mayor o igual a 0"),
});

export const ProposalFormSchema = z.object({
	clientName: z.string().min(2, "El nombre del cliente debe tener al menos 2 caracteres").max(200),
	clientEmail: z.string().optional(),
	validUntil: z.string().min(1, "La fecha de validez es requerida"),
	items: z.array(ProposalItemFormSchema).min(1, "Agrega al menos un item"),
	notes: z.string().max(2000).optional(),
});

export type ProposalFormValues = z.infer<typeof ProposalFormSchema>;
