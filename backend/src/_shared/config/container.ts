/**
 * Dependency Injection Container
 *
 * Singleton registry for all repository implementations.
 * Services receive repository interfaces via constructor/function parameters,
 * resolved from this container at wiring time.
 *
 * Usage:
 *   import { container } from "../../_shared/config/container";
 *   const userRepo = container.userRepository;
 */

import type { IAuditLogRepository } from "../../audit/domain/audit-log.repository";
import { AuditLogRepository } from "../../audit/infrastructure/audit-log.repository.impl";
import type { ITokenRepository } from "../../auth/domain/token.repository";
import type { IUserRepository } from "../../auth/domain/user.repository";
import { TokenRepository } from "../../auth/infrastructure/token.repository.impl";
import { UserRepository } from "../../auth/infrastructure/user.repository.impl";
import type { IChecklistRepository } from "../../checklists/domain/checklist.repository";
import type { IChecklistTemplateRepository } from "../../checklists/domain/template.repository";
import { ChecklistRepository } from "../../checklists/infrastructure/checklist.repository.impl";
import { ChecklistTemplateRepository } from "../../checklists/infrastructure/template.repository.impl";
import type { ICostRepository } from "../../costs/domain/cost.repository";
import type { ICostControlRepository } from "../../costs/domain/cost-control.repository";
import type { ITariffRepository } from "../../costs/domain/tariff.repository";
import { CostRepository } from "../../costs/infrastructure/cost.repository.impl";
import { CostControlRepository } from "../../costs/infrastructure/cost-control.repository.impl";
import { TariffRepository } from "../../costs/infrastructure/tariff.repository.impl";
import type { IDocumentRepository } from "../../documents/domain/document.repository";
import { DocumentRepository } from "../../documents/infrastructure/document.repository.impl";
import type { IEvidenceRepository } from "../../evidences/domain/evidence.repository";
import { EvidenceRepository } from "../../evidences/infrastructure/evidence.repository.impl";
import type { IInspectionRepository } from "../../inspections/domain/inspection.repository";
import { InspectionRepository } from "../../inspections/infrastructure/inspection.repository.impl";
import type { IMaintenanceKitRepository } from "../../maintenance/domain/maintenance-kit.repository";
import { MaintenanceKitRepository } from "../../maintenance/infrastructure/maintenance-kit.repository.impl";
import type { ICounterRepository } from "../../orders/domain/counter.repository";
import type { IOrderRepository } from "../../orders/domain/order.repository";
import type { IOrderArchiveRepository } from "../../orders/domain/order-archive.repository";
import { CounterRepository } from "../../orders/infrastructure/counter.repository.impl";
import { OrderRepository } from "../../orders/infrastructure/order.repository.impl";
import { OrderArchiveRepository } from "../../orders/infrastructure/order-archive.repository.impl";
import type { IProposalRepository } from "../../proposals/domain/proposal.repository";
import { ProposalRepository } from "../../proposals/infrastructure/proposal.repository.impl";
import type { IWorkReportRepository } from "../../reports/domain/work-report.repository";
import { WorkReportRepository } from "../../reports/infrastructure/work-report.repository.impl";
import type { IResourceRepository } from "../../resources/domain/resource.repository";
import { ResourceRepository } from "../../resources/infrastructure/resource.repository.impl";

export interface RepositoryContainer {
	userRepository: IUserRepository;
	tokenRepository: ITokenRepository;
	orderRepository: IOrderRepository;
	orderArchiveRepository: IOrderArchiveRepository;
	counterRepository: ICounterRepository;
	checklistRepository: IChecklistRepository;
	checklistTemplateRepository: IChecklistTemplateRepository;
	costControlRepository: ICostControlRepository;
	costRepository: ICostRepository;
	tariffRepository: ITariffRepository;
	evidenceRepository: IEvidenceRepository;
	documentRepository: IDocumentRepository;
	inspectionRepository: IInspectionRepository;
	proposalRepository: IProposalRepository;
	resourceRepository: IResourceRepository;
	maintenanceKitRepository: IMaintenanceKitRepository;
	auditLogRepository: IAuditLogRepository;
	workReportRepository: IWorkReportRepository;
}

export const container: RepositoryContainer = {
	userRepository: new UserRepository(),
	tokenRepository: new TokenRepository(),
	orderRepository: new OrderRepository(),
	orderArchiveRepository: new OrderArchiveRepository(),
	counterRepository: new CounterRepository(),
	checklistRepository: new ChecklistRepository(),
	checklistTemplateRepository: new ChecklistTemplateRepository(),
	costControlRepository: new CostControlRepository(),
	costRepository: new CostRepository(),
	tariffRepository: new TariffRepository(),
	evidenceRepository: new EvidenceRepository(),
	documentRepository: new DocumentRepository(),
	inspectionRepository: new InspectionRepository(),
	proposalRepository: new ProposalRepository(),
	resourceRepository: new ResourceRepository(),
	maintenanceKitRepository: new MaintenanceKitRepository(),
	auditLogRepository: new AuditLogRepository(),
	workReportRepository: new WorkReportRepository(),
};
