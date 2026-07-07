# Innovation Radar — Research Findings

> **Generated**: 2026-06-29  
> **Purpose**: Identify innovation opportunities for Cermont S.A.S. based on external research  
> **Methodology**: Web search + codebase analysis + pattern matching

---

## 1. FSM/CMMS Open Source Platforms

### Field Platform (fieldplatform.io)
- **What it is**: Open-source field service management platform
- **Relevant patterns**:
  - Work order lifecycle with state machine
  - Mobile-first field execution with offline sync
  - Asset management with maintenance scheduling
  - Customer portal for service requests
- **What Cermont can adopt**:
  - Enhanced offline sync conflict resolution strategies
  - More granular asset lifecycle tracking
  - Customer self-service portal patterns
- **Complexity**: Medium
- **Effort**: 2-3 sprints

### FlexDesk (flexdesk.io)
- **What it is**: Flexible workspace and field service platform
- **Relevant patterns**:
  - Dynamic form builder for field data collection
  - Real-time GPS tracking for field teams
  - Multi-tenant architecture with tenant isolation
- **What Cermont can adopt**:
  - Dynamic form builder for customizable checklists
  - Real-time location tracking for fleet/field teams
  - Multi-tenant data isolation patterns
- **Complexity**: High
- **Effort**: 4-6 sprints

### openMAINT (openmaint.org)
- **What it is**: Open-source CMMS (Computerized Maintenance Management System)
- **Relevant patterns**:
  - Preventive maintenance scheduling with calendar integration
  - Asset hierarchy (location → asset → component)
  - Work order prioritization matrix
  - Inventory management with reorder points
- **What Cermont can adopt**:
  - Preventive maintenance calendar with recurrence rules
  - Asset hierarchy for fleet/tools/components
  - Work order prioritization based on SLA
- **Complexity**: Medium
- **Effort**: 2-4 sprints

---

## 2. SaaS Multi-Tenant Patterns

### Feature Flags & Subscription Plans
- **Pattern**: Feature flags per tenant with subscription tier mapping
- **Implementation**:
  - `tenant.features` array in MongoDB
  - Middleware checks `canAccessFeature(tenantId, feature)`
  - Frontend hides/shows features based on `useFeatureFlag(tenantId, feature)`
- **Cermont application**:
  - Different plans for small/medium/large contractors
  - Feature gating for advanced modules (AI, analytics, ERP sync)
  - Usage-based billing (storage, API calls, users)
- **Complexity**: Medium
- **Effort**: 3-4 sprints

### Tenant Branding
- **Pattern**: White-label configuration per tenant
- **Implementation**:
  - `tenant.branding` object (logo, colors, domain)
  - CSS variables injected at runtime
  - Custom email templates per tenant
- **Cermont application**:
  - Each contractor gets branded portal
  - Custom email notifications with company logo
  - Tenant-specific subdomain (client1.cermont.co)
- **Complexity**: Low-Medium
- **Effort**: 2-3 sprints

### Tenant Isolation
- **Pattern**: Data isolation at MongoDB level
- **Implementation**:
  - All documents have `tenantId` field
  - Mongoose middleware auto-injects `tenantId`
  - Query scoping: `Model.find({ tenantId: req.tenantId })`
- **Cermont application**:
  - Prepare for multi-tenant future
  - Current single-tenant can migrate gradually
- **Complexity**: High (requires migration)
- **Effort**: 6-8 sprints

---

## 3. AI Copilot Patterns

### Secure LLM for Operational Summaries
- **Pattern**: RAG (Retrieval-Augmented Generation) with internal data
- **Implementation**:
  - Vector embeddings of orders, evidences, reports
  - LLM queries scoped to user's accessible data
  - Response grounded in actual documents
- **Cermont application**:
  - "Summarize this order's status" → AI generates summary from evidences, reports, timeline
  - "What's blocking this service case?" → AI analyzes blockers and suggests actions
  - "Generate report draft" → AI creates initial report from collected data
- **Complexity**: High
- **Effort**: 6-10 sprints
- **Security considerations**:
  - Never send raw secrets to LLM
  - Scope queries to RBAC-filtered data
  - Log all AI interactions for audit

### Missing Document Detection
- **Pattern**: Rule-based + ML classification
- **Implementation**:
  - Checklist of required documents per step
  - Computer vision for document type detection
  - Alert when required document is missing
- **Cermont application**:
  - "Order 123 is missing safety analysis before execution"
  - "Proposal 456 needs client signature before PO"
  - "SES 789 missing Ariba reference"
- **Complexity**: Medium
- **Effort**: 3-4 sprints

### Smart Search
- **Pattern**: Semantic search over all documents
- **Implementation**:
  - Embeddings for document content
  - Natural language query interface
  - Faceted search results
- **Cermont application**:
  - "Find all orders with electrical safety issues"
  - "Show proposals from last month with budget > $10M"
  - "Which clients have pending invoices?"
- **Complexity**: Medium
- **Effort**: 3-5 sprints

---

## 4. Digital Twin Patterns

### Order Timeline (Documental State)
- **Pattern**: Immutable event stream representing order state
- **Implementation**:
  - Every state change creates an event document
  - Events are append-only, never modified
  - Timeline view reconstructs state at any point
- **Cermont application**:
  - Visual timeline of order progression through 14 steps
  - "Time travel" to see order state at any date
  - Audit trail as first-class feature (not just logs)
- **Complexity**: Medium
- **Effort**: 3-4 sprints

### Documental State Machine
- **Pattern**: State machine with visual representation
- **Implementation**:
  - Mermaid/D3.js state diagram
  - Current state highlighted
  - Available transitions shown
  - Blocking conditions visualized
- **Cermont application**:
  - Service case cockpit with state diagram
  - "Why can't I advance to next step?" → visual blocker
  - Historical state changes with timestamps
- **Complexity**: Low-Medium
- **Effort**: 2-3 sprints

### Audit Trail as Feature
- **Pattern**: User-facing audit trail (not just admin)
- **Implementation**:
  - Timeline view per order/service case
  - Filter by user, action, date range
  - Export to PDF/CSV
- **Cermont application**:
  - Clients can see their order history
  - Supervisors can see field team activity
  - Gerente can see full organizational audit
- **Complexity**: Low
- **Effort**: 1-2 sprints

---

## 5. Offline-First Advanced Patterns

### Sync Queue with Conflict Resolution
- **Current state**: Basic offline queue exists
- **Enhancement**: CRDT (Conflict-free Replicated Data Types)
- **Pattern**: Last-Write-Wins with vector clocks
- **Implementation**:
  - Each document has `version` and `lastModifiedBy`
  - Conflicts detected by comparing versions
  - User prompted to resolve conflicts
- **Cermont application**:
  - Multiple field operators edit same order
  - Offline changes sync when connectivity returns
  - No data loss, no silent overwrites
- **Complexity**: High
- **Effort**: 5-7 sprints

### Idempotency Improvements
- **Current state**: Basic idempotency keys exist
- **Enhancement**: Operation-level idempotency
- **Pattern**: `clientMutationId` + server-side deduplication
- **Implementation**:
  - Every mutation has unique `clientMutationId`
  - Server stores processed IDs with TTL
  - Duplicate requests return cached result
- **Cermont application**:
  - Double-click on "Submit" doesn't create duplicate
  - Offline sync retries don't duplicate records
  - Network retries are safe
- **Complexity**: Medium
- **Effort**: 2-3 sprints

### Progressive Web App Enhancements
- **Current state**: Basic PWA with Serwist
- **Enhancement**: Background sync + push notifications
- **Pattern**: Service Worker with Background Sync API
- **Implementation**:
  - Queue mutations when offline
  - Auto-sync when connectivity returns
  - Push notifications for order assignments
- **Cermont application**:
  - Field operators get notifications even when app is closed
  - Evidence uploads retry automatically
  - Dashboard updates when data changes
- **Complexity**: Medium
- **Effort**: 3-4 sprints

---

## 6. Additional Innovation Opportunities

### Real-Time Collaboration
- **Pattern**: WebSocket-based live updates
- **Use case**: Multiple users editing same order/planning
- **Complexity**: High
- **Effort**: 4-6 sprints

### Advanced Analytics
- **Pattern**: Predictive analytics for maintenance
- **Use case**: Predict equipment failures before they happen
- **Complexity**: High
- **Effort**: 6-8 sprints

### Mobile Native Apps
- **Pattern**: React Native or Flutter wrapper
- **Use case**: Better offline experience, camera integration
- **Complexity**: High
- **Effort**: 8-12 sprints

### ERP Integration Marketplace
- **Pattern**: Plugin architecture for ERP connectors
- **Use case**: SAP, Oracle, Microsoft Dynamics integrations
- **Complexity**: Medium
- **Effort**: 4-6 sprints

---

## Priority Matrix

| Innovation | Impact | Effort | Priority | Recommended Sprint |
|------------|--------|--------|----------|-------------------|
| Missing Document Detection | High | Medium | P1 | Sprint 1-2 |
| Smart Search | High | Medium | P1 | Sprint 3-5 |
| Order Timeline (Digital Twin) | Medium | Medium | P2 | Sprint 6-8 |
| Feature Flags | Medium | Medium | P2 | Sprint 9-11 |
| Idempotency Improvements | Medium | Medium | P2 | Sprint 12-14 |
| AI Copilot (Summaries) | High | High | P3 | Sprint 15-20 |
| Multi-Tenant Isolation | High | High | P3 | Sprint 21-28 |
| Real-Time Collaboration | Medium | High | P3 | Sprint 29-34 |

---

## Sources Consulted

1. Field Platform (fieldplatform.io) — FSM patterns
2. FlexDesk (flexdesk.io) — Multi-tenant field service
3. openMAINT (openmaint.org) — CMMS patterns
4. Various SaaS multi-tenant architecture articles
5. AI Copilot patterns in field service management
6. Digital Twin implementations in industrial contexts
7. Offline-first advanced patterns (CRDT, sync queues)

---

## Recommendations

1. **Start with P1 items** (Missing Document Detection, Smart Search) — high impact, medium effort
2. **Prepare for P2** (Feature Flags, Idempotency) — enables future innovations
3. **Plan P3 carefully** (AI, Multi-tenant) — high effort, requires architecture changes
4. **Leverage existing strengths**: Cermont already has solid offline-first, RBAC, and evidence management
5. **Focus on differentiation**: AI-powered operational intelligence is the key differentiator
