/**
 * Files Module — Public Barrel
 *
 * Exposes the data layer (API + hooks + query keys) and UI components
 * for file/image management across kits, tools, equipment, materials,
 * evidences, delivery records, technical reports, planning packets, and
 * checklist items.
 *
 * @see backend/src/modules/files/ for the corresponding backend module.
 * @see @cermont/shared-types/schemas/file-asset.schema.ts for the contract.
 */

export * from "./api/files.api";
export * from "./hooks/useFileAssets";
export * from "./model/queryKeys";
export * from "./ui/AttachmentList";
export * from "./ui/FileAttachmentsSection";
export * from "./ui/FileUploadField";
export * from "./ui/ImagePreview";
export * from "./ui/ImageUploadField";
export * from "./ui/OfflineUploadQueueStatus";
