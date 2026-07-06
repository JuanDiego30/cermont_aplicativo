import { CreateFormSubmissionSchema } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { z } from "zod";
import { createLogger } from "../../common/utils/logger";
import {
	archiveFormSubmission,
	createFormSubmission,
	getFormSubmissionById,
	listFormSubmissions,
} from "./form-submission.service";

const log = createLogger("form-submissions");

const ListQuerySchema = z.object({
	serviceCaseId: z.string().length(24).optional(),
	templateId: z.string().optional(),
	stepCode: z.string().optional(),
	status: z.enum(["draft", "submitted", "archived"]).optional(),
	page: z.coerce.number().int().positive().optional(),
	limit: z.coerce.number().int().positive().max(100).optional(),
});

export async function createSubmission(req: Request, res: Response): Promise<void> {
	const parsed = CreateFormSubmissionSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(422).json({ error: "Validation error", details: parsed.error.flatten() });
		return;
	}

	const user = req.user as { _id?: { toString(): string } } | undefined;
	const userId = user?._id?.toString();
	if (!userId) {
		res.status(401).json({ error: "Unauthenticated" });
		return;
	}

	try {
		const submission = await createFormSubmission({
			...parsed.data,
			submittedBy: userId,
		});

		log.info("Form submission created", {
			id: (submission._id as { toString(): string }).toString(),
			templateId: submission.templateId as string,
			serviceCaseId:
				typeof submission.serviceCaseId === "object"
					? (submission.serviceCaseId as { toString(): string }).toString()
					: String(submission.serviceCaseId ?? ""),
		});

		res.status(201).json({ data: submission });
	} catch (err) {
		log.error("Failed to create form submission", { err: String(err) });
		res.status(500).json({ error: "Failed to create form submission" });
	}
}

export async function listSubmissions(req: Request, res: Response): Promise<void> {
	const parsed = ListQuerySchema.safeParse(req.query);
	if (!parsed.success) {
		res.status(422).json({ error: "Validation error", details: parsed.error.flatten() });
		return;
	}

	const result = await listFormSubmissions(parsed.data);
	res.setHeader("X-Total-Count", String(result.total));
	res.status(200).json({
		data: result.items,
		meta: { total: result.total, page: result.page, limit: result.limit },
	});
}

export async function getSubmission(req: Request, res: Response): Promise<void> {
	const id = String(req.params.id ?? "");
	const submission = await getFormSubmissionById(id);
	if (!submission) {
		res.status(404).json({ error: "Form submission not found" });
		return;
	}
	res.status(200).json({ data: submission });
}

export async function archiveSubmission(req: Request, res: Response): Promise<void> {
	const id = String(req.params.id ?? "");
	const submission = await archiveFormSubmission(id);
	if (!submission) {
		res.status(404).json({ error: "Form submission not found" });
		return;
	}
	res.status(200).json({ data: submission });
}
