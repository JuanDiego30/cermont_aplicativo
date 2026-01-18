# Archived Skills

This folder contains skills that are not applicable to the Cermont monorepo stack.

## Contents

| Skill | Reason for Archive |
|-------|-------------------|
| `llvm-security` | C/C++ compiler security (LLVM IR, sanitizers). Not applicable to TypeScript/JavaScript stack. |

## Restoration

If you need to restore a skill:

```bash
mv SKILLS/_archived/<skill-name> SKILLS/
```

Then update `docs/SKILLS_MANIFEST.md` and `.agent/skills-config.json` accordingly.
