import type { VehicleStatus, VehicleType } from "@cermont/shared-types";
import mongoose, { type Model, Schema } from "mongoose";
import { type FileAssetRef, FileAssetRefSchema } from "./sub-schemas/FileAssetRefSchema";

export type VehiclePrimaryPhoto = { status: "absent" } | { status: "present"; fileAssetId: string };

export interface AssignmentRecord {
	driverId: mongoose.Types.ObjectId;
	driverName: string;
	checkedInAt: Date;
	checkedOutAt?: Date;
	orderId?: mongoose.Types.ObjectId;
	notes?: string;
}

export interface VehicleRecord {
	plate: string;
	brand: string;
	model: string;
	year: number;
	type: VehicleType;
	capacity?: string;
	driverName?: string;
	driverId?: mongoose.Types.ObjectId;
	soatExpiry?: Date;
	technoMechanicalExpiry?: Date;
	insuranceExpiry?: Date;
	lastMaintenanceAt?: Date;
	nextMaintenanceKm?: number;
	kilometers: number;
	status: VehicleStatus;
	notes?: string;
	fileAssets: FileAssetRef[];
	primaryPhoto: VehiclePrimaryPhoto;
	assignmentHistory: AssignmentRecord[];
	currentAssignment?: AssignmentRecord;
	createdBy?: mongoose.Types.ObjectId;
	updatedBy?: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const assignmentRecordSchema = new Schema<AssignmentRecord>(
	{
		driverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		driverName: { type: String, required: true, maxlength: 200 },
		checkedInAt: { type: Date, required: true },
		checkedOutAt: { type: Date },
		orderId: { type: Schema.Types.ObjectId, ref: "Order" },
		notes: { type: String, maxlength: 500 },
	},
	{ _id: false },
);

const vehiclePrimaryPhotoSchema = new Schema<VehiclePrimaryPhoto>(
	{
		status: { type: String, enum: ["absent", "present"], required: true },
		fileAssetId: {
			type: String,
			maxlength: 64,
			required: function requirePresentPhotoId(this: VehiclePrimaryPhoto) {
				return this.status === "present";
			},
		},
	},
	{ _id: false },
);

const vehicleSchema = new Schema<VehicleRecord>(
	{
		plate: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
			maxlength: 10,
		},
		brand: { type: String, required: true, maxlength: 60 },
		model: { type: String, required: true, maxlength: 60 },
		year: { type: Number, required: true, min: 1980, max: 2100 },
		type: {
			type: String,
			enum: ["camioneta", "camion", "moto", "van", "otro"],
			required: true,
		},
		capacity: { type: String, maxlength: 60 },
		driverName: { type: String, maxlength: 200 },
		driverId: { type: Schema.Types.ObjectId, ref: "User" },
		soatExpiry: { type: Date },
		technoMechanicalExpiry: { type: Date },
		insuranceExpiry: { type: Date },
		lastMaintenanceAt: { type: Date },
		nextMaintenanceKm: { type: Number, min: 0 },
		kilometers: { type: Number, min: 0, default: 0 },
		status: {
			type: String,
			enum: ["active", "maintenance", "out_of_service"],
			default: "active",
			index: true,
		},
		notes: { type: String, maxlength: 500 },
		fileAssets: { type: [FileAssetRefSchema], default: [] },
		assignmentHistory: { type: [assignmentRecordSchema], default: [] },
		currentAssignment: {
			type: assignmentRecordSchema,
			default: null,
		},
		primaryPhoto: {
			type: vehiclePrimaryPhotoSchema,
			required: true,
			default: () => ({ status: "absent" }),
		},
		createdBy: { type: Schema.Types.ObjectId, ref: "User" },
		updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
	},
	{ timestamps: true },
);

vehicleSchema.index({ status: 1, soatExpiry: 1 });

export const VehicleModel: Model<VehicleRecord> = mongoose.model<VehicleRecord>(
	"Vehicle",
	vehicleSchema,
);
