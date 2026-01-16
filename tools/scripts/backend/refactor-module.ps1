param (
    [string]$OldName,     # e.g. "tecnicos"
    [string]$NewName,     # e.g. "technicians"
    [string]$OldEntity,   # e.g. "Tecnico"
    [string]$NewEntity    # e.g. "Technician"
)

$baseDir = "backend/src/modules"
$targetDir = "$baseDir/$NewName"
$oldDir = "$baseDir/$OldName"

# 1. Rename Directory
if (Test-Path $oldDir) {
    Write-Host "Renaming directory $oldDir -> $targetDir"
    Rename-Item -Path $oldDir -NewName $NewName
} else {
    if (-not (Test-Path $targetDir)) {
        Write-Error "Directory $oldDir not found!"
        return
    }
    Write-Host "Directory already renamed or new, continuing..."
}

# 2. Rename Files recursively
$files = Get-ChildItem -Path $targetDir -Recurse
foreach ($file in $files) {
    $newName = $file.Name -replace $OldName, $NewName -replace $OldEntity, $NewEntity
    if ($newName -ne $file.Name) {
        $newPath = Join-Path $file.Directory.FullName $newName
        Write-Host "Renaming file $($file.Name) -> $newName"
        Rename-Item -Path $file.FullName -NewName $newName
    }
}

# 3. Replace Content recursively
$files = Get-ChildItem -Path $targetDir -Recurse -File
foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        
        # Replace PascalCase (Entity)
        $content = $content -replace $OldEntity, $NewEntity
        # Replace camelCase (Module/Variable)
        $content = $content -replace $OldName, $NewName
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "Updated content in $($file.Name)"
        }
    } catch {
        Write-Warning "Could not process $($file.Name)"
    }
}

Write-Host "Refactor of $OldName -> $NewName complete."
