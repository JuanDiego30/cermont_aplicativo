import { type Document, model, Schema, type Types } from "mongoose";

export interface IVehicleAssignmentDocument extends Document {
	vehicleId: Types.ObjectId;
	driverId: Types.ObjectId;
	driverName?: string;
	assignedBy: Types.ObjectId;
	assignedAt: Date;
	startedAt?: Date;
	endedAt?: Date;
	status: "pending" | "active" | "completed";
	checkout?: {
		mileage: number;
		fuelLevel: number;
		photos: string[]; // FileAsset ref IDs
		notes?: string;
	};
	checkin?: {
		mileage: number;
		fuelLevel: number;
		photos: string[]; // FileAsset ref IDs
		notes?: string;
	};
	createdAt: Date;
	updatedAt: Date;
}

const VehicleCheckoutSchema = new Schema(
	{
		mileage: { type: Number, required: true },
		fuelLevel: { type: Number, required: true, min: 0, max: 100 },
		photos: [{ type: String }],
		notes: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const VehicleCheckinSchema = new Schema(
	{
		mileage: { type: Number, required: true },
		fuelLevel: { type: Number, required: true, min: 0, max: 100 },
		photos: [{ type: String }],
		notes: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const VehicleAssignmentSchema = new Schema<IVehicleAssignmentDocument>(
	{
		vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
		driverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
		driverName: { type: String, maxlength: 200 },
		assignedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
		assignedAt: { type: Date, required: true, default: Date.now },
		startedAt: { type: Date },
		endedAt: { type: Date },
		status: {
			type: String,
			enum: ["pending", "active", "completed"],
			default: "pending",
			index: true,
		},
		checkout: { type: VehicleCheckoutSchema },
		checkin: { type: VehicleCheckinSchema },
	},
	{ timestamps: true },
);

export const VehicleAssignment = model<IVehicleAssignmentDocument>(
	"VehicleAssignment",
	VehicleAssignmentSchema,
);
