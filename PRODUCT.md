# PRODUCT.md

## Product

**Name:** Cermont Campo
**Type:** Work order management PWA
**Register:** product

## Users

| Role | Context | Primary Need |
|------|---------|-------------|
| Field technicians | Mobile, outdoors, intermittent connectivity | Capture evidence, update work orders offline |
| Supervisors | Tablet/desktop, field + office | Approve work, track progress, assign resources |
| Managers | Desktop, office | KPIs, reports, resource planning |
| HSE officers | Mobile + desktop | Inspection checklists, compliance tracking |
| Administrators | Desktop, office | User management, system configuration |
| Clients | Desktop/mobile (read-only) | Track order status, view reports |

## User States

- **Authenticated:** Dashboard zone with full module access based on RBAC role
- **Unauthenticated:** Public landing page with company info and CTA
- **Offline:** PWA with IndexedDB sync queue, read-only cached data

## Product Purpose

Manage the complete lifecycle of industrial maintenance and construction work orders: creation, planning, execution, evidence capture, cost tracking, and reporting. The platform connects field teams with office management in real-time (when online) and preserves productivity during connectivity gaps (offline-first PWA).

## Core Workflows

1. **Order lifecycle:** Create > Plan > Execute > Inspect > Close
2. **Maintenance scheduling:** Preventive and corrective maintenance workflows
3. **Evidence capture:** Photo/video upload, inspection checklists, signatures
4. **Cost tracking:** Material costs, labor costs, budget vs actual
5. **Reporting:** Operational KPIs, completion rates, resource utilization

## Personality

Professional, trustworthy, operationally focused. The interface serves the work, not the other way around. Efficiency over aesthetics, clarity over decoration. Field technicians need speed and reliability above all.

## Anti-References

- Not a marketing site
- Not a creative portfolio
- Not a consumer social app
- Not a gaming interface
- No decorative animations that slow field workers
