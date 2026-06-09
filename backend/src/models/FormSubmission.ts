/**
 * FormSubmission Model — Mongoose schema
 *
 * Persists submitted CERMONT operational form data.
 * Works alongside the frontend CermontFormTemplate types.
 * Template IDs are strings (not ObjectIds) because the
 * CERMONT templates are code-defined, not DB-stored.
 */

import { model, Schema, type Types } from "mongoose";

export interface FormSubmissionDocument {
	_id: Types.ObjectId;
	/** Frontend CermontFormTemplate id, e.g. "cermont_cctv_v1" */
	templateId: string;
	/** CermontOperationalStepCode */
	stepCode: string;
	serviceCaseId?: Types.ObjectId;
	executionSessionId?: Types.ObjectId;
	/** JSON form values (keys are field.key strings) */
	values: Record<string, unknown>;
	/** Photo attachment references (stored via /api/files, referenced by field key) */
	photoAttachments: Array<{
		fieldKey: string;
		fileId: string;
		fileName: string;
		mimeType: string;
		sizeBytes: number;
	}>;
	submittedBy: Types.ObjectId;
	submittedAt: Date;
	status: "draft" | "submitted" | "archived";
	createdAt: Date;
	updatedAt: Date;
}

const formSubmissionSchema = new Schema<FormSubmissionDocument>(
	{
		templateId: { type: String, required: true, maxlength: 100, index: true },
		stepCode: { type: String, required: true, maxlength: 80, index: true },
		serviceCaseId: { type: Schema.Types.ObjectId, ref: "ServiceCase", index: true },
		executionSessionId: { type: Schema.Types.ObjectId, ref: "ExecutionSession" },
		values: { type: Schema.Types.Mixed, required: true, default: {} },
		photoAttachments: {
			type: [
				{
					fieldKey: { type: String, required: true },
					fileId: { type: String, required: true },
					fileName: { type: String, required: true },
					mimeType: { type: String, required: true },
					sizeBytes: { type: Number, required: true },
					_id: false,
				},
			],
			default: [],
		},
		submittedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		submittedAt: { type: Date, required: true, default: Date.now },
		status: {
			type: String,
			enum: ["draft", "submitted", "archived"],
			default: "submitted",
			index: true,
		},
	},
	{
		timestamps: true,
		collection: "form_submissions",
	},
);

formSubmissionSchema.index({ serviceCaseId: 1, templateId: 1, submittedAt: -1 });
formSubmissionSchema.index({ serviceCaseId: 1, stepCode: 1, status: 1 });

export const FormSubmission = model<FormSubmissionDocument>("FormSubmission", formSubmissionSchema);
