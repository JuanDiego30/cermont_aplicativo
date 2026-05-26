import { z } from "zod";
import { CermontOperationalStepCodeSchema } from "./cermont-operational-step.schema";
import { ObjectIdSchema } from "./common.schema";
import { DomainBlockerCodeSchema } from "./domain-blocker.schema";
import { UserRoleSchema } from "./user.schema";

export const StepRequirementTypeSchema = z.enum([
	"document",
	"evidence",
	"template_response",
	"signature",
	"gps",
	"cost",
	"approval",
	"external_reference",
]);

export type StepRequirementType = z.infer<typeof StepRequirementTypeSchema>;

export const StepRequirementStatusSchema = z.enum([
	"missing",
	"pending",
	"satisfied",
	"warning",
	"not_applicable",
]);

export type StepRequirementStatus = z.infer<typeof StepRequirementStatusSchema>;

export const StepRequirementSchema = z.object({
	id: z.string().min(1),
	stepCode: CermontOperationalStepCodeSchema,
	type: StepRequirementTypeSchema,
	label: z.string().min(1),
	description: z.string().optional(),
	required: z.boolean().default(true),
	blocksTransition: z.boolean().default(true),
	acceptedMimeTypes: z.array(z.string()).optional(),
	templateId: z.string().optional(),
	blockerCode: DomainBlockerCodeSchema.optional(),
});

export type StepRequirement = z.infer<typeof StepRequirementSchema>;

export const ResolvedStepRequirementSchema = StepRequirementSchema.extend({
	status: StepRequirementStatusSchema,
	field: z.string().min(1).optional(),
	blockerMessage: z.string().min(1).optional(),
	recommendedAction: z.string().min(1).optional(),
	ownerRole: UserRoleSchema.optional(),
	artifactId: ObjectIdSchema.optional(),
});

export type ResolvedStepRequirement = z.infer<typeof ResolvedStepRequirementSchema>;
