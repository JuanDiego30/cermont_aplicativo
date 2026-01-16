$src = "backend/src"
$common = "$src/common"
$lib = "$src/lib"
$shared = "$src/shared"

function Merge-Directories {
    param (
        [string]$sourceDir,
        [string]$destDir
    )

    if (-not (Test-Path $sourceDir)) {
        Write-Host "Source directory $sourceDir does not exist. Skipping."
        return
    }

    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir | Out-Null
    }

    $items = Get-ChildItem -Path $sourceDir

    foreach ($item in $items) {
        $destPath = Join-Path $destDir $item.Name
        if ($item.PSIsContainer) {
            Write-Host "Merging Folder: $($item.FullName) -> $destPath"
            Merge-Directories -sourceDir $item.FullName -destDir $destPath
        } else {
            Write-Host "Moving File: $($item.FullName) -> $destPath"
            if (Test-Path $destPath) {
                Write-Warning "File collision: $destPath already exists. Overwriting."
            }
            Move-Item -Path $item.FullName -Destination $destPath -Force
        }
    }
}

Write-Host "Starting Grand Unification..."

# Merge Common -> Shared
Merge-Directories -sourceDir $common -destDir $shared

# Merge Lib -> Shared
Merge-Directories -sourceDir $lib -destDir $shared

Write-Host "Merge complete. Checking for empty folders to delete..."

if ((Get-ChildItem -Path $common -Recurse | Measure-Object).Count -eq 0) {
    Remove-Item -Path $common -Recurse -Force
    Write-Host "Deleted empty $common"
} else {
    Write-Warning "$common is not empty. Manual check required."
}

if ((Get-ChildItem -Path $lib -Recurse | Measure-Object).Count -eq 0) {
    Remove-Item -Path $lib -Recurse -Force
    Write-Host "Deleted empty $lib"
} else {
    Write-Warning "$lib is not empty. Manual check required."
}

Write-Host "Grand Unification File Move Complete!"
