# CAVERNICOLA DB MODEL MAP — Cermont S.A.S.

## 1. Mongoose Model Inventory

This index details the core Mongoose schemas mapped in the backend (`backend/src/models/`), their target MongoDB collections, and their role in the 14-step operational workflow.

| Model Name | MongoDB Collection | Key Attributes / Fields | Core Indexing | Relation / References |
|------------|--------------------|-------------------------|---------------|-----------------------|
| **User** | `users` | `email`, `passwordHash`, `role` (OMNIPOTENTE.. CLI), `isActive` | `{ email: 1 }` (unique) | Checked by authentication middlewares. |
| **ServiceCase** | `servicecases` | `code`, `status`, `stage` (intake.. paid), `workOrderId` | `{ code: 1 }` (unique) | Orquestador central (Hub) linking all documents. |
| **WorkRequest** | `workrequests` | `code`, `clientName`, `serviceType`, `status`, `visitPlanned` | `{ code: 1 }` | Paso 1 - Solicitud de cliente. |
| **SiteVisit** | `sitevisits` | `code`, `workRequestId`, `visitDate`, `status`, `photos` | `{ workRequestId: 1 }` | Paso 2 - Visita técnica y registro fotográfico. |
| **Proposal** | `proposals` | `code`, `serviceCaseId`, `items`, `totalAmount`, `status` | `{ serviceCaseId: 1 }` | Paso 3 - Propuesta económica. |
| **PurchaseOrder** | `purchaseorders` | `code`, `proposalId`, `documentRef`, `status` | `{ proposalId: 1 }` | Paso 4 - Orden de compra y aprobación. |
| **PlanningPacket** | `planningpackets` | `code`, `orderId`, `resources`, `kits`, `status` | `{ orderId: 1 }` | Paso 5 - Planeación y asignación de recursos. |
| **Order** | `orders` | `code`, `serviceCaseId`, `status`, `assignedTo`, `costs` | `{ serviceCaseId: 1 }` | Paso 5/6 - Orden de trabajo (OT) activa. |
| **ExecutionSession** | `executionsessions` | `orderId`, `status`, `checklists`, `materialsUsed`, `hours` | `{ orderId: 1 }` | Paso 6 - Ejecución en campo (Offline-First). |
| **Evidence** | `evidences` | `code`, `workOrderId`, `photos` (FileAssetRefs), `category` | `{ workOrderId: 1 }` | Paso 6/7 - Evidencias fotográficas y trazabilidad. |
| **TechnicalReport** | `technicalreports` | `code`, `workOrderId`, `photographicEvidence`, `status` | `{ workOrderId: 1 }` | Paso 7 - Informe técnico final. |
| **DeliveryRecord** | `deliveryrecords` | `code`, `workOrderId`, `status`, `signedBy`, `signature` | `{ workOrderId: 1 }` | Pasos 8-9 - Acta de entrega y firma del cliente. |
| **ServiceEntrySheet** | `serviceentrysheets` | `code`, `workOrderId`, `aribaDocumentNumber`, `totalAmount` | `{ workOrderId: 1 }` | Pasos 10-11 - SES en Ariba y aprobación. |
| **Invoice** | `invoices` | `code`, `invoiceNumber`, `totalAmount`, `status`, `pdfRef` | `{ invoiceNumber: 1 }` | Pasos 12-13 - Facturación y aprobación de factura. |
| **Payment** | `payments` | `paymentReference`, `invoiceId`, `amount`, `status` | `{ invoiceId: 1 }` | Paso 14 - Recibo de pago y cierre. |
| **FileAsset** | `file_assets` | `id`, `originalName`, `storedName`, `mimeType`, `url`, `uploadedBy` | `{ entityType: 1, entityId: 1 }` | Almacenamiento centralizado de metadatos de archivos. |
| **Kit** | `kits` | `name`, `description`, `category`, `items` (embedded image) | `{ category: 1 }` | Kits de recursos preconfigurados. |
| **Tool** | `tools` | `name`, `serialNumber`, `image`, `gallery` (embedded refs) | `{ serialNumber: 1 }` | Herramientas y equipos. |

---

## 2. File Assets Embedding Pattern

Per **DOC-CANON-07**, files are not kept solely in isolation. They are cataloged in `file_assets` and embedded as Lightweight Denormalized references (`FileAssetRefSchema`) directly inside parent documents:

```javascript
// FileAssetRefSchema Embedded Shape
{
  id: String,
  originalName: String,
  storedName: String,
  mimeType: String,
  sizeBytes: Number,
  url: String,
  storageKey: String,
  uploadedBy: String,
  uploadedAt: String,
  entityType: String,
  entityId: String,
  category: String
}
```

This guarantees fast parent document reads (no `$lookup` or join operations required), ensuring excellent performance even on offline clients restoring their persisted cache.
