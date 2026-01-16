$targetDir = "frontend/src"
$files = Get-ChildItem -Path $targetDir -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content

    # Specific folders moved to shared/ui
    $content = $content -replace "shared/components/cards", "shared/ui/cards"
    $content = $content -replace "shared/components/form", "shared/ui/form"
    $content = $content -replace "shared/components/modal", "shared/ui/modal"
    $content = $content -replace "shared/components/loading-spinner", "shared/ui/loading-spinner"
    $content = $content -replace "shared/components/tables", "shared/ui/tables"
    $content = $content -replace "shared/components/status-badge", "shared/ui/status-badge"
    $content = $content -replace "shared/components/toast", "shared/ui/toast"
    
    # Generic UI items moved from components/ui/* to shared/ui/*
    # e.g. shared/components/ui/button -> shared/ui/button
    $content = $content -replace "shared/components/ui/", "shared/ui/"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated imports in $($file.Name)"
    }
}
