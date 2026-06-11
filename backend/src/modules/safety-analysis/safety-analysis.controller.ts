import {
	ASTIdParamsSchema,
	ASTStatusSchema,
	CreateASTSchema,
	ListASTQuerySchema,
	SignASTSchema,
	UpdateASTSchema,
} from "@cermont/shared-types";
import type { Request, Response } from "express";
import { sendCreated, sendSuccess } from "../../common/interceptors/response.interceptor";
import { requireUser } from "../../common/utils/request";
import * as SafetyAnalysisService from "./safety-analysis.service";

export async function createAST(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const data = CreateASTSchema.parse(req.body);
	const ast = await SafetyAnalysisService.createAST(data, String(user._id));
	sendCreated(res, ast);
}

export async function listASTs(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const query = ListASTQuerySchema.parse(req.query);
	const result = await SafetyAnalysisService.listASTs(query);
	res.status(200).json({ success: true, ...result });
}

export async function getAST(req: Request, res: Response): Promise<void> {
	requireUser(req);
	const { id } = ASTIdParamsSchema.parse(req.params);
	const ast = await SafetyAnalysisService.getASTById(id);
	sendSuccess(res, ast);
}

export async function updateAST(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ASTIdParamsSchema.parse(req.params);
	const data = UpdateASTSchema.parse(req.body);
	const ast = await SafetyAnalysisService.updateAST(id, data, String(user._id));
	sendSuccess(res, ast);
}

export async function transitionAST(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ASTIdParamsSchema.parse(req.params);
	const status = ASTStatusSchema.parse(req.body.status);
	const ast = await SafetyAnalysisService.transitionAST(id, status, String(user._id));
	sendSuccess(res, ast);
}

export async function signAST(req: Request, res: Response): Promise<void> {
	const user = requireUser(req);
	const { id } = ASTIdParamsSchema.parse(req.params);
	const input = SignASTSchema.parse(req.body);
	const ast = await SafetyAnalysisService.signAST(id, input, String(user._id));
	sendSuccess(res, ast);
}
