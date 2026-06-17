/**
 * Business Documents — utility helpers
 */
const DOCUMENT_TYPE_LABELS: Record<string, string> = {
	work_planning: "Work Planning",
	cctv_maintenance: "CCTV Maintenance",
	lifeline_inspection: "Lifeline Inspection",
	sgsst_induction: "SGSST Induction",
	ladder_anchor_photo: "Ladder Anchor Photo",
	safety_control_hierarchy: "Safety Control Hierarchy",
	field_permit: "Field Permit",
	ast_safety_analysis: "Safety Analysis",
};

export function getDocumentTypeLabel(type: string): string {
	return DOCUMENT_TYPE_LABELS[type] ?? type.replace(/_/g, " ");
}
