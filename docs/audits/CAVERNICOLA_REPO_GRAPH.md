# CAVERNICOLA REPO GRAPH — Cermont S.A.S.

## 1. System Architecture Diagram

This diagram displays the complete network of workspaces, shared contracts, Mongoose collections, API paths, and React query hooks mapping the 14-step Cermont S.A.S. operational lifecycle.

```mermaid
flowchart TD
  %% Workspaces
  subgraph Workspaces
    WS_Backend["backend (Express 5.2.1)"]
    WS_Frontend["frontend (Next.js 16.2.4 PWA)"]
    WS_Shared["packages/shared-types (Zod 4)"]
    WS_Domain["packages/domain (RBAC)"]
  end

  %% Frontend layer
  subgraph Frontend UI
    Route_DR["/delivery-records"]
    Component_DR["DeliveryRecordsPageContent"]
    Hook_DR["useDeliveryRecordsList"]
    Client_API["apiClient"]
  end

  %% Backend layer
  subgraph Backend Modules
    Endpoint_DR["GET /api/delivery-records"]
    Route_BE["deliveryRecordRoutes"]
    Controller_DR["listDeliveryRecords"]
    Service_DR["administrativeWorkflowService"]
    Model_DR["DeliveryRecord Model"]
  end

  %% Persistency
  subgraph DB Collections & Storage
    Collection_DR[(deliveryrecords collection)]
    Store_Sync[(sync_queue store)]
    Store_Blob[(blob_outbox store)]
  end

  %% Connections
  WS_Shared -->|types & validates| WS_Backend
  WS_Shared -->|types & validates| WS_Frontend
  WS_Domain -->|governs permissions| WS_Backend
  WS_Domain -->|governs routes| WS_Frontend
  
  Route_DR -->|renders| Component_DR
  Component_DR -->|uses| Hook_DR
  Hook_DR -->|calls| Client_API
  Client_API -->|requests| Endpoint_DR
  
  Endpoint_DR -->|handled by| Route_BE
  Route_BE -->|invokes| Controller_DR
  Controller_DR -->|delegates to| Service_DR
  Service_DR -->|queries Mongoose| Model_DR
  Model_DR -->|maps to| Collection_DR

  %% Offline outbox
  Component_DR -.->|offline queue| Store_Sync
  Component_DR -.->|offline photo outbox| Store_Blob
  Store_Sync -.->|syncs| Client_API
  Store_Blob -.->|syncs| Client_API
```

---

## 2. Relationships Table

| Source Node | Relation | Target Node | Context / Details |
|-------------|----------|-------------|-------------------|
| `workspace.shared-types` | validates | `backend.route.deliveryRecord` | Validates query strings and request bodies at network entry. |
| `frontend.route.deliveryRecords` | renders | `frontend.component.DeliveryRecordsPageContent` | Direct React page component. |
| `frontend.component.DeliveryRecordsPageContent` | uses | `frontend.hook.useDeliveryRecordsList` | Hook manages TanStack Query state. |
| `frontend.hook.useDeliveryRecordsList` | calls | `frontend.apiClient` | Sends authenticated AJAX GET request. |
| `frontend.apiClient` | requests | `backend.route.deliveryRecord` | Endpoint URL `/api/delivery-records`. |
| `backend.route.deliveryRecord` | invokes | `backend.controller.WorkflowController.listDeliveryRecords` | Handles route parameters. |
| `backend.controller.WorkflowController.listDeliveryRecords` | delegates | `backend.service.administrativeWorkflow` | Invokes transactional business logic. |
| `backend.service.administrativeWorkflow` | queries | `backend.model.DeliveryRecord` | Retreives data from MongoDB. |
| `backend.model.DeliveryRecord` | maps to | `mongodb.collection.deliveryrecords` | Underneath Mongoose collection structure. |

---

## 3. Visual & Architectural Integrity

Every visual modification (Stitch proposal) and every schema extension (FileAssetRef) must be mapped to this graph before implementation. The graph acts as the repo's single source of truth for traceability.
