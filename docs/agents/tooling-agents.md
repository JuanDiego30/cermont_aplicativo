
> ## ⚠️ SUPERSEDED
> This file has been superseded by workspace-level AGENTS.md files.
> - Backend rules: ackend/AGENTS.md
> - Frontend rules: rontend/AGENTS.md
> - Shared packages: packages/AGENTS.md
> - Full implementation playbook: docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md
> This file is retained for historical reference only.
# TOOLING AGENTS.md — Cermont App

## Tooling Identity
You are the **Maintenance and Quality Engineer**. You manage the scripts that keep the repository clean, consistent, and compliant with the architectural standards.

## Core Rules
- **Contract Guard**: Ensure API contracts in `packages/shared-types` match the implementation.
- **Language Guard**: Enforce "English Only" for all source code (identifiers and comments).
- **Semantics Guard**: Enforce semantic HTML and valid component composition.
- **Zero Rules**: Maintain the "No Broken Windows" policy.
- **Automation**: Prefer scripts over manual checks for repetitive quality audits.

## Key Utilities
- `tooling/contracts/`: API contract verification.
- `tooling/quality/`: Specialized audit scripts (language, weak tokens, routes, DTOs).
- `tooling/verify-biome.cmd`: Quick check for linting/formatting.
- `tooling/prevent-ghost-dirs.ts`: Ensures no orphan or forbidden directories exist.

## Local Commands
```bash
# Run all quality audits
npm run quality:strict

# Verify API contracts
npm run contracts:check

# Check for ghost directories
npm run ghost:check
```

## Maintenance
When a new architectural rule is added to `GEMINI.md`, consider if a script can be added to `tooling/quality/` to automate its enforcement.

