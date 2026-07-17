# Commands Executed — Implementation Wave 01

```powershell
# Evidence directories
New-Item -ItemType Directory -Force .sisyphus\evidence\implementation-wave-01\screenshots-before
New-Item -ItemType Directory -Force .sisyphus\evidence\implementation-wave-01\screenshots-after

# Git state
git status --short --branch
git rev-parse HEAD
git log --oneline -5

# Diagnostics
Get-ChildItem -Recurse .sisyphus\plans | Select-Object FullName

# Search for unsafe types (select-string equivalent of rg)
Get-ChildItem -Path frontend/src, backend/src, packages -Recurse -Include '*.ts', '*.tsx' | Select-String -Pattern 'as unknown as|as never'

# Search for dialogs
Get-ChildItem -Path frontend/src -Recurse -Include '*.ts', '*.tsx' | Select-String -Pattern 'Dialog\.Content|DialogContent|@radix-ui/react-dialog'

# Search for dead routes
Get-ChildItem -Path frontend/src -Recurse -Include '*.ts', '*.tsx' | Select-String -Pattern 'erp-connectors/new'

# Search for kits/forms
Get-ChildItem -Path frontend/src, backend/src, packages -Recurse -Include '*.ts', '*.tsx' | Select-String -Pattern 'kitFormSchema|KitWizardForm|CreateKitSchema|KIT_TEMPLATES|CERMONT_FORM_TEMPLATES'

# Frontend typecheck
cd frontend; npx tsc --noEmit

# Frontend lint
cd frontend; npx biome lint --no-errors-on-unmatched

# Frontend tests
cd frontend; npx vitest run --reporter=verbose

# Frontend build
cd frontend; npx next build

# Git diff
git diff --stat
```
