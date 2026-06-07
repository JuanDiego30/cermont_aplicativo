import { type Document, model, Schema, Types } from "mongoose";

import { FileAssetRefSchema, type FileAssetRef } from "./sub-schemas/FileAssetRefSchema";

// ═══════════════════════════════════════════════════════════════════════════════
// Evidence Model — Per DOC-09 §7 (Diccionario de Datos)
//
// Supports both V1 (legacy) and V2 schemas for backward compatibility.
// V2 includes: code, phase, category, serviceCaseId, variants, enhanced GPS
// ═══════════════════════════════════════════════════════════════════════════════

// V2 Image Variant Schema
const EvidenceImageVariantSchema = new Schema(
  {
    url: { type: String, required: true },
    variant: { type: String, enum: ["original", "web", "thumbnail"], required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    sizeBytes: { type: Number, required: true },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false },
);

// Combined interface supporting both V1 and V2 fields
export interface IEvidenceDocument extends Document {
  // V1 fields (legacy)
  orderId?: Types.ObjectId;
  type?: "before" | "during" | "after" | "defect" | "safety" | "signature";
  
  // V2 fields
  code?: string;
  phase?: "before" | "during" | "after" | "closure";
  category?: "installation" | "deinstallation" | "test" | "calibration" | "quality" | "safety" | "incident" | "defect" | "progress" | "lifeline" | "cctv" | "measurement" | "other";
  serviceCaseId?: Types.ObjectId;
  workOrderId?: Types.ObjectId;
  executionSessionId?: Types.ObjectId;

  // File metadata
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  variants?: Array<{
    url: string;
    variant: "original" | "web" | "thumbnail";
    width: number;
    height: number;
    sizeBytes: number;
    uploadedAt: Date;
  }>;
  fileAssets: FileAssetRef[];

  // Content
  description?: string;
  capturedAt: Date;
  offlineCapturedAt?: Date;
  gpsLocation?: {
    lat: number;
    lng: number;
    accuracy?: number;
    capturedAt?: Date;
  };

  // Audit and sync
  uploadedBy: Types.ObjectId;
  uploadedByName?: string;
  uploadedAt?: Date;
  idempotencyKey?: string;
  deviceId?: string;
  syncStatus: "pending" | "syncing" | "synced" | "failed";

  // Verification
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidenceDocument>(
  {
    // V1 fields (legacy)
    orderId: { type: Types.ObjectId, ref: "Order", index: true },
    type: {
      type: String,
      enum: ["before", "during", "after", "defect", "safety", "signature"],
    },
    
    // V2 fields
    code: { type: String, unique: true, index: true },
    phase: {
      type: String,
      enum: ["before", "during", "after", "closure"],
    },
    category: {
      type: String,
      enum: [
        "installation", "deinstallation", "test", "calibration", "quality",
        "safety", "incident", "defect", "progress", "lifeline", "cctv",
        "measurement", "other",
      ],
    },
    serviceCaseId: { type: Types.ObjectId, ref: "ServiceCase", index: true },
    workOrderId: { type: Types.ObjectId, ref: "Order", index: true },
    executionSessionId: { type: Types.ObjectId, ref: "ExecutionSession", index: true },
    
    // File metadata
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    variants: [EvidenceImageVariantSchema],
    fileAssets: { type: [FileAssetRefSchema], default: [] },

    // Content
    description: { type: String, maxlength: 500 },
    capturedAt: { type: Date, required: true },
    offlineCapturedAt: { type: Date },
    gpsLocation: {
      lat: { type: Number },
      lng: { type: Number },
      accuracy: { type: Number },
      capturedAt: { type: Date },
    },
    
    // Audit and sync
    uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
    uploadedByName: { type: String, maxlength: 200 },
    idempotencyKey: { type: String, unique: true, sparse: true },
    deviceId: { type: String, maxlength: 120 },
    syncStatus: {
      type: String,
      enum: ["pending", "syncing", "synced", "failed"],
      default: "synced",
    },
    
    // Verification
    verifiedAt: { type: Date },
    verifiedBy: { type: Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, index: true },
  },
  { timestamps: true, versionKey: false },
);

// ═══════════════════════════════════════════════════════════════════════════════
// ÍNDICES COMPUESTOS — Optimización para queries frecuentes (per DOC-09 §9)
// ═══════════════════════════════════════════════════════════════════════════════

// V1: Evidencias de una orden por tipo
EvidenceSchema.index({ orderId: 1, type: 1 });

// V2: Evidencias de un service case por fase y categoria
EvidenceSchema.index({ serviceCaseId: 1, phase: 1, category: 1 });
EvidenceSchema.index({ workOrderId: 1, phase: 1 });
EvidenceSchema.index({ executionSessionId: 1, phase: 1 });

// Sync and idempotency
EvidenceSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
EvidenceSchema.index({ syncStatus: 1 });

// Query optimization
EvidenceSchema.index({ uploadedBy: 1, createdAt: -1 });
EvidenceSchema.index({ capturedAt: 1 });

// toJSON: limpiar __v de respuestas
EvidenceSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>;
    delete obj.__v;
    return obj;
  },
});

export const Evidence = model<IEvidenceDocument>("Evidence", EvidenceSchema);