import { z } from "zod";

export const ChatRequestSchema = z
	.object({
		query: z.string().min(1).max(4000).trim(),
	})
	.strict();

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
