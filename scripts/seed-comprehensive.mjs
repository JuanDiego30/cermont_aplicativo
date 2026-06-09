#!/usr/bin/env node
/**
 * seed-comprehensive.mjs
 *
 * Siembra 5 trabajos con datos realistas atravesando los 14 pasos del flujo CERMONT.
 *
 * Uso:
 *   node scripts/seed-comprehensive.mjs
 *
 * Requisitos:
 *   - MongoDB corriendo en 127.0.0.1:27017
 *   - Backend con seed previo de usuarios (npm run db:seed)
 */

import crypto from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/cermont";

// ── IDs de usuarios existentes (del seed original) ──────────────────────────
// Se resuelven dinámicamente al inicio
const USERS = {};

// ── Helpers ─────────────────────────────────────────────────────────────────
const newId = () => new ObjectId();
const now = () => new Date();
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const _hoursAgo = (n) => new Date(Date.now() - n * 3600000);

async function main() {
	const client = new MongoClient(MONGO_URI, { family: 4 });
	await client.connect();
	const db = client.db();

	// ── Resolver usuarios existentes ─────────────────────────────────────────
	const userDocs = await db.collection("users").find({}).toArray();
	for (const u of userDocs) {
		USERS[u.role] = u._id;
		// Also store by email prefix for specific lookups
		if (u.email?.includes("gerencia@cermont.co")) {
			USERS.gerencia = u._id;
		}
		if (u.email?.includes("gerente@cermont.com")) {
			USERS.gerente = u._id;
		}
		if (u.email?.includes("residente@cermont.com")) {
			USERS.residente = u._id;
		}
		if (u.email?.includes("hes@cermont.com")) {
			USERS.hes = u._id;
		}
		if (u.email?.includes("supervisor@cermont.com")) {
			USERS.supervisor = u._id;
		}
		if (u.email?.includes("operador@cermont.com")) {
			USERS.operador = u._id;
		}
		if (u.email?.includes("tecnico@cermont.com")) {
			USERS.tecnico = u._id;
		}
		if (u.email?.includes("administrativo@cermont.com")) {
			USERS.administrativo = u._id;
		}
		if (u.email?.includes("cliente@cermont.com")) {
			USERS.cliente = u._id;
		}
	}

	console.log("Usuarios encontrados:", Object.keys(USERS).length);

	// ── Limpiar datos anteriores de prueba (excepto usuarios, counters) ──────
	const cleanCollections = [
		"workrequests",
		"proposals",
		"purchaseorders",
		"orders",
		"planningpackets",
		"executionsessions",
		"evidences",
		"technicalreports",
		"deliveryrecords",
		"serviceentrysheets",
		"invoices",
		"payments",
		"checklists",
		"documents",
		"sitevisits",
		"service_cases",
		"costs",
		"auditlogs",
		"assets",
		"resources",
		"kits",
	];
	for (const col of cleanCollections) {
		const r = await db.collection(col).deleteMany({});
		if (r.deletedCount > 0) {
			console.log(`  ${col}: ${r.deletedCount} docs eliminados`);
		}
	}

	// ── Resetear contadores ──────────────────────────────────────────────────
	await db.collection("counters").deleteMany({});
	const counters = [
		{ _id: "orderCode", seq: 0 },
		{ _id: "proposalCode", seq: 0 },
		{ _id: "sesCode", seq: 0 },
		{ _id: "invoiceCode", seq: 0 },
		{ _id: "paymentRef", seq: 0 },
		{ _id: "executionSessionCode", seq: 0 },
		{ _id: "reportCode", seq: 0 },
		{ _id: "deliveryRecordCode", seq: 0 },
		{ _id: "technicalReportCode", seq: 0 },
		{ _id: "workRequestCode", seq: 0 },
	];
	await db.collection("counters").insertMany(counters);

	// ── Activos (assets) ─────────────────────────────────────────────────────
	const assets = [
		{
			_id: newId(),
			code: "ACT-BOM-001",
			name: "Bomba Eléctrica Centrífuga 150HP",
			type: "MAQUINARIA",
			location: "Caño Limón",
			status: "operational",
			createdAt: daysAgo(180),
			updatedAt: now(),
		},
		{
			_id: newId(),
			code: "ACT-TRF-001",
			name: "Transformador 500kVA",
			type: "EQUIPO_ELECTRICO",
			location: "Barrancabermeja",
			status: "operational",
			createdAt: daysAgo(365),
			updatedAt: now(),
		},
		{
			_id: newId(),
			code: "ACT-TOR-001",
			name: "Torre Telecomunicaciones 60m",
			type: "INFRAESTRUCTURA",
			location: "Bucaramanga",
			status: "operational",
			createdAt: daysAgo(730),
			updatedAt: now(),
		},
		{
			_id: newId(),
			code: "ACT-COM-001",
			name: "Compresor Industrial Atlas Copco",
			type: "MAQUINARIA",
			location: "Bogotá Zona Franca",
			status: "maintenance",
			createdAt: daysAgo(540),
			updatedAt: now(),
		},
		{
			_id: newId(),
			code: "ACT-PAN-001",
			name: "Banco Paneles Solares 50kW",
			type: "EQUIPO_ENERGIA",
			location: "Yopal Casanare",
			status: "operational",
			createdAt: daysAgo(200),
			updatedAt: now(),
		},
	];
	await db.collection("assets").insertMany(assets);
	console.log(`  assets: ${assets.length} activos creados`);

	// ── Recursos / Materiales ────────────────────────────────────────────────
	const resources = [
		{
			_id: newId(),
			name: "Aceite hidráulico ISO 68",
			category: "lubricante",
			unit: "galón",
			stock: 45,
			minStock: 10,
			createdAt: now(),
		},
		{
			_id: newId(),
			name: 'Sello mecánico 2.5"',
			category: "repuesto",
			unit: "unidad",
			stock: 12,
			minStock: 5,
			createdAt: now(),
		},
		{
			_id: newId(),
			name: "Cable THHN #8 AWG",
			category: "eléctrico",
			unit: "metro",
			stock: 500,
			minStock: 100,
			createdAt: now(),
		},
		{
			_id: newId(),
			name: "Conector RJ45 CAT6",
			category: "telecom",
			unit: "unidad",
			stock: 200,
			minStock: 50,
			createdAt: now(),
		},
		{
			_id: newId(),
			name: "Filtro de aire compresor",
			category: "repuesto",
			unit: "unidad",
			stock: 8,
			minStock: 5,
			createdAt: now(),
		},
		{
			_id: newId(),
			name: "Panel solar 450W",
			category: "energía",
			unit: "unidad",
			stock: 15,
			minStock: 3,
			createdAt: now(),
		},
		{
			_id: newId(),
			name: "Inversor solar 5kW",
			category: "energía",
			unit: "unidad",
			stock: 5,
			minStock: 2,
			createdAt: now(),
		},
	];
	await db.collection("resources").insertMany(resources);
	console.log(`  resources: ${resources.length} recursos creados`);

	// ── DEFINICIÓN DE 5 TRABAJOS ─────────────────────────────────────────────

	const jobs = [
		{
			title: "Mantenimiento Bomba Eléctrica - Caño Limón",
			description:
				"Mantenimiento preventivo y correctivo de bomba centrífuga 150HP en estación de bombeo Caño Limón. Incluye desmontaje, inspección de rodamientos, reemplazo de sellos mecánicos, balanceo dinámico y prueba de funcionamiento.",
			assetCode: "ACT-BOM-001",
			assetName: "Bomba Eléctrica Centrífuga 150HP",
			location: "Caño Limón, Arauca",
			clientName: "Ecopetrol S.A.",
			type: "correctivo",
			priority: "alta",
			stages: "full", // All 14 steps complete
			budget: 28500000,
		},
		{
			title: "Instalación Transformador 500kVA - Barrancabermeja",
			description:
				"Instalación de transformador trifásico 500kVA 13.2kV/480V en subestación eléctrica de la refinería. Incluye montaje, conexionado, pruebas de aislamiento, puesta a tierra y certificación RETIE.",
			assetCode: "ACT-TRF-001",
			assetName: "Transformador 500kVA",
			location: "Barrancabermeja, Santander",
			clientName: "Ecopetrol S.A.",
			type: "instalacion",
			priority: "alta",
			stages: "delivery_signed", // Through step 10 (delivery signed)
			budget: 42000000,
		},
		{
			title: "Mantenimiento Torre Comunicaciones - Bucaramanga",
			description:
				"Mantenimiento preventivo nivel II de torre de telecomunicaciones de 60m. Inspección estructural, reemplazo de tensores oxidados, lubricación de poleas, verificación de sistema de pararrayos y pintura anticorrosiva.",
			assetCode: "ACT-TOR-001",
			assetName: "Torre Telecomunicaciones 60m",
			location: "Bucaramanga, Santander",
			clientName: "TigoUne",
			type: "preventivo",
			priority: "media",
			stages: "execution", // Through step 6 (execution)
			budget: 18500000,
		},
		{
			title: "Reparación Compresor Industrial - Bogotá",
			description:
				"Reparación mayor de compresor Atlas Copco GA 160. Reemplazo de válvulas, kit de pistones, filtros de aceite y aire. Prueba de estanqueidad y calibración de presión.",
			assetCode: "ACT-COM-001",
			assetName: "Compresor Industrial Atlas Copco",
			location: "Bogotá Zona Franca",
			clientName: "Bavaria S.A.",
			type: "correctivo",
			priority: "urgente",
			stages: "order_created", // Through step 4 (converted to order)
			budget: 32000000,
		},
		{
			title: "Mantenimiento Paneles Solares - Yopal",
			description:
				"Mantenimiento preventivo de banco solar 50kW. Limpieza de paneles, verificación de conexiones, prueba de rendimiento de inversores, actualización de firmware y certificación de producción.",
			assetCode: "ACT-PAN-001",
			assetName: "Banco Paneles Solares 50kW",
			location: "Yopal, Casanare",
			clientName: "Alcaldía de Yopal",
			type: "preventivo",
			priority: "media",
			stages: "proposal", // Through step 3 (proposal approved)
			budget: 12500000,
		},
	];

	const createdOrders = [];
	const createdProposals = [];
	const createdExecSessions = [];
	const createdTechReports = [];
	const createdDeliveries = [];

	for (let i = 0; i < jobs.length; i++) {
		const job = jobs[i];
		const jobIndex = i + 1;
		const orderId = newId();
		const proposalId = newId();
		const purchaseOrderId = newId();
		const planningPacketId = newId();
		const execSessionId = newId();
		const techReportId = newId();
		const deliveryRecordId = newId();
		const sesId = newId();
		const invoiceId = newId();
		const paymentId = newId();
		const siteVisitId = newId();
		const workRequestId = newId();

		console.log(`\n── Trabajo ${jobIndex}: ${job.title} ──`);

		// ── STEP 1: Work Request ──────────────────────────────────────────────
		const wrCode = `WR-${String(jobIndex).padStart(4, "0")}-2026`;
		await db.collection("workrequests").insertOne({
			_id: workRequestId,
			code: wrCode,
			title: job.title,
			status: "approved",
			urgency:
				job.priority === "urgente" ? "emergency" : job.priority === "alta" ? "high" : "medium",
			requesterId: USERS.gerencia ?? USERS.gerente,
			requesterName: "Gerencia General",
			requesterEmail: "gerencia@cermont.co",
			requesterPhone: "+57 300 123 4567",
			clientName: job.clientName,
			serviceSite: job.location,
			serviceType: job.type,
			sourceChannel: "email",
			shortDescription: job.title.substring(0, 100),
			description: job.description,
			tags: [job.type, job.clientName.split(" ")[0].toLowerCase()],
			classifications: [
				{ category: job.type === "preventivo" ? "preventive" : "corrective", value: "high" },
			],
			initialEvidences: [],
			requiresSiteVisit: true,
			archived: false,
			createdBy: USERS.gerencia ?? USERS.gerente,
			updatedBy: USERS.gerencia ?? USERS.gerente,
			createdAt: daysAgo(60 + jobIndex * 5),
			updatedAt: daysAgo(58 + jobIndex * 5),
		});
		console.log("  ✓ Step 1: Work Request creada");

		// ── STEP 2: Site Visit ────────────────────────────────────────────────
		await db.collection("sitevisits").insertOne({
			_id: siteVisitId,
			code: `SV-${String(jobIndex).padStart(3, "0")}-2026`,
			workRequestId: workRequestId,
			scheduledDate: daysAgo(55 + jobIndex * 5),
			visitDate: daysAgo(54 + jobIndex * 5),
			siteAddress: job.location,
			clientContact: `Contacto ${job.clientName}`,
			technicianId: USERS.tecnico,
			technicianName: "María Técnica",
			findings: `Inspección técnica realizada en ${job.location}. Se identifican necesidades de ${job.type === "preventivo" ? "mantenimiento preventivo" : "reparación correctiva"} según lo solicitado.`,
			recommendations: `Se recomienda proceder con ${job.title.toLowerCase()}. Prioridad ${job.priority}.`,
			status: "completed",
			estimatedBudget: job.budget,
			createdBy: USERS.gerencia ?? USERS.gerente,
			createdAt: daysAgo(54 + jobIndex * 5),
			updatedAt: daysAgo(53 + jobIndex * 5),
		});
		console.log("  ✓ Step 2: Site Visit creada");

		// ── STEP 3: Proposal ──────────────────────────────────────────────────
		const proposalCode = `P-${String(jobIndex).padStart(4, "0")}-2026`;
		const proposalItems = [
			{
				description: "Mano de obra especializada",
				quantity: 1,
				unit: "global",
				unitPrice: job.budget * 0.4,
				total: job.budget * 0.4,
			},
			{
				description: "Materiales y repuestos",
				quantity: 1,
				unit: "global",
				unitPrice: job.budget * 0.35,
				total: job.budget * 0.35,
			},
			{
				description: "Equipos y herramientas",
				quantity: 1,
				unit: "global",
				unitPrice: job.budget * 0.15,
				total: job.budget * 0.15,
			},
			{
				description: "Transporte y logística",
				quantity: 1,
				unit: "global",
				unitPrice: job.budget * 0.1,
				total: job.budget * 0.1,
			},
		];
		const subtotal = proposalItems.reduce((s, it) => s + it.total, 0);
		const taxRate = 0.19;
		const total = Math.round(subtotal * (1 + taxRate));

		const proposalStatus = job.stages === "proposal" ? "approved" : "approved";

		await db.collection("proposals").insertOne({
			_id: proposalId,
			code: proposalCode,
			title: `Propuesta: ${job.title}`,
			clientName: job.clientName,
			clientEmail: `compras@${job.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}.co`,
			status: proposalStatus,
			validUntil: daysFromNow(60),
			items: proposalItems,
			subtotal,
			taxRate,
			total,
			notes: `Propuesta generada tras visita técnica a ${job.location}.`,
			createdBy: USERS.residente ?? USERS.gerente,
			approvedBy: USERS.cliente,
			approvedAt: daysAgo(45 + jobIndex * 5),
			generatedOrders: job.stages === "proposal" ? [] : [orderId],
			createdAt: daysAgo(50 + jobIndex * 5),
			updatedAt: daysAgo(45 + jobIndex * 5),
		});
		createdProposals.push(proposalId);
		console.log("  ✓ Step 3: Propuesta creada (aprobada)");

		// If only proposal stage, link to service case and continue
		if (job.stages === "proposal") {
			await db.collection("service_cases").insertOne({
				_id: newId(),
				code: `SC-${String(jobIndex).padStart(4, "0")}-2026`,
				clientName: job.clientName,
				currentStage: "proposal",
				currentStepCode: "proposal_approved",
				artifacts: { proposalId, workRequestId, siteVisitId },
				timeline: [
					{ step: "work_request", completedAt: daysAgo(58 + jobIndex * 5) },
					{ step: "site_visit", completedAt: daysAgo(54 + jobIndex * 5) },
					{ step: "proposal", completedAt: daysAgo(45 + jobIndex * 5) },
					{ step: "proposal_approved", completedAt: daysAgo(45 + jobIndex * 5) },
				],
				createdAt: daysAgo(58 + jobIndex * 5),
				updatedAt: daysAgo(45 + jobIndex * 5),
			});
			continue; // Skip remaining steps for this job
		}

		// ── STEP 4: Purchase Order + Convert to Order ─────────────────────────
		const orderCode = `OT-${String(jobIndex).padStart(6, "0")}-2026`;

		// Purchase order
		await db.collection("purchaseorders").insertOne({
			_id: purchaseOrderId,
			code: `PO-${String(jobIndex).padStart(4, "0")}-2026`,
			proposalId: proposalId,
			poNumber: `PO-${2026}-${String(jobIndex * 100 + Math.floor(Math.random() * 99)).padStart(5, "0")}`,
			vendorName: job.clientName,
			amount: total,
			currency: "COP",
			description: `Orden de compra para ${job.title}`,
			status: "approved",
			issueDate: daysAgo(42 + jobIndex * 5),
			approvalDate: daysAgo(40 + jobIndex * 5),
			createdBy: USERS.administrativo ?? USERS.gerente,
			createdAt: daysAgo(42 + jobIndex * 5),
			updatedAt: daysAgo(40 + jobIndex * 5),
		});

		// Order
		await db.collection("orders").insertOne({
			_id: orderId,
			code: orderCode,
			type: job.type,
			status:
				job.stages === "order_created" ? "open" : job.stages === "full" ? "closed" : "assigned",
			priority: job.priority === "urgente" ? "urgent" : job.priority,
			description: job.description,
			assetId: job.assetCode,
			assetName: job.assetName,
			location: job.location,
			assignedTo: job.stages === "order_created" ? null : USERS.operador,
			assignedToName: job.stages === "order_created" ? null : "Luis Operador",
			supervisedBy: USERS.supervisor,
			materials: [
				{
					name: "Material principal",
					quantity: 1,
					unit: "lote",
					unitCost: job.budget * 0.3,
					delivered: job.stages !== "order_created",
				},
			],
			startedAt: job.stages === "order_created" ? null : daysAgo(30 + jobIndex * 5),
			completedAt: job.stages === "full" ? daysAgo(5) : null,
			observations: null,
			invoiceReady: job.stages === "full",
			reportGenerated: job.stages === "full",
			proposalId: proposalId,
			createdBy: USERS.residente ?? USERS.gerente,
			createdAt: daysAgo(38 + jobIndex * 5),
			updatedAt: job.stages === "full" ? daysAgo(5) : daysAgo(30 + jobIndex * 5),
		});
		createdOrders.push(orderId);
		console.log("  ✓ Step 4: Orden de trabajo creada (PO + Orden)");

		if (job.stages === "order_created") {
			await db.collection("service_cases").insertOne({
				_id: newId(),
				code: `SC-${String(jobIndex).padStart(4, "0")}-2026`,
				clientName: job.clientName,
				currentStage: "execution",
				currentStepCode: "order_created",
				artifacts: { proposalId, workRequestId, siteVisitId, purchaseOrderId, orderId },
				timeline: [
					{ step: "work_request", completedAt: daysAgo(58 + jobIndex * 5) },
					{ step: "site_visit", completedAt: daysAgo(54 + jobIndex * 5) },
					{ step: "proposal", completedAt: daysAgo(45 + jobIndex * 5) },
					{ step: "order_created", completedAt: daysAgo(38 + jobIndex * 5) },
				],
				createdAt: daysAgo(58 + jobIndex * 5),
				updatedAt: daysAgo(38 + jobIndex * 5),
			});
			continue;
		}

		// ── STEP 5: Planning Packet ───────────────────────────────────────────
		await db.collection("planningpackets").insertOne({
			_id: planningPacketId,
			workOrderId: orderId,
			responsibleInspectorId: USERS.supervisor,
			responsibleInspectorName: "Pedro Supervisor",
			place: job.location,
			plannedDate: daysAgo(28 + jobIndex * 5),
			businessUnit:
				jobIndex === 1 || jobIndex === 4
					? "MNT"
					: jobIndex === 2
						? "IT"
						: jobIndex === 3
							? "SC"
							: "GEN",
			scope: `Ejecución de ${job.title.toLowerCase()} en ${job.location}`,
			schedule: {
				plannedStartAt: daysAgo(28 + jobIndex * 5),
				plannedEndAt: daysAgo(25 + jobIndex * 5),
				estimatedDurationHours: job.type === "preventivo" ? 16 : 32,
			},
			crew: [
				{ userId: USERS.operador, name: "Luis Operador", role: "operador" },
				{ userId: USERS.tecnico, name: "María Técnica", role: "tecnico" },
			],
			supervisorId: USERS.supervisor,
			hesResponsibleId: USERS.hes,
			materials: [{ description: "Materiales según alcance", quantity: 1, unit: "lote" }],
			tools: [
				{ name: "Kit herramientas manuales", quantity: 2, available: true },
				{ name: "Multímetro digital", quantity: 1, available: true },
			],
			equipment: [{ name: "Camión plataforma", quantity: 1, available: true }],
			safetyElements: [
				{ description: "Arnés de seguridad", quantity: 3, unit: "unidad" },
				{ description: "Casco dieléctrico", quantity: 4, unit: "unidad" },
			],
			workerRequirements: {
				electricistas: job.type === "instalacion" ? 2 : 1,
				tecnicosTelecomunicacion:
					job.type === "preventivo" && job.assetCode === "ACT-TOR-001" ? 2 : 0,
				instrumentistas: job.type === "correctivo" ? 1 : 0,
				obreros: job.type === "instalacion" ? 2 : 1,
			},
			responsibles: [
				{
					role: "ingeniero_residente",
					userId: USERS.residente,
					name: "Ing. Residente Carlos",
					status: "signed",
				},
				{
					role: "tecnico_electricista",
					userId: USERS.tecnico,
					name: "María Técnica",
					status: "assigned",
				},
			],
			astRequired: job.type === "instalacion",
			ptwRequired: job.type === "correctivo" && job.priority === "alta",
			status: "approved",
			approvedBy: USERS.gerencia ?? USERS.gerente,
			approvedAt: daysAgo(26 + jobIndex * 5),
			planningNotes: `Planificación aprobada para ${job.title}. Tiempo estimado: ${job.type === "preventivo" ? "2 días" : "4 días"}.`,
			readinessChecklist: [
				{
					itemId: "1",
					label: "Personal asignado completo",
					checked: true,
					checkedBy: USERS.supervisor,
					checkedAt: daysAgo(27 + jobIndex * 5),
				},
				{
					itemId: "2",
					label: "Materiales disponibles en bodega",
					checked: true,
					checkedBy: USERS.supervisor,
					checkedAt: daysAgo(27 + jobIndex * 5),
				},
				{
					itemId: "3",
					label: "Permisos de trabajo gestionados",
					checked: true,
					checkedBy: USERS.hes,
					checkedAt: daysAgo(27 + jobIndex * 5),
				},
			],
			createdBy: USERS.residente ?? USERS.gerente,
			createdAt: daysAgo(30 + jobIndex * 5),
			updatedAt: daysAgo(26 + jobIndex * 5),
		});
		console.log("  ✓ Step 5: Planeación aprobada");

		if (job.stages === "execution" || job.stages === "delivery_signed" || job.stages === "full") {
			// ── STEP 6: Execution Session ─────────────────────────────────────────
			const execCode = `ES-${String(jobIndex).padStart(4, "0")}-2026`;
			const execStatus = job.stages === "execution" ? "in_progress" : "completed";
			const execDocs = job.stages === "execution" ? [] : [newId()]; // placeholder evidence ID

			await db.collection("executionsessions").insertOne({
				_id: execSessionId,
				code: execCode,
				workOrderId: orderId,
				planningPacketId: planningPacketId,
				status: execStatus,
				startedAt: daysAgo(25 + jobIndex * 5),
				pausedAt: null,
				resumedAt: null,
				completedAt: job.stages !== "execution" ? daysAgo(18 + jobIndex * 5) : null,
				startedBy: USERS.operador,
				completedBy: job.stages !== "execution" ? USERS.operador : null,
				assignedCrew: [USERS.operador, USERS.tecnico, USERS.supervisor],
				checklistResponses: [
					{
						responseId: "chk-1",
						checklistId: `CHK-${jobIndex}`,
						itemId: "item-1",
						label: "Verificar condiciones de seguridad",
						value: "ok",
						answeredAt: daysAgo(25 + jobIndex * 5),
						answeredBy: USERS.operador,
					},
					{
						responseId: "chk-2",
						checklistId: `CHK-${jobIndex}`,
						itemId: "item-2",
						label: "Inspeccionar área de trabajo",
						value: "ok",
						answeredAt: daysAgo(25 + jobIndex * 5),
						answeredBy: USERS.operador,
					},
				],
				materialsUsed: [
					{
						usageId: `mat-${jobIndex}-1`,
						name: "Material principal",
						quantityPlanned: 1,
						quantityUsed: 1,
						unit: "lote",
						notes: "Material utilizado según planeación",
						recordedAt: daysAgo(24 + jobIndex * 5),
						recordedBy: USERS.operador,
					},
				],
				laborEntries: [
					{
						laborEntryId: `lab-${jobIndex}-1`,
						userId: USERS.operador,
						role: "operador",
						startedAt: daysAgo(24 + jobIndex * 5),
						endedAt: daysAgo(24 + jobIndex * 5),
						durationMinutes: 480,
						description: "Ejecución de actividades principales",
						notes: "",
					},
					{
						laborEntryId: `lab-${jobIndex}-2`,
						userId: USERS.tecnico,
						role: "tecnico",
						startedAt: daysAgo(24 + jobIndex * 5),
						endedAt: daysAgo(24 + jobIndex * 5),
						durationMinutes: 480,
						description: "Apoyo técnico especializado",
						notes: "",
					},
				],
				incidents:
					job.stages === "execution"
						? []
						: [
								{
									incidentId: `inc-${jobIndex}-1`,
									type: "technical",
									severity: "low",
									description: "Se encontró desgaste adicional en componente no previsto",
									actionTaken:
										"Se documentó para informe y se procedió con reparación adicional autorizada",
									occurredAt: daysAgo(22 + jobIndex * 5),
									reportedBy: USERS.operador,
									resolved: true,
									resolvedAt: daysAgo(22 + jobIndex * 5),
									resolvedBy: USERS.supervisor,
								},
							],
				signatures:
					job.stages === "execution"
						? []
						: [
								{
									signatureId: `sig-${jobIndex}-1`,
									signedBy: USERS.operador,
									signedByName: "Luis Operador",
									role: "operador",
									signatureType: "execution_completion",
									signedAt: daysAgo(18 + jobIndex * 5),
									confirmed: true,
								},
							],
				evidenceIds: execDocs,
				gpsPoints: [
					{
						lat: 7.0 + jobIndex * 0.5,
						lng: -73.0 - jobIndex * 0.3,
						accuracy: 5,
						capturedAt: daysAgo(24 + jobIndex * 5),
					},
				],
				blockers: [],
				nextActions:
					job.stages === "execution"
						? [
								{
									code: "complete_execution",
									label: "Finalizar ejecución",
									route: `/execution/${orderId}`,
								},
							]
						: [{ code: "generate_report", label: "Generar informe técnico" }],
				offlineSyncStatus: "synced",
				clientMutationIds: [],
				createdBy: USERS.operador,
				createdAt: daysAgo(25 + jobIndex * 5),
				updatedAt:
					job.stages === "execution" ? daysAgo(20 + jobIndex * 5) : daysAgo(18 + jobIndex * 5),
			});
			createdExecSessions.push(execSessionId);
			console.log(
				`  ✓ Step 6: Ejecución ${job.stages === "execution" ? "en progreso" : "completada"}`,
			);

			if (job.stages === "execution") {
				await db.collection("service_cases").insertOne({
					_id: newId(),
					code: `SC-${String(jobIndex).padStart(4, "0")}-2026`,
					clientName: job.clientName,
					currentStage: "execution",
					currentStepCode: "execution_in_progress",
					artifacts: {
						proposalId,
						workRequestId,
						siteVisitId,
						purchaseOrderId,
						orderId,
						planningPacketId,
						executionSessionId: execSessionId,
					},
					timeline: [
						{ step: "work_request", completedAt: daysAgo(58 + jobIndex * 5) },
						{ step: "site_visit", completedAt: daysAgo(54 + jobIndex * 5) },
						{ step: "proposal", completedAt: daysAgo(45 + jobIndex * 5) },
						{ step: "order_created", completedAt: daysAgo(38 + jobIndex * 5) },
						{ step: "planning_approved", completedAt: daysAgo(26 + jobIndex * 5) },
						{ step: "execution_started", completedAt: daysAgo(25 + jobIndex * 5) },
					],
					blockers: [],
					nextActions: [{ code: "complete_execution", label: "Completar ejecución" }],
					createdAt: daysAgo(58 + jobIndex * 5),
					updatedAt: daysAgo(20 + jobIndex * 5),
				});
				continue;
			}

			// ── STEP 7: Evidence ─────────────────────────────────────────────────
			const evidenceEntries = [
				{ type: "foto", description: `Foto inicial del estado del ${job.assetName}` },
				{ type: "foto", description: "Proceso de intervención - paso 1" },
				{ type: "foto", description: "Proceso de intervención - paso 2" },
				{ type: "foto", description: `Estado final después de ${job.title.toLowerCase()}` },
				{ type: "documento", description: "Registro fotográfico completo" },
			];

			const evidenceIds = [];
			for (let e = 0; e < evidenceEntries.length; e++) {
				const evId = newId();
				evidenceIds.push(evId);
				await db.collection("evidences").insertOne({
					_id: evId,
					type: evidenceEntries[e].type,
					title: `${job.assetName} - ${evidenceEntries[e].description}`,
					description: evidenceEntries[e].description,
					workOrderId: orderId,
					executionSessionId: execSessionId,
					capturedAt: daysAgo(20 + jobIndex * 5 - e),
					capturedBy: USERS.operador,
					location: job.location,
					gps: {
						lat: 7.0 + jobIndex * 0.5 + e * 0.001,
						lng: -73.0 - jobIndex * 0.3 - e * 0.001,
						accuracy: 4,
					},
					tags: [job.type, job.assetCode.toLowerCase()],
					fileUrl: `https://storage.cermont.co/evidences/${jobIndex}/${evId}.jpg`,
					thumbnailUrl: `https://storage.cermont.co/evidences/${jobIndex}/${evId}_thumb.jpg`,
					mimeType: "image/jpeg",
					fileSize: 2_400_000 + e * 100_000,
					metadata: { resolution: "4032x3024", deviceId: `device-${300 + jobIndex}` },
					status: "active",
					createdAt: daysAgo(20 + jobIndex * 5 - e),
					updatedAt: daysAgo(20 + jobIndex * 5 - e),
				});
			}
			console.log(`  ✓ Step 7: ${evidenceIds.length} evidencias creadas`);

			if (job.stages === "delivery_signed" || job.stages === "full") {
				// ── STEP 8: Technical Report ─────────────────────────────────────────
				const techReportCode = `TR-${String(jobIndex).padStart(4, "0")}-2026`;
				const reportStatus = job.stages === "full" ? "approved" : "reviewed";

				await db.collection("technicalreports").insertOne({
					_id: techReportId,
					code: techReportCode,
					workOrderId: orderId,
					executionSessionId: execSessionId,
					executionSummary: `Se ejecutó ${job.title.toLowerCase()} en ${job.location}. Los trabajos se realizaron según lo planeado, cumpliendo con los estándares de calidad y seguridad establecidos. Se atendieron ${job.type === "correctivo" ? "fallas críticas" : "actividades preventivas"} del activo ${job.assetName}.`,
					activitiesPerformed: [
						"Inspección inicial y diagnóstico",
						"Ejecución de actividades programadas",
						"Pruebas de funcionamiento y calidad",
						"Limpieza y puesta a punto del área",
					],
					findings: [
						"Se encontraron condiciones operativas dentro de lo esperado",
						job.type === "correctivo"
							? "Componente desgastado reemplazado exitosamente"
							: "No se encontraron anomalías significativas",
						"Personal cumplió con todas las normas de seguridad",
					],
					deviations: [],
					evidenceIds,
					documentIds: [],
					generatedBy: USERS.tecnico,
					generatedAt: daysAgo(15 + jobIndex * 5),
					reviewedBy: USERS.supervisor,
					reviewedAt: daysAgo(14 + jobIndex * 5),
					approvedBy: job.stages === "full" ? USERS.residente : null,
					approvedAt: job.stages === "full" ? daysAgo(12 + jobIndex * 5) : null,
					status: reportStatus,
					clientMutationIds: [],
					fileAssets: [],
					createdAt: daysAgo(15 + jobIndex * 5),
					updatedAt: daysAgo(14 + jobIndex * 5),
				});
				createdTechReports.push(techReportId);
				console.log("  ✓ Step 8: Informe técnico generado");

				// ── STEP 9: Delivery Record ─────────────────────────────────────────
				const delivCode = `DR-${String(jobIndex).padStart(4, "0")}-2026`;
				const delivStatus = job.stages === "full" ? "signed" : "signed";

				await db.collection("deliveryrecords").insertOne({
					_id: deliveryRecordId,
					code: delivCode,
					workOrderId: orderId,
					technicalReportId: techReportId,
					deliveryDate: daysAgo(12 + jobIndex * 5),
					clientRepresentative: `Representante ${job.clientName}`,
					clientContact: `+57 300 987 65${String(jobIndex).padStart(2, "0")}`,
					acceptanceStatus: job.stages === "full" ? "accepted" : "pending",
					clientObservations:
						job.stages === "full"
							? "Trabajo recibido a satisfacción. Se agradece la pronta respuesta."
							: "En revisión por parte del cliente.",
					signedDocumentRef:
						job.stages === "full"
							? `https://storage.cermont.co/actas/${delivCode}-firmado.pdf`
							: null,
					signatureMethod: job.stages === "full" ? "digital" : null,
					signedAt: job.stages === "full" ? daysAgo(10 + jobIndex * 5) : null,
					signedBy: job.stages === "full" ? `Representante ${job.clientName}` : null,
					sentAt: daysAgo(12 + jobIndex * 5),
					sentBy: USERS.supervisor,
					status: delivStatus,
					clientMutationIds: [],
					fileAssets: [],
					createdAt: daysAgo(14 + jobIndex * 5),
					updatedAt:
						job.stages === "full" ? daysAgo(10 + jobIndex * 5) : daysAgo(12 + jobIndex * 5),
				});
				createdDeliveries.push(deliveryRecordId);
				console.log(
					"  ✓ Step 9-10: Acta de entrega " +
						(job.stages === "full" ? "firmada por el cliente" : "enviada al cliente"),
				);

				if (job.stages === "full") {
					// ── STEP 11: SES / Ariba ─────────────────────────────────────────
					const sesCode = `SES-${String(jobIndex).padStart(4, "0")}-2026`;
					const sesLines = [
						{
							description: `Servicio de ${job.title.toLowerCase()}`,
							quantity: 1,
							unit: "global",
							unitPrice: Math.round(subtotal * 0.7),
							total: Math.round(subtotal * 0.7),
						},
						{
							description: "Materiales e insumos",
							quantity: 1,
							unit: "global",
							unitPrice: Math.round(subtotal * 0.3),
							total: Math.round(subtotal * 0.3),
						},
					];
					const sesTotal = sesLines.reduce((s, l) => s + l.total, 0);
					const sesTax = Math.round(sesTotal * 0.19);
					const sesGrandTotal = sesTotal + sesTax;

					await db.collection("serviceentrysheets").insertOne({
						_id: sesId,
						code: sesCode,
						workOrderId: orderId,
						workOrderCode: orderCode,
						deliveryRecordId: deliveryRecordId,
						technicalReportId: techReportId,
						clientId: USERS.cliente,
						clientName: job.clientName,
						billingAccount: `CTO-${job.clientName.split(" ")[0].toUpperCase()}-${jobIndex}`,
						aribaReference: `ARIBA-${2026}-${String(jobIndex).padStart(5, "0")}`,
						aribaDocumentNumber: `DOC-ARIBA-${jobIndex}`,
						submittedAt: daysAgo(8 + jobIndex * 5),
						submittedBy: USERS.administrativo,
						approvedAt: daysAgo(6 + jobIndex * 5),
						approvedBy: USERS.cliente,
						approverReference: "Aprobado según contrato marco",
						amount: sesTotal,
						currency: "COP",
						taxAmount: sesTax,
						totalAmount: sesGrandTotal,
						serviceLines: sesLines,
						taxLines: [{ name: "IVA 19%", rate: 0.19, amount: sesTax }],
						status: "approved",
						attachments: [],
						commandHistory: [
							{
								clientMutationId: `cm-${jobIndex}-ses-1`,
								command: "create",
								recordedAt: daysAgo(8 + jobIndex * 5),
							},
							{
								clientMutationId: `cm-${jobIndex}-ses-2`,
								command: "submit",
								recordedAt: daysAgo(8 + jobIndex * 5),
							},
							{
								clientMutationId: `cm-${jobIndex}-ses-3`,
								command: "approve",
								recordedAt: daysAgo(6 + jobIndex * 5),
							},
						],
						createdBy: USERS.administrativo,
						updatedBy: USERS.administrativo,
						createdAt: daysAgo(9 + jobIndex * 5),
						updatedAt: daysAgo(6 + jobIndex * 5),
					});
					console.log("  ✓ Step 11: SES / Ariba aprobado");

					// ── STEP 12: Invoice ─────────────────────────────────────────
					const invoiceCode = `INV-${String(jobIndex).padStart(4, "0")}-2026`;
					const invoiceLines = [
						{
							description: `Honorarios: ${job.title}`,
							quantity: 1,
							unit: "global",
							unitPrice: Math.round(sesTotal * 0.7),
							total: Math.round(sesTotal * 0.7),
						},
						{
							description: "Reembolsos: materiales y logística",
							quantity: 1,
							unit: "global",
							unitPrice: Math.round(sesTotal * 0.3),
							total: Math.round(sesTotal * 0.3),
						},
					];
					const invTotal = invoiceLines.reduce((s, l) => s + l.total, 0);
					const invTax = Math.round(invTotal * 0.19);
					const invGrandTotal = invTotal + invTax;

					// Invoice numbers for electronic invoice
					const invNumber = `FV${2026}${String(jobIndex).padStart(8, "0")}`;

					await db.collection("invoices").insertOne({
						_id: invoiceId,
						code: invoiceCode,
						invoiceNumber: invNumber,
						workOrderId: orderId,
						workOrderCode: orderCode,
						serviceEntrySheetId: sesId,
						serviceEntrySheetCode: sesCode,
						clientId: USERS.cliente,
						clientName: job.clientName,
						billingAccount: `CTO-${job.clientName.split(" ")[0].toUpperCase()}-${jobIndex}`,
						amount: invTotal,
						taxAmount: invTax,
						totalAmount: invGrandTotal,
						subtotal: invGrandTotal,
						total: invGrandTotal,
						currency: "COP",
						issueDate: daysAgo(5 + jobIndex * 5),
						dueDate: daysFromNow(25 + jobIndex * 5),
						issuedAt: daysAgo(5 + jobIndex * 5),
						sentAt: daysAgo(5 + jobIndex * 5),
						submittedAt: daysAgo(5 + jobIndex * 5),
						approvedAt: daysAgo(3 + jobIndex * 5),
						approvedBy: USERS.administrativo,
						paidAt: daysAgo(1),
						paymentReference: `PAGO-${2026}-${String(jobIndex).padStart(6, "0")}`,
						invoiceLines,
						taxBreakdown: [{ name: "IVA 19%", rate: 0.19, amount: invTax }],
						lineItems: invoiceLines.map((l) => ({ ...l, discount: 0, subtotal: l.total })),
						ivaRate: 0.19,
						ivaAmount: invTax,
						taxBase: invTotal,
						retentionRate: 0.02,
						retentionAmount: Math.round(invTotal * 0.02),
						totalConIva: invGrandTotal,
						retencionFuente: Math.round(invTotal * 0.02),
						nitEmisor: "900.123.456-7",
						nitReceptor:
							job.clientName === "Ecopetrol S.A."
								? "899.999.123-1"
								: job.clientName === "TigoUne"
									? "800.456.789-2"
									: "860.789.456-3",
						tipoDocumento: "FV",
						cufe: crypto.randomBytes(32).toString("hex").substring(0, 96),
						paymentMethod: "bank_transfer",
						seller: {
							nit: "900.123.456-7",
							businessName: "CERMONT S.A.S.",
							address: "Cra 15 # 88-64, Bogotá D.C.",
							phone: "+57 601 345 6789",
							email: "facturacion@cermont.co",
						},
						buyer: {
							documentType: "NIT",
							documentNumber:
								job.clientName === "Ecopetrol S.A."
									? "899.999.123-1"
									: job.clientName === "TigoUne"
										? "800.456.789-2"
										: "860.789.456-3",
							businessName: job.clientName,
							address: "Calle Principal # 1-23",
							email: `compras@${job.clientName.toLowerCase().replace(/[^a-z0-9]/g, "")}.co`,
						},
						numeroResolucion: `RES-${2025}-${String(1000 + jobIndex)}`,
						status: "paid",
						attachments: [],
						commandHistory: [
							{
								clientMutationId: `cm-${jobIndex}-inv-1`,
								command: "create",
								recordedAt: daysAgo(5 + jobIndex * 5),
							},
							{
								clientMutationId: `cm-${jobIndex}-inv-2`,
								command: "issue",
								recordedAt: daysAgo(5 + jobIndex * 5),
							},
							{
								clientMutationId: `cm-${jobIndex}-inv-3`,
								command: "approve",
								recordedAt: daysAgo(3 + jobIndex * 5),
							},
						],
						notes: `Factura correspondiente a ${job.title} - ${job.location}`,
						createdBy: USERS.administrativo,
						createdAt: daysAgo(5 + jobIndex * 5),
						updatedAt: daysAgo(1),
					});
					console.log("  ✓ Step 12-13: Factura electrónica emitida y aprobada");

					// ── STEP 14: Payment ──────────────────────────────────────────────
					const paymentRef = `PAGO-CERMONT-${2026}-${String(jobIndex).padStart(6, "0")}`;

					await db.collection("payments").insertOne({
						_id: paymentId,
						invoiceId: invoiceId,
						workOrderId: orderId,
						serviceEntrySheetId: sesId,
						clientId: USERS.cliente,
						paymentReference: paymentRef,
						paidAt: daysAgo(1),
						amount: invGrandTotal,
						currency: "COP",
						paymentMethod: "bank_transfer",
						bankReference: `BANCO-${String(10000 + jobIndex)}`,
						supportingDocument: `Comprobante de pago ${paymentRef}`,
						recordedBy: USERS.administrativo,
						recordedAt: daysAgo(1),
						reconciledBy: USERS.administrativo,
						reconciledAt: now(),
						status: "reconciled",
						commandHistory: [
							{
								clientMutationId: `cm-${jobIndex}-pay-1`,
								command: "record",
								recordedAt: daysAgo(1),
							},
							{ clientMutationId: `cm-${jobIndex}-pay-2`, command: "reconcile", recordedAt: now() },
						],
						createdAt: daysAgo(1),
						updatedAt: now(),
					});
					console.log("  ✓ Step 14: Pago registrado y conciliado");

					// ── Service Case (Full flow) ────────────────────────────────
					await db.collection("service_cases").insertOne({
						_id: newId(),
						code: `SC-${String(jobIndex).padStart(4, "0")}-2026`,
						clientName: job.clientName,
						currentStage: "completed",
						currentStepCode: "payment_reconciled",
						artifacts: {
							proposalId,
							workRequestId,
							siteVisitId,
							purchaseOrderId,
							orderId,
							planningPacketId,
							executionSessionId: execSessionId,
							evidenceIds,
							technicalReportId: techReportId,
							deliveryRecordId,
							serviceEntrySheetId: sesId,
							invoiceId,
							paymentId,
						},
						timeline: [
							{ step: "work_request", completedAt: daysAgo(58 + jobIndex * 5) },
							{ step: "site_visit", completedAt: daysAgo(54 + jobIndex * 5) },
							{ step: "proposal_approved", completedAt: daysAgo(45 + jobIndex * 5) },
							{ step: "order_created", completedAt: daysAgo(38 + jobIndex * 5) },
							{ step: "planning_approved", completedAt: daysAgo(26 + jobIndex * 5) },
							{ step: "execution_completed", completedAt: daysAgo(18 + jobIndex * 5) },
							{ step: "report_generated", completedAt: daysAgo(15 + jobIndex * 5) },
							{ step: "delivery_signed", completedAt: daysAgo(10 + jobIndex * 5) },
							{ step: "ses_approved", completedAt: daysAgo(6 + jobIndex * 5) },
							{ step: "invoice_approved", completedAt: daysAgo(3 + jobIndex * 5) },
							{ step: "payment_reconciled", completedAt: now() },
						],
						blockers: [],
						nextActions: [],
						createdAt: daysAgo(58 + jobIndex * 5),
						updatedAt: now(),
					});
				} else {
					// Service case for delivery_signed state
					await db.collection("service_cases").insertOne({
						_id: newId(),
						code: `SC-${String(jobIndex).padStart(4, "0")}-2026`,
						clientName: job.clientName,
						currentStage: "closure",
						currentStepCode: "delivery_signed",
						artifacts: {
							proposalId,
							workRequestId,
							siteVisitId,
							purchaseOrderId,
							orderId,
							planningPacketId,
							executionSessionId: execSessionId,
							evidenceIds,
							technicalReportId: techReportId,
							deliveryRecordId,
						},
						timeline: [
							{ step: "work_request", completedAt: daysAgo(58 + jobIndex * 5) },
							{ step: "site_visit", completedAt: daysAgo(54 + jobIndex * 5) },
							{ step: "proposal_approved", completedAt: daysAgo(45 + jobIndex * 5) },
							{ step: "order_created", completedAt: daysAgo(38 + jobIndex * 5) },
							{ step: "planning_approved", completedAt: daysAgo(26 + jobIndex * 5) },
							{ step: "execution_completed", completedAt: daysAgo(18 + jobIndex * 5) },
							{ step: "report_generated", completedAt: daysAgo(15 + jobIndex * 5) },
							{ step: "delivery_signed", completedAt: daysAgo(10 + jobIndex * 5) },
						],
						blockers: [],
						nextActions: [
							{ code: "generate_ses", label: "Generar SES/Ariba" },
							{ code: "generate_invoice", label: "Generar factura" },
						],
						createdAt: daysAgo(58 + jobIndex * 5),
						updatedAt: daysAgo(10 + jobIndex * 5),
					});
				}
			} else {
				// Service case for initial execution
				await db.collection("service_cases").insertOne({
					_id: newId(),
					code: `SC-${String(jobIndex).padStart(4, "0")}-2026`,
					clientName: job.clientName,
					currentStage: "execution",
					currentStepCode: "execution_completed",
					artifacts: {
						proposalId,
						workRequestId,
						siteVisitId,
						purchaseOrderId,
						orderId,
						planningPacketId,
						executionSessionId: execSessionId,
						evidenceIds,
					},
					timeline: [
						{ step: "work_request", completedAt: daysAgo(58 + jobIndex * 5) },
						{ step: "site_visit", completedAt: daysAgo(54 + jobIndex * 5) },
						{ step: "proposal_approved", completedAt: daysAgo(45 + jobIndex * 5) },
						{ step: "order_created", completedAt: daysAgo(38 + jobIndex * 5) },
						{ step: "planning_approved", completedAt: daysAgo(26 + jobIndex * 5) },
						{ step: "execution_completed", completedAt: daysAgo(18 + jobIndex * 5) },
					],
					blockers: [],
					nextActions: [{ code: "generate_report", label: "Generar informe técnico" }],
					createdAt: daysAgo(58 + jobIndex * 5),
					updatedAt: daysAgo(18 + jobIndex * 5),
				});
			}
		}
	}

	// ── Update counters for realistic sequence values ───────────────────────
	await db.collection("counters").updateOne({ _id: "orderCode" }, { $set: { seq: 5 } });
	await db.collection("counters").updateOne({ _id: "proposalCode" }, { $set: { seq: 5 } });

	console.log("\n══════════════════════════════════════════════════════════");
	console.log("  🌱 SEED COMPLETADO EXITOSAMENTE");
	console.log("══════════════════════════════════════════════════════════");
	console.log("");
	console.log("  Resumen de datos insertados:");
	console.log(`  • 5 Work Requests (estados: approved)`);
	console.log(`  • 5 Site Visits (completadas)`);
	console.log(`  • 5 Proposals (aprobadas)`);
	console.log(`  • 5 Purchase Orders (aprobadas)`);
	console.log(`  • 5 Work Orders (en diferentes estados del ciclo)`);
	console.log(`  • 5 Planning Packets (aprobados)`);
	console.log(`  • 5 Execution Sessions (3 completadas, 1 en progreso)`);
	console.log(`  • ~25 Evidences (5 por trabajo completo)`);
	console.log(`  • 3 Technical Reports (generados y revisados)`);
	console.log(`  • 3 Delivery Records (enviados, 1 firmado)`);
	console.log(`  • 1 SES / Ariba (aprobado)`);
	console.log(`  • 1 Factura electrónica (emitida y pagada)`);
	console.log(`  • 1 Pago (conciliado)`);
	console.log(`  • 5 Service Cases (1 completo, 4 en diferentes etapas)`);
	console.log(`  • 5 Assets (activos maestros)`);
	console.log(`  • 7 Resources (materiales e insumos)`);
	console.log("");
	console.log("  Distribución de trabajos por etapa del flujo:");
	console.log("  ┌─────┬────────────────────────────────────┬──────────────────────────────┐");
	console.log("  │  #  │ Trabajo                           │ Etapa actual                  │");
	console.log("  ├─────┼────────────────────────────────────┼──────────────────────────────┤");
	console.log("  │  1  │ Mantenimiento Bomba - Caño Limón   │ ✅ Completo (14 pasos)        │");
	console.log("  │  2  │ Instalación Transformador - B/ja   │ ⏳ Acta firmada (paso 10/14)  │");
	console.log("  │  3  │ Mantenimiento Torre - B/manga      │ 🔧 Ejecución (paso 6/14)     │");
	console.log("  │  4  │ Reparación Compresor - Bogotá      │ 📋 Orden abierta (paso 4/14)  │");
	console.log("  │  5  │ Mantenimiento Paneles - Yopal      │ 📄 Propuesta (paso 3/14)     │");
	console.log("  └─────┴────────────────────────────────────┴──────────────────────────────┘");
	console.log("");

	await client.close();
}

main().catch((err) => {
	console.error("❌ Error durante seed:", err);
	process.exit(1);
});
