import type { ChatRequest } from "@cermont/shared-types";
import type { Request, Response } from "express";
import { processUserQuery } from "../application/service";

export async function chatHandler(req: Request, res: Response) {
	// Use validated body data from middleware (validateBody(ChatRequestSchema))
	const { query } = req.body as ChatRequest;

	const responseData = await processUserQuery(query);

	res.json({
		success: true,
		data: responseData,
	});
}
