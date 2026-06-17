/**
 * Client CRM Service — SSOT for customer data.
 *
 * Centralized customer registry used by work requests, proposals,
 * orders, and billing. Includes interaction history aggregation.
 */

import type { CreateClient, ListClientsQuery, UpdateClient } from "@cermont/shared-types";
import { AppError } from "../../common/errors";
import { ClientModel } from "../../models/Client";
import { Invoice } from "../../models/Invoice";
import { Proposal } from "../../models/Proposal";
import { ServiceCase } from "../../models/ServiceCase";
import { WorkRequest } from "../../models/WorkRequest";

export async function createClient(data: CreateClient, userId: string) {
	const existing = await ClientModel.findOne({ nit: data.nit });
	if (existing) {
		throw new AppError("Ya existe un cliente con ese NIT", 409, "CLIENT_NIT_ALREADY_EXISTS");
	}
	return ClientModel.create({ ...data, createdBy: userId });
}

export async function listClients(query: ListClientsQuery) {
	const { page, limit, status, search } = query;
	const filter: Record<string, unknown> = {};
	if (status) {
		filter.status = status;
	}
	if (search) {
		const pattern = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
		filter.$or = [{ name: pattern }, { nit: pattern }, { contactName: pattern }];
	}

	const [clients, total] = await Promise.all([
		ClientModel.find(filter)
			.sort({ name: 1 })
			.skip((page - 1) * limit)
			.limit(limit),
		ClientModel.countDocuments(filter),
	]);

	return {
		data: clients,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
}

export async function getClientById(id: string) {
	const client = await ClientModel.findById(id);
	if (!client) {
		throw new AppError("Cliente no encontrado", 404, "CLIENT_NOT_FOUND");
	}
	return client;
}

export async function updateClient(id: string, data: UpdateClient, userId: string) {
	if (data.nit) {
		const duplicate = await ClientModel.findOne({ nit: data.nit, _id: { $ne: id } });
		if (duplicate) {
			throw new AppError("Ya existe un cliente con ese NIT", 409, "CLIENT_NIT_ALREADY_EXISTS");
		}
	}
	const client = await ClientModel.findByIdAndUpdate(
		id,
		{ ...data, updatedBy: userId },
		{ returnDocument: "after", runValidators: true },
	);
	if (!client) {
		throw new AppError("Cliente no encontrado", 404, "CLIENT_NOT_FOUND");
	}
	return client;
}

export async function deactivateClient(id: string, userId: string) {
	const client = await ClientModel.findByIdAndUpdate(
		id,
		{ status: "inactive", updatedBy: userId },
		{ returnDocument: "after" },
	);
	if (!client) {
		throw new AppError("Cliente no encontrado", 404, "CLIENT_NOT_FOUND");
	}
	return client;
}

/**
 * Cross-module interaction history for a client, matched by client name
 * (legacy entities embed clientName) and clientId where available.
 */
export async function getClientHistory(id: string) {
	const client = await getClientById(id);
	const nameMatch = { clientName: client.name };

	const [workRequests, proposals, serviceCases, invoices] = await Promise.all([
		WorkRequest.find(nameMatch).sort({ createdAt: -1 }).limit(20).select("code status createdAt"),
		Proposal.find(nameMatch)
			.sort({ createdAt: -1 })
			.limit(20)
			.select("code status total createdAt"),
		ServiceCase.find(nameMatch)
			.sort({ createdAt: -1 })
			.limit(20)
			.select("code currentStage createdAt"),
		Invoice.find(nameMatch).sort({ createdAt: -1 }).limit(20).select("code status total createdAt"),
	]);

	return { client, workRequests, proposals, serviceCases, invoices };
}
