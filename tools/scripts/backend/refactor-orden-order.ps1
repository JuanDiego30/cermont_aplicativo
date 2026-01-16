$targetDir = "backend/src/modules/orders"
$files = Get-ChildItem -Path $targetDir -Recurse -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace Orden -> Order (Classes, Types)
    $content = $content -replace 'Orden', 'Order'
    
    # Replace orden -> order (Variables, instances)
    # Be careful not to double replace if 'Orden' is replaced first?
    # Actually regex 'Orden' matches 'Orden'. 'orden' matches 'orden'.
    $content = $content -replace 'orden', 'order'
    
    # Fix plural cases that might have become 'orderes' -> 'orders'
    # 'ordenes' -> replaced by 'Orden' rule -> 'Orderes' -> fix to 'Orders'
    $content = $content -replace 'Orderes', 'Orders'
    $content = $content -replace 'orderes', 'orders'

    # Fix specific compound words
    # 'createOrderDto' is fine.
    # 'OrderRepository' is fine.

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Processed $($file.Name)"
}
