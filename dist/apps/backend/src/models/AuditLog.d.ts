import mongoose, { Document, Model } from 'mongoose';
declare const ACTIONS: readonly ["LOGIN", "LOGOUT", "LOGOUT_ALL", "LOGOUT_SESSION", "LOGIN_FAILED", "TOKEN_REFRESH", "TOKEN_REVOKED", "PASSWORD_CHANGE", "PASSWORD_RESET", "CREATE", "UPDATE", "DELETE", "READ", "CREATE_ORDER", "UPDATE_ORDER", "DELETE_ORDER", "CREATE_WORKPLAN", "UPDATE_WORKPLAN", "ASSIGN_USER", "CREATE_REPORT", "UPDATE_REPORT", "DELETE_EVIDENCE", "CREATE_TOOLKIT", "ROLE_CHANGE", "PERMISSION_DENIED", "ACCESS_DENIED", "SECURITY_THREAT", "SUSPICIOUS_ACTIVITY", "FILE_UPLOAD", "FILE_DELETE", "FILE_DOWNLOAD", "EXPORT_DATA", "IMPORT_DATA", "SYSTEM_ALERT", "CONFIG_CHANGE"];
type Action = typeof ACTIONS[number];
declare const RESOURCES: readonly ["User", "Order", "WorkPlan", "ToolKit", "CctvReport", "Evidence", "Auth", "File", "System", "RBAC", "Sanitization"];
type Resource = typeof RESOURCES[number];
declare const ROLES: readonly ["ROOT", "ADMIN", "ENGINEER", "SUPERVISOR", "TECHNICIAN", "CLIENT", "ANONYMOUS"];
type UserRole = typeof ROLES[number];
declare const STATUSES: readonly ["SUCCESS", "FAILURE", "DENIED"];
type Status = typeof STATUSES[number];
declare const METHODS: readonly ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"];
type HttpMethod = typeof METHODS[number];
declare const SEVERITIES: readonly ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
type Severity = typeof SEVERITIES[number];
interface AuditData {
    userId?: mongoose.Types.ObjectId;
    userEmail: string;
    userRole?: UserRole;
    action: Action;
    resource: Resource;
    resourceId?: mongoose.Types.ObjectId;
    changes?: {
        before?: mongoose.Schema.Types.Mixed;
        after?: mongoose.Schema.Types.Mixed;
    };
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    method?: HttpMethod;
    endpoint?: string;
    status?: Status;
    errorMessage?: string;
    severity?: Severity;
    metadata?: mongoose.Schema.Types.Mixed;
    timestamp?: Date;
}
interface AuditLogDoc extends Document {
    userId: mongoose.Types.ObjectId | null;
    userEmail: string;
    userRole: UserRole;
    action: Action;
    resource: Resource;
    resourceId: mongoose.Types.ObjectId | null;
    changes: {
        before?: mongoose.Schema.Types.Mixed;
        after?: mongoose.Schema.Types.Mixed;
    };
    description?: string;
    ipAddress?: string;
    userAgent?: string;
    method?: HttpMethod | null;
    endpoint?: string;
    status: Status;
    errorMessage?: string;
    severity: Severity;
    metadata?: mongoose.Schema.Types.Mixed;
    timestamp: Date;
    toJSON(): any;
    populateUser(): Promise<this>;
}
interface AuditLogModel extends Model<AuditLogDoc> {
    log(data: Partial<AuditData>): Promise<void>;
    getUserActivity(userId: mongoose.Types.ObjectId, limit?: number, page?: number): Promise<AuditLogDoc[]>;
    getSecurityAlerts(days?: number, limit?: number): Promise<AuditLogDoc[]>;
    getStats(days?: number): Promise<any[]>;
}
declare const AuditLog: AuditLogModel;
export default AuditLog;
//# sourceMappingURL=AuditLog.d.ts.map