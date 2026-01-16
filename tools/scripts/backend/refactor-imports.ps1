$targetDir = "backend/src"
$files = Get-ChildItem -Path $targetDir -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content

    # Replace absolute imports
    $content = $content -replace "'@/common/", "'@/shared/"
    $content = $content -replace '"@/common/', '"@/shared/'
    $content = $content -replace "'@/lib/", "'@/shared/"
    $content = $content -replace '"@/lib/', '"@/shared/'

    # Replace relative imports (naive but likely effective given structure)
    # ../common/ -> ../shared/
    $content = $content -replace "'\.\./common/", "'../shared/"
    $content = $content -replace '"\.\./common/', '"../shared/'
    $content = $content -replace "'\.\./lib/", "'../shared/"
    $content = $content -replace '"\.\./lib/', '"../shared/'
    
    # ../../common/ -> ../../shared/
    $content = $content -replace "'\.\./\.\./common/", "'../../shared/"
    $content = $content -replace '"\.\./\.\./common/', '"../../shared/'
    $content = $content -replace "'\.\./\.\./lib/", "'../../shared/"
    $content = $content -replace '"\.\./\.\./lib/', '"../../shared/'

    # Fix relative imports from WITHIN shared (formerly common importing lib)
    # If I was in common/filters and imported ../lib/services -> now in shared/filters importing ../shared/services
    # The move preservation means ../lib became ../shared. The straightforward replace handles this.

    # SPECIAL CASE: Spanglish module renames
    $content = $content -replace "src/modules/ordenes", "src/modules/orders"
    $content = $content -replace "modules/ordenes", "modules/orders"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated imports in $($file.Name)"
    }
}
