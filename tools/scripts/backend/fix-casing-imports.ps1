$targetDir = "backend/src/modules/orders"
$files = Get-ChildItem -Path $targetDir -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content

    # Fix Import Paths Casing
    # from "./Order-" -> from "./order-"
    $content = $content -replace 'from "\./Order-', 'from "./order-'
    $content = $content -replace "from '\./Order-", "from './order-"
    
    # from "../../domain/events/Order-" -> ...order-
    $content = $content -replace 'Order-estado-changed', 'order-estado-changed'
    $content = $content -replace 'Order-asignada', 'order-asignada'
    $content = $content -replace 'Order-created', 'order-created'
    
    # Also fix Use Case imports if they were capitalized
    # change-Order-estado -> change-order-estado
    $content = $content -replace 'change-Order-estado', 'change-order-estado'
    $content = $content -replace 'asignar-tecnico-Order', 'asignar-tecnico-order'
    $content = $content -replace 'create-Order', 'create-order'
    $content = $content -replace 'update-Order', 'update-order'
    $content = $content -replace 'delete-Order', 'delete-order'
    $content = $content -replace 'find-Order', 'find-order'
    $content = $content -replace 'list-Orders', 'list-orders'
    $content = $content -replace 'get-Order-by-id', 'get-order-by-id'

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed imports in $($file.Name)"
    }
}
