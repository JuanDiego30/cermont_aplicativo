import type { Request, Response } from "express";
import { getString } from "../../common/utils/request";
import * as ClosureService from "./order-closure.service";

/**
 * Obtiene un reporte consolidado de cierre administrativo para una orden.
 * Agrega datos de acta, SES, factura y pagos (Pasos 8-14).
 */
export async function getConsolidatedClosureReport(req: Request, res: Response): Promise<void> {
	const orderId = getString(req.params.id);
	const report = await ClosureService.getConsolidatedReport(orderId);

	res.status(200).json({
		success: true,
		data: report,
		message: "Reporte de cierre administrativo generado exitosamente.",
	});
}
