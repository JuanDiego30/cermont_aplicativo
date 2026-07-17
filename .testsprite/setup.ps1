<#
.SYNOPSIS
    TestSprite setup script for Cermont S.A.S. project
.DESCRIPTION
    Configures TestSprite CLI for testing the Cermont application.
    Run this after getting your API key from https://www.testsprite.com
.PARAMETER ApiKey
    Your TestSprite API key (optional, will prompt if not provided)
.EXAMPLE
    .\.testsprite\setup.ps1
    .\.testsprite\setup.ps1 -ApiKey "sk-..."
#>

param(
    [string]$ApiKey = ""
)

$ErrorActionPreference = "Stop"
$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"
$CYAN = "Cyan"

function Write-Color($Text, $Color) {
    Write-Host $Text -ForegroundColor $Color
}

Write-Color "╔══════════════════════════════════════════════╗" $CYAN
Write-Color "║     TestSprite Setup — Cermont S.A.S.        ║" $CYAN
Write-Color "╚══════════════════════════════════════════════╝" $CYAN
Write-Host ""

# Step 1: Check testSprite CLI
Write-Color "[1/4] Checking TestSprite CLI..." $CYAN
try {
    $version = & "C:\Users\camil\AppData\Roaming\npm\testsprite.cmd" --version 2>&1
    Write-Color "  ✅ TestSprite CLI v$version found" $GREEN
} catch {
    Write-Color "  ⚠️  Installing TestSprite CLI..." $YELLOW
    npm install -g @testsprite/testsprite-cli
    Write-Color "  ✅ Installed" $GREEN
}

# Step 2: Configure API key
Write-Color "[2/4] Configuring API key..." $CYAN
if (-not $ApiKey) {
    $ApiKey = Read-Host "  Enter your TestSprite API key (from https://www.testsprite.com)"
}

if ($ApiKey) {
    $env:TESTSPRITE_API_KEY = $ApiKey
    & "C:\Users\camil\AppData\Roaming\npm\testsprite.cmd" setup --from-env --yes --agent codex 2>&1
    Write-Color "  ✅ API key configured" $GREEN
} else {
    Write-Color "  ⚠️  No API key provided. Set TESTSPRITE_API_KEY env var and re-run." $YELLOW
}

# Step 3: Create TestSprite project
Write-Color "[3/4] Creating TestSprite project..." $CYAN
try {
    $projectResult = & "C:\Users\camil\AppData\Roaming\npm\testsprite.cmd" project create --name "Cermont App" --description "Cermont S.A.S. Operational Management Platform" --output json 2>&1
    Write-Color "  ✅ Project created (or already exists)" $GREEN
    Write-Color "  ℹ️  Update project ID in .testsprite/plans/*.plan.json files" $YELLOW
} catch {
    Write-Color "  ⚠️  Could not create project automatically. Create one manually:" $YELLOW
    Write-Color "     testsprite project create --name \"Cermont App\"" $YELLOW
}

# Step 4: Verify setup
Write-Color "[4/4] Verifying setup..." $CYAN
try {
    & "C:\Users\camil\AppData\Roaming\npm\testsprite.cmd" doctor 2>&1
    Write-Color "  ✅ Setup complete! Ready to run tests." $GREEN
} catch {
    Write-Color "  ⚠️  Doctor check had warnings. Review above." $YELLOW
}

Write-Host ""
Write-Color "═══════════════════════════════════════════════" $CYAN
Write-Color "  NEXT STEPS:" $CYAN
Write-Color "  1. Create a project: testsprite project create" $CYAN
Write-Color "  2. Update projectId in plan JSON files" $CYAN
Write-Color "  3. Run tests: testsprite test create --plan-from <file>" $CYAN
Write-Color "═══════════════════════════════════════════════" $CYAN
