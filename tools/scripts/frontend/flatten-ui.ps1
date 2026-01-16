$base = "frontend/src/app/shared"
$components = "$base/components"
$ui = "$base/ui"

function Move-ComponentFolder {
    param (
        [string]$folderName
    )
    $source = "$components/$folderName"
    $dest = "$ui/$folderName"
    
    if (Test-Path $source) {
        Write-Host "Moving $source -> $dest"
        Move-Item -Path $source -Destination $ui -Force
    }
}

# 1. Move nested UI items from shared/components/ui/* to shared/ui/*
if (Test-Path "$components/ui") {
    $items = Get-ChildItem -Path "$components/ui"
    foreach ($item in $items) {
        $destPath = Join-Path $ui $item.Name
        Write-Host "Moving UI Item: $($item.FullName) -> $destPath"
        Move-Item -Path $item.FullName -Destination $destPath -Force
    }
    # Delete empty ui folder
    Remove-Item "$components/ui" -Force -Recurse -ErrorAction SilentlyContinue
}

# 2. Move specific generic folders
Move-ComponentFolder -folderName "cards"
Move-ComponentFolder -folderName "form"
Move-ComponentFolder -folderName "modal"
Move-ComponentFolder -folderName "loading-spinner"
Move-ComponentFolder -folderName "tables"
Move-ComponentFolder -folderName "status-badge"
Move-ComponentFolder -folderName "toast"
Move-ComponentFolder -folderName "alert" # If separate from ui
Move-ComponentFolder -folderName "badge" # If separate from ui

Write-Host "Frontend UI Flattening Complete"
