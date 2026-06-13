import { z } from "zod";
import { ObjectIdSchema } from "./common.schema";

export const DianEnvironmentSchema = z.enum(["test", "production"]);

export const DianConfigurationInputSchema = z
	.object({
		testSetId: z.string().trim().min(1).max(200),
		softwareId: z.string().trim().min(1).max(200),
		softwarePin: z.string().min(1).max(200),
		technicalKey: z.string().min(1).max(500),
		resolutionNumber: z.string().trim().min(1).max(100),
		resolutionDate: z.coerce.date(),
		resolutionStartDate: z.coerce.date(),
		resolutionEndDate: z.coerce.date(),
		resolutionPrefix: z.string().trim().min(1).max(20),
		resolutionFrom: z.number().int().nonnegative(),
		resolutionTo: z.number().int().positive(),
		environment: DianEnvironmentSchema,
		isEnabled: z.boolean(),
	})
	.strict()
	.superRefine((configuration, context) => {
		if (configuration.resolutionFrom > configuration.resolutionTo) {
			context.addIssue({
				code: "custom",
				path: ["resolutionTo"],
				message: "Resolution end number must be greater than or equal to its start",
			});
		}
		if (configuration.resolutionStartDate > configuration.resolutionEndDate) {
			context.addIssue({
				code: "custom",
				path: ["resolutionEndDate"],
				message: "Resolution end date must be after its start date",
			});
		}
	});

export type DianConfigurationInput = z.infer<typeof DianConfigurationInputSchema>;

export const DianPublicConfigurationSchema = z
	.object({
		testSetId: z.string(),
		softwareId: z.string(),
		resolutionNumber: z.string(),
		resolutionDate: z.string().datetime(),
		resolutionStartDate: z.string().datetime(),
		resolutionEndDate: z.string().datetime(),
		resolutionPrefix: z.string(),
		resolutionFrom: z.number().int(),
		resolutionTo: z.number().int(),
		environment: DianEnvironmentSchema,
		isEnabled: z.boolean(),
		lastInvoiceNumber: z.number().int(),
		credentialStatus: z
			.object({
				softwarePin: z.literal("configured"),
				technicalKey: z.literal("configured"),
			})
			.strict(),
	})
	.strict();

export type DianPublicConfiguration = z.infer<typeof DianPublicConfigurationSchema>;

export const DianConfigurationStatusSchema = z.discriminatedUnion("status", [
	z.object({ status: z.literal("not_configured") }).strict(),
	z
		.object({
			status: z.literal("invalid_configuration"),
			missingFields: z.array(z.string()).min(1),
		})
		.strict(),
	z
		.object({
			status: z.literal("configured"),
			configuration: DianPublicConfigurationSchema,
		})
		.strict(),
]);

export type DianConfigurationStatus = z.infer<typeof DianConfigurationStatusSchema>;

export const DianInvoiceParamsSchema = z
	.object({
		invoiceId: ObjectIdSchema,
	})
	.strict();

export const DianReportQuerySchema = z
	.object({
		from: z.coerce.date().optional(),
		to: z.coerce.date().optional(),
	})
	.strict()
	.refine((query) => !query.from || !query.to || query.from <= query.to, {
		path: ["to"],
		message: "Report end date must be after its start date",
	});

export type DianReportQuery = z.infer<typeof DianReportQuerySchema>;
