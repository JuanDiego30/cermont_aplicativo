import { describe, expect, it } from "vitest";

import {
	CHECKLIST_STATUS_LABELS_ES,
	COST_CATEGORY_LABELS_ES,
	EVIDENCE_TYPE_LABELS_ES,
	ORDER_PRIORITY_LABELS_ES,
	ORDER_STATUS_LABELS_ES,
	ORDER_STATUS_PLURAL_LABELS_ES,
	ORDER_TYPE_LABELS_ES,
	USER_ROLE_LABELS_ES,
} from "../../src/constants/labels";

describe("shared label dictionaries", () => {
	it("exports canonical English keys with Spanish display labels", () => {
		expect(ORDER_STATUS_LABELS_ES.ready_for_invoicing).toBe("Lista para facturación");
		expect(ORDER_STATUS_PLURAL_LABELS_ES.in_progress).toBe("En curso");
		expect(ORDER_PRIORITY_LABELS_ES.critical).toBe("Crítica");
		expect(ORDER_TYPE_LABELS_ES.maintenance).toBe("Mantenimiento");
		expect(COST_CATEGORY_LABELS_ES.subcontract).toBe("Subcontratos");
		expect(EVIDENCE_TYPE_LABELS_ES.signature).toBe("Firma");
		expect(CHECKLIST_STATUS_LABELS_ES.in_progress).toBe("En progreso");
		expect(USER_ROLE_LABELS_ES.resident_engineer).toBe("Ing. Residente");
	});
});
