# CAVERNICOLA STITCH DECISIONS — Cermont S.A.S.

## 1. Tool Discovery & MCP Audit

At the start of the audit, the Stitch MCP server was scanned to discover available capabilities and prevent hallucination of tool APIs:
*   **Server Name:** `StitchMCP`
*   **Discovered Tools:**
    *   `list_projects`: Lists all Stitch projects owned/shared.
    *   `get_project`: Retrieves project details.
    *   `create_project`: Creates a new Stitch project.
    *   `list_screens`: Lists screens within a project.
    *   `get_screen`: Retrieves a specific screen's HTML code and screenshots.
    *   `generate_screen_from_text`: Prompts Stitch's text-to-UI engine.
    *   `edit_screens`: Alters screen attributes or visual states.
    *   `generate_variants`: Renders visual design alternatives.
    *   `upload_design_md`: Syncs visual standards files.
    *   `create_design_system` & `update_design_system`: Sets color tokens and roundness.

---

## 2. Extracted Project & Visual Reference

We executed `list_projects` and successfully located an active project:
*   **Project Name:** `projects/1472129191276393163`
*   **Title:** `"Proyecto nuevo"`
*   **Visual Direction:** `"The Digital Architect"` — precise, high-contrast, structural. Focuses on **Tonal Depth** and **Intentional Asymmetry** over generic borders.
*   **Base Surface Tint:** `#10131a` (Deep Off-Black Canvas)
*   **Primary Brand:** `#b2c5ff` (Calibrated Ice Blue)
*   **Secondary Accent:** `#65df76` (Calibrated Mint Green)

Within this project, we executed `list_screens` and retrieved:
*   **Screen Name:** `projects/1472129191276393163/screens/91d202508027489e9465010993bb4aea`
*   **Title:** `"UI Kit Cermont Pro"`
*   **HTML Asset URL:** [UI Kit HTML Code](https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2MyYjg1NWU2NjY1YjRkN2JhNTUxZjBjYWVhMmY1MzhiEgsSBxD78a7KjgYYAZIBIwoKcHJvamVjdF9pZBIVQhMxNDcyMTI5MTkxMjc2MzkzMTYz&filename=&opi=89354086)

---

## 3. UI/UX Decision Matrix

We mapped the screen proposals and design parameters to the concrete components in the `frontend` workspace:

| Proposal from Stitch | Decision | Technical Rationale |
|----------------------|----------|---------------------|
| **Tonal Backgrounds (#10131a)** | **Adopted for Dark Mode** | Clean dark background for field cockpits, mapped to Tailwind vars. |
| **No-Line Layout Rule** | **Adopted Dynamically** | Uses background shifts (`surface-container-low` vs `surface`) to differentiate sidebar, reserving high-contrast lines for core tables. |
| **Monospace Numbers** | **Adopted for Dashboard** | Highly legible monospace font (`Geist Mono`) for all financial amounts (COP) and coordinates. |
| **Asymmetric KPI grids** | **Adopted for Cockpit** | Dashboard grids collapse to clean 1-column mobile views and scale to offset bento-grids on desktop. |
| **Linear Accent Stripes** | **Adopted for Sync State** | Mapped to the left-border accent of active/synced tables and popovers. |

---

## 4. Installed Design Skills

To complement Stitch's structural specifications and enforce premium polish, the following skills were installed and read:
1.  **`pbakaus/impeccable`**: Enforces strict cognitive load limits, visible focus rings, touch target sizes, error boundaries, and WCAG AA accessibility.
2.  **`emilkowalski/skill`**: Infuses micro-motion principles, hardware-accelerated spring physics for Framer Motion transitions, and active button tactile depress.
3.  **`Leonxlnx/taste-skill`**: Provides custom UI assets, clean layout structure, and anti-pattern blocks (no generic placeholders, no emoji slop, no broken Unsplash links).
