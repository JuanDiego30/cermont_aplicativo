import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const ReferenceDocumentTypeSchema = z.enum([
	"ats",
	"ast",
	"ptw",
	"procedimiento",
	"instructivo",
	"formato_tarea_critica",
	"checklist_equipos",
	"certificacion_equipo",
	"certificacion_personal",
]);
export type ReferenceDocumentType = z.infer<typeof ReferenceDocumentTypeSchema>;

export const AddReferenceDocumentSchema = z
	.object({
		documentId: ObjectIdSchema,
		documentType: ReferenceDocumentTypeSchema,
		name: z.string().min(1).max(200),
		required: z.boolean().default(true),
	})
	.strict();
export type AddReferenceDocumentInput = z.infer<typeof AddReferenceDocumentSchema>;
