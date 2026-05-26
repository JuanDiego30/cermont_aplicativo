#!/usr/bin/env tsx
/**
 * TASK 0.2 - Migration Script: Normalize Domain Vocabulary
 *
 * This script automates the renaming of legacy domain names to canonical names:
 * - KitTipico → MaintenanceKit
 * - WorkOrderSchema → OrderSchema
 * - trabajoId → orderId
 *
 * Usage:
 *   npx tsx tooling/backend-scripts/migrations/normalize-domain-vocabulary.ts
 *
 * Pre-requisites:
 * - Git branch is up to date
 * - All files are committed
 * - Backup created
 */

import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "../../..");
const DRY_RUN = process.argv.includes("--dry-run");

// Colors for console output
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message: string) {
	log(`❌ ${message}`, "red");
}

function logSuccess(message: string) {
	log(`✅ ${message}`, "green");
}

function logInfo(message: string) {
	log(`ℹ️  ${message}`, "blue");
}

function logWarning(message: string) {
	log(`⚠️  ${message}`, "yellow");
}

// 1. Rename Model Files
function renameModelFiles() {
	logInfo("Paso 1: Renombrando archivos de modelo...");

	const modelDir = path.join(ROOT, "apps/backend/src/models");

	// KitTipico.ts → MaintenanceKit.ts
	const kitTipicoPath = path.join(modelDir, "KitTipico.ts");
	const maintenanceKitPath = path.join(modelDir, "MaintenanceKit.ts");

	if (fs.existsSync(kitTipicoPath)) {
		if (!DRY_RUN) {
			fs.renameSync(kitTipicoPath, maintenanceKitPath);
			logSuccess("Renombrado: KitTipico.ts → MaintenanceKit.ts");
		} else {
			logInfo(`[DRY-RUN] Renombrar: KitTipico.ts → MaintenanceKit.ts`);
		}
	} else {
		logWarning("KitTipico.ts no encontrado (ya fue migrado o no existe)");
	}
}

// 2. Update Service Files
function updateServiceFiles() {
	logInfo("Paso 2: Actualizando services...");

	const serviceDir = path.join(ROOT, "apps/backend/src/services");

	// kit.service.ts → maintenance.service.ts
	const kitServicePath = path.join(serviceDir, "kit.service.ts");
	const maintenanceServicePath = path.join(serviceDir, "maintenance.service.ts");

	if (fs.existsSync(kitServicePath)) {
		const content = fs.readFileSync(kitServicePath, "utf-8");

		// Replace class name and exports
		const updated = content
			.replace(/export class KitService/g, "export class MaintenanceKitService")
			.replace(/KitTipico/g, "MaintenanceKit")
			.replace(/IKitTipico/g, "IMaintenanceKit");

		if (!DRY_RUN) {
			fs.writeFileSync(maintenanceServicePath, updated, "utf-8");
			fs.unlinkSync(kitServicePath);
			logSuccess("Actualizado: kit.service.ts → maintenance.service.ts");
		} else {
			logInfo(`[DRY-RUN] Actualizar: kit.service.ts → maintenance.service.ts`);
		}
	}
}

// 3. Update Controller Files
function updateControllerFiles() {
	logInfo("Paso 3: Actualizando controllers...");

	const controllerDir = path.join(ROOT, "apps/backend/src/controllers");

	// kitController.ts → maintenanceController.ts
	const kitControllerPath = path.join(controllerDir, "kitController.ts");
	const maintenanceControllerPath = path.join(controllerDir, "maintenanceController.ts");

	if (fs.existsSync(kitControllerPath)) {
		const content = fs.readFileSync(kitControllerPath, "utf-8");

		const updated = content
			.replace(
				/import.*KitService/g,
				"import { MaintenanceKitService } from '../services/maintenance.service';",
			)
			.replace(/export class KitController/g, "export class MaintenanceKitController")
			.replace(/KitService/g, "MaintenanceKitService")
			.replace(/IKitTipico/g, "IMaintenanceKit");

		if (!DRY_RUN) {
			fs.writeFileSync(maintenanceControllerPath, updated, "utf-8");
			fs.unlinkSync(kitControllerPath);
			logSuccess("Actualizado: kitController.ts → maintenanceController.ts");
		} else {
			logInfo(`[DRY-RUN] Actualizar: kitController.ts → maintenanceController.ts`);
		}
	}
}

// 4. Update Route Files
function updateRouteFiles() {
	logInfo("Paso 4: Actualizando routes...");

	const routeDir = path.join(ROOT, "apps/backend/src/routes");

	// kitRoutes.ts → maintenanceRoutes.ts
	const kitRoutesPath = path.join(routeDir, "kitRoutes.ts");
	const maintenanceRoutesPath = path.join(routeDir, "maintenanceRoutes.ts");

	if (fs.existsSync(kitRoutesPath)) {
		const content = fs.readFileSync(kitRoutesPath, "utf-8");

		const updated = content
			.replace(
				/import.*KitController/g,
				"import { MaintenanceKitController } from '../controllers/maintenanceController';",
			)
			.replace(/KitController/g, "MaintenanceKitController")
			.replace(/\/kits/g, "/maintenance/kits");

		if (!DRY_RUN) {
			fs.writeFileSync(maintenanceRoutesPath, updated, "utf-8");
			fs.unlinkSync(kitRoutesPath);
			logSuccess("Actualizado: kitRoutes.ts → maintenanceRoutes.ts");
		} else {
			logInfo(`[DRY-RUN] Actualizar: kitRoutes.ts → maintenanceRoutes.ts`);
		}
	}
}

// 5. Update Validation Files
function updateValidationFiles() {
	logInfo("Paso 5: Actualizando validaciones...");

	const validationDir = path.join(ROOT, "apps/backend/src/validations");
	const maintenanceValidationPath = path.join(validationDir, "maintenance.validation.ts");

	if (fs.existsSync(maintenanceValidationPath)) {
		const content = fs.readFileSync(maintenanceValidationPath, "utf-8");

		// Check if already using shared-types
		if (content.includes("@cermont/shared-types")) {
			logSuccess("maintenance.validation.ts ya usa shared-types");
		} else {
			logWarning("maintenance.validation.ts necesita actualizar imports");
		}
	}
}

// 6. Update Frontend Pages (trabajoId → orderId)
function updateFrontendPages() {
	logInfo("Paso 6: Actualizando páginas frontend...");

	const costsDir = path.join(ROOT, "apps/frontend/app/(dashboard)/costs");
	const oldTrabajoIdDir = path.join(costsDir, "[trabajoId]");
	const newOrderIdDir = path.join(costsDir, "[orderId]");

	if (fs.existsSync(oldTrabajoIdDir)) {
		if (!DRY_RUN) {
			// Rename directory
			fs.renameSync(oldTrabajoIdDir, newOrderIdDir);
			logSuccess("Renombrado: [trabajoId] → [orderId]");
		} else {
			logInfo(`[DRY-RUN] Renombrar: [trabajoId] → [orderId]`);
		}
	} else {
		logWarning("Directorio [trabajoId] no encontrado (ya fue migrado o no existe)");
	}
}

// 7. Update Shared-types (WorkOrderSchema → OrderSchema)
function updateSharedTypes() {
	logInfo("Paso 7: Actualizando shared-types...");

	const zodDir = path.join(ROOT, "packages/shared-types/src/zod");
	const workOrderSchemaPath = path.join(zodDir, "WorkOrderSchema.ts");
	const orderSchemaPath = path.join(zodDir, "OrderSchema.ts");

	if (fs.existsSync(workOrderSchemaPath)) {
		if (!DRY_RUN) {
			fs.renameSync(workOrderSchemaPath, orderSchemaPath);
			logSuccess("Renombrado: WorkOrderSchema.ts → OrderSchema.ts");
		} else {
			logInfo(`[DRY-RUN] Renombrar: WorkOrderSchema.ts → OrderSchema.ts`);
		}

		// Update exports in index.ts
		const indexFile = path.join(zodDir, "index.ts");
		if (fs.existsSync(indexFile)) {
			let content = fs.readFileSync(indexFile, "utf-8");
			content = content.replace(/WorkOrderSchema/g, "OrderSchema");

			if (!DRY_RUN) {
				fs.writeFileSync(indexFile, content, "utf-8");
				logSuccess("Actualizado: index.ts exports");
			} else {
				logInfo(`[DRY-RUN] Actualizar: index.ts exports`);
			}
		}
	}
}

// 8. Update all imports across codebase
function updateAllImports() {
	logInfo("Paso 8: Actualizando todos los imports en el codebase...");

	const filesToUpdate: string[] = [];

	function walkDir(dir: string): void {
		const files = fs.readdirSync(dir);

		files.forEach((file) => {
			const filePath = path.join(dir, file);
			const stat = fs.statSync(filePath);

			if (stat.isDirectory()) {
				if (!file.startsWith(".") && !file.includes("node_modules")) {
					walkDir(filePath);
				}
			} else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
				filesToUpdate.push(filePath);
			}
		});
	}

	walkDir(path.join(ROOT, "apps/backend/src"));
	walkDir(path.join(ROOT, "apps/frontend/src"));
	walkDir(path.join(ROOT, "packages/shared-types/src"));

	let updatedCount = 0;

	filesToUpdate.forEach((filePath) => {
		let content = fs.readFileSync(filePath, "utf-8");
		const original = content;

		// Replace KitTipico imports and references
		content = content.replace(/import.*KitTipico/g, "import { MaintenanceKit }");
		content = content.replace(/from.*KitTipico/g, "from '../models/MaintenanceKit'");
		content = content.replace(/KitTipico\./g, "MaintenanceKit.");
		content = content.replace(/IKitTipico/g, "IMaintenanceKit");

		// Replace WorkOrderSchema references
		content = content.replace(/WorkOrderSchema/g, "OrderSchema");
		content = content.replace(/IWorkOrder/g, "IOrder");
		content = content.replace(/IOrdenTrabajo/g, "IOrder");

		if (content !== original) {
			if (!DRY_RUN) {
				fs.writeFileSync(filePath, content, "utf-8");
				updatedCount++;
			}
		}
	});

	logSuccess(`Actualizados ${updatedCount} archivos con imports corregidos`);
}

// Main execution
async function main() {
	logInfo("🚀 Iniciando migración de vocabulario de dominio...");
	logInfo(`Modo: ${DRY_RUN ? "DRY-RUN (sin cambios reales)" : "EJECUCIÓN (cambios reales)"}`);

	try {
		// Phase 1: Backend
		renameModelFiles();
		updateServiceFiles();
		updateControllerFiles();
		updateRouteFiles();
		updateValidationFiles();

		// Phase 2: Shared-types
		updateSharedTypes();

		// Phase 3: Frontend
		updateFrontendPages();

		// Phase 4: Update all imports
		updateAllImports();

		logSuccess("✅ Migración completada exitosamente");
		logInfo("📝 Siguientes pasos:");
		logInfo("   1. Ejecutar: npm run typecheck");
		logInfo("   2. Ejecutar: npm run lint");
		logInfo("   3. Ejecutar: npm run test");
		logInfo("   4. Revisar cambios en git");
		logInfo('   5. Commit: "TASK 0.2: Normalize domain vocabulary"');
	} catch (error) {
		logError(`Error durante la migración: ${error}`);
		process.exit(1);
	}
}

main();
