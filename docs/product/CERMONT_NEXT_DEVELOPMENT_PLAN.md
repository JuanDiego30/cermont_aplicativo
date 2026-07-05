# Cermont Next Development Plan

This executive document details the operational plan and prioritized waves for scaling Cermont S.A.S. into a professional FSM + GMAO + ERP + SaaS platform.

---

## 1. Roadmap Waves

```text
WAVE P0 (Immediate Stabilization)
├── Slice 01: Fix React Doctor alerts + PayloadTooLargeError
└── Slice 02: Centralize all media uploads under FileAsset SSOT

WAVE P1 (Operational Professionalization)
├── Slice 03: Fleet check-in/out logs & document alerts
├── Slice 04: Tool checkouts & calibration scheduling
├── Slice 05: Evidence FSM verification status transitions
├── Slice 06: Blocking checklists for critical safety steps
├── Slice 07: Central dashboard operating timeline
└── Slice 08: Cost Catalog & budget deviations

WAVE P2 (Innovation)
├── Slice 09: Dynamic rules engine triggers
├── Slice 10: Traceable order digital twins
└── Slice 11: AI draft & anomaly copiloting

WAVE P3 (Commercial SaaS Scaling)
└── Slice 12: Tenant-scoping database models & customizable billing
```

---

## 2. Immediate Priorities

Our next sprint focuses exclusively on **Wave P0 (Immediate Stabilization)**:
1. **Quality Gates Check**: Raise React Doctor score from 77/100 to >= 87/100 by solving hydration mismatch and adding missing metadata.
2. **Server Robustness**: Increase body parsing limits to support base64 user avatars.
3. **Storage Alignment**: Ensure the unified FileAsset storage engine maps all vehicle, tool, and evidence media files under unified adapters.
