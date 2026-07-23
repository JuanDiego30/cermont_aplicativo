# Agent Instruction Inventory

> Generated: 2026-07-23
> Purpose: Audit all AGENTS.md and skill trees to eliminate duplication

## Root AGENTS.md

| File | Purpose | Origin | Decision |
|------|---------|--------|----------|
| AGENTS.md | Root agent constitution (~51 lines) | CERMONT project | KEEP - canonical |
| REGLAS_DESARROLLO_CERMONT.md | Development rules | CERMONT project | KEEP - canonical |

## Module-specific AGENTS.md

| File | Purpose | Decision |
|------|---------|----------|
| backend/AGENTS.md | Backend rules | KEEP - project-specific |
| frontend/AGENTS.md | Frontend rules | KEEP - project-specific |
| packages/AGENTS.md | Shared packages rules | KEEP - project-specific |

## Skill Trees (VENDOR)

| Tree | Size | Decision |
|------|------|----------|
| .agents/skills/ | 530+ vendor skill files | **EXCLUDE** - generic skills, not CERMONT-specific |
| .claude/skills/ | 400+ vendor skill files | **EXCLUDE** - duplicate of .agents/skills/ |

### Duplicates Found

source=C:/Users/camil/Downloads/cermont_aplicativo/cermont-integration
Write-Host "Comparing vendor skill trees (if present)..."
# List duplicated skill names
 = Get-ChildItem "C:\Users\camil\Downloads\cermont_aplicativo\cermont-integration\.agents\skills" -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
 = Get-ChildItem "C:\Users\camil\Downloads\cermont_aplicativo\cermont-integration\.claude\skills" -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name
 =  | Where-Object {  -contains  }
foreach ( in ) {
    Write-Host "  DUPLICATE:  (in both .agents/skills/ and .claude/skills/)"
}

## Decision

1. AGENTS.md root: KEEP (canonical)
2. backend/frontend/packages AGENTS.md: KEEP (project-specific)
3. .agents/skills/ and .claude/skills/: **EXCLUDE** from integration baseline
4. Skills should be loaded per-task via the 'skill' tool, not committed to repo
