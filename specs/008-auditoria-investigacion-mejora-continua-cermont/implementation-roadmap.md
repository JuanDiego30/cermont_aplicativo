# Implementation Roadmap & Slices Prioritization — Spec 008

This document outlines the prioritization matrix, dependency mapping, and phases for the 12 slices planned for the Cermont S.A.S. application.

---

## 12-Slice Prioritization Matrix

| Slice | Focus | Impact | Risk | Effort | Priority | Dependencies |
|---|---|---|---|---|---|---|
| **Slice 01** | Stabilization & Gates | High | Low | Low | `P0` | None |
| **Slice 02** | FileAsset SSOT | High | Low | Medium | `P0` | Slice 01 |
| **Slice 03** | Fleet Professionalization | Medium | Low | Medium | `P1` | Slice 02 |
| **Slice 04** | Tools Professionalization | Medium | Low | Medium | `P1` | Slice 02 |
| **Slice 05** | Evidence FSM | High | Medium | Medium | `P1` | Slice 02 |
| **Slice 06** | Checklist Blocking | High | Medium | Medium | `P1` | Slice 01 |
| **Slice 07** | Dashboard OS Cockpit | High | Low | Large | `P1` | Slice 01 |
| **Slice 08** | Cost ERP Intelligence | High | Low | Medium | `P1` | Slice 01 |
| **Slice 09** | Automation Rules Engine | Medium | High | Large | `P2` | Slice 05, Slice 06, Slice 07 |
| **Slice 10** | Order Digital Twin | Medium | Low | Medium | `P2` | Slice 07, Slice 08 |
| **Slice 11** | AI Copilot Safe MVP | Medium | Medium | Medium | `P2` | Slice 07 |
| **Slice 12** | SaaS Multitenancy Foundation| High | High | Large | `P3` | Slices 01–08 |

---

## Dependency Graph (ASCII)

```text
               +----------------------------------+
               |  Slice 01: Stabilization/Gates   |
               +----------------+-----------------+
                                |
                                v
               +----------------+-----------------+
               |     Slice 02: FileAsset SSOT     |
               +-----+----------+-----------+-----+
                     |          |           |
         +-----------+          |           +-----------+
         v                      v                       v
+--------+--------+    +--------+--------+    +---------+--------+
| Slice 03: Fleet |    | Slice 04: Tools |    | Slice 05: Ev FSM |
+-----------------+    +-----------------+    +----+-------------+
                                                   |
                                                   v
                                       +-----------+-------------+
                                       | Slice 09: Rules Engine  |
                                       +-------------------------+
```

---

## Priority Phases

### P0 (Stabilization — Phase 1)
- **Slice 01**: quality:strict green, fix PayloadTooLargeError in Express backend, react-doctor score improvement.
- **Slice 02**: FileAsset SSOT entityTypes and parent adapters.

### P1 (Product Professional — Phase 2)
- **Slice 03**: Fleet professional (check-in/check-out, certifications).
- **Slice 04**: Tools professional (calibrations, availability).
- **Slice 05**: Evidence FSM (verified/rejected workflow status).
- **Slice 06**: Blocking checklists (critical items requiring photos/signatures).
- **Slice 07**: Dashboard operating cockpit (timeline, alerts).
- **Slice 08**: Cost ERP catalog and comparisons.

### P2 (Innovation — Phase 3)
- **Slice 09**: Automation Rules Engine.
- **Slice 10**: Order Digital Twin.
- **Slice 11**: AI Copilot MVP.

### P3 (Scaling — Phase 4)
- **Slice 12**: SaaS Multitenancy foundation.
