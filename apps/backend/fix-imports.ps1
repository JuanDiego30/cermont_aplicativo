# Fix broken imports in controllers
$files = @(
    'workplans.controller.ts',
    'users.controller.ts',
    'reports.controller.ts',
    'upload.controller.ts'
)

foreach ($file in $files) {
    $path = "src/controllers/$file"
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        
        # Fix imports based on what was likely there
        $content = $content -replace "from '../utils/logger';\s*import.*from '../utils/logger';", "from '../utils/response';`nimport { HTTP_STATUS } from '../utils/constants';"
        $content = $content -replace "import \{ successResponse[^}]*\} from '../utils/logger';", "import { successResponse, errorResponse, createdResponse, paginatedResponse } from '../utils/response';`nimport { HTTP_STATUS } from '../utils/constants';"
        $content = $content -replace "import \{ asyncHandler \} from '../utils/logger';", "import { asyncHandler } from '../utils/asyncHandler';"
        $content = $content -replace "import \{ createAuditLog \} from '../utils/logger';", "import { createAuditLog } from '../middleware/auditLogger';"
        $content = $content -replace "import.*requireAdmin.*from '../utils/logger';", "import { requireAdmin } from '../middleware/rbac';"
        $content = $content -replace "import WorkPlan from '../utils/logger';", "import WorkPlan from '../models/WorkPlan';"
        $content = $content -replace "import User from '../utils/logger';", "import User from '../models/User';"
        $content = $content -replace "import Order from '../utils/logger';", "import Order from '../models/Order';"
        
        # Fix interface redeclaration
        $content = $content -replace 'interface Request extends Request', 'interface TypedRequest<T = any, P = any, Q = any> extends Request'
        
        # Replace TypedRequest usage with Request and add casting
        $content = $content -replace 'async \(req: Request,', 'async (req: Request,'
        $content = $content -replace 'req\.user\.', '(req as any).user.'
        
        Set-Content -Path $path -Value $content -NoNewline
        Write-Host "Fixed $file"
    }
}
