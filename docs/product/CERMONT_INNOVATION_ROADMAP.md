# Innovation Roadmap — Cermont S.A.S.

This roadmap details 10 strategic innovation modules planned for the evolution of the Cermont S.A.S. platform.

---

## 10-Idea Evaluation Matrix

| Idea | Problem Addressed | Impacted Modules | MVP Scope | Required Data | Risk | Impact | Priority |
|---|---|---|---|---|---|---|---|
| **1. Cermont OS Cockpit** | Scattered view of work orders and workflow steps. | `orders`, `evidences`, `billing` | Interactive timeline showing active status, missing items, and owner. | Order status history, active tasks, and user assignments. | Low | High | `P1` |
| **2. Order Digital Twin** | Difficulty tracking exact changes and history per order. | `orders`, `audit-logs`, `files` | A sequential visual log of decisions, uploads, signatures, and costs. | Event timestamps, audit records, and FileAsset relations. | Low | Medium | `P2` |
| **3. Unified FileAsset Engine** | Inconsistent storage logic between modules. | `files`, `fleet`, `tool`, `evidence` | Unified middleware and service adapters for all file attachments. | File metadata, entity relations, and storage paths. | Low | High | `P0` |
| **4. Automation Rules Engine** | Manual intervention required to trigger transitions or alerts. | `notifications`, `orders`, `checklists` | Simple IF-THEN triggers (e.g. IF checklist fails, THEN notify HES). | State transition events and trigger rule schemas. | Medium | High | `P2` |
| **5. AI Operations Copilot** | Time-consuming manual report generation and review. | `ai`, `reports`, `evidences` | Text summary generator for completed orders and missing evidence flagger. | Work description text and evidence metadata. | Medium | High | `P2` |
| **6. Intelligent Planner** | Manual scheduling of technicians and vehicles is error-prone. | `planning`, `fleet`, `resources` | Recommended technician/vehicle assignments based on active licenses and availability. | Resource scheduling ranges and location data. | Medium | Medium | `P2` |
| **7. QR/NFC Assets Check** | Slow check-in/out process for tools and vehicles. | `fleet`, `tool`, `inventory` | QR scanner UI inside the app to check availability and log assignment. | Asset serial numbers and checkout states. | Low | Medium | `P2` |
| **8. Dynamic Form Builder** | Fixed database forms limit customized client checklist formats. | `checklists`, `documents` | Admin UI to create custom checklists with drag-and-drop inputs. | Dynamic field types and submission schemas. | High | Medium | `P2` |
| **9. Customer Portal** | Clients calling for status updates on work requests. | `portal`, `proposals`, `invoices` | Read-only access dashboard for client role (`CLI`). | Proposal approvals and invoice histories for the logged-in client ID. | Low | High | `P1` |
| **10. SaaS Multitenancy** | Direct deployment per client is expensive to scale. | `system-config`, `users/RBAC` | Database tenant-id isolation key and customizable brand themes. | Tenant lookup table and isolated schemas. | High | High | `P3` |
