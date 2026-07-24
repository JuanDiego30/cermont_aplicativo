import { VehicleAssignmentStatusSchema } from "@cermont/shared-types";
import { type Document, model, Schema, Types } from "mongoose";

export interface VehicleAssignmentCheckpoint {
	mileage: number;
	fuelLevel: number;
	photos: string[];
	notes?: string;
}

const checkpointSchema = new Schema<VehicleAssignmentCheckpoint>(
	{
		mileage: { type: Number, required: true, min: 0 },
		fuelLevel: { type: Number, required: true, min: 0, max: 100 },
		photos: { type: [String], default: [] },
		notes: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

export interface IVehicleAssignmentDocument extends Document {
	vehicleId: Types.ObjectId;
	driverId: Types.ObjectId;
	driverName: string;
	assignedBy: Types.ObjectId;
	assignedAt: Date;
	startedAt?: Date;
	endedAt?: Date;
	status: "pending" | "active" | "completed";
	checkout?: VehicleAssignmentCheckpoint;
	checkin?: VehicleAssignmentCheckpoint;
	createdAt: Date;
	updatedAt: Date;
}

const VehicleAssignmentSchema = new Schema<IVehicleAssignmentDocument>(
	{
		vehicleId: { type: Types.ObjectId, ref: "Vehicle", required: true, index: true },
		driverId: { type: Types.ObjectId, ref: "User", required: true },
		driverName: { type: String, required: true, maxlength: 200 },
		assignedBy: { type: Types.ObjectId, ref: "User", required: true },
		assignedAt: { type: Date, required: true },
		startedAt: { type: Date },
		endedAt: { type: Date },
		status: {
			type: String,
			enum: VehicleAssignmentStatusSchema.options,
			default: "pending",
			index: true,
		},
		checkout: { type: checkpointSchema },
		checkin: { type: checkpointSchema },
	},
	{ timestamps: true },
);

VehicleAssignmentSchema.index({ vehicleId: 1, status: 1 });

export const VehicleAssignment = model<IVehicleAssignmentDocument>(
	"VehicleAssignment",
	VehicleAssignmentSchema,
);
