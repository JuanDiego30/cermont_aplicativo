import { SendMailOptions } from 'nodemailer';
interface User {
    nombre: string;
    email: string;
    role?: string;
}
interface Order {
    numeroOrden: string;
    clienteNombre: string;
    descripcion?: string;
    fechaInicio?: Date | string;
    prioridad?: string;
}
interface WorkPlan {
    titulo: string;
}
interface Stats {
    activeOrders: number;
    completedOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
}
interface EmailResult {
    success: boolean;
    messageId: string;
}
interface SendOptions extends Partial<SendMailOptions> {
    attachments?: Array<{
        filename: string;
        path?: string;
        content?: Buffer | string;
        contentType?: string;
    }>;
}
export declare const sendEmail: (to: string, subject: string, text: string, html?: string | null, options?: SendOptions) => Promise<EmailResult>;
export declare const sendWelcomeEmail: (user: User) => Promise<EmailResult>;
export declare const sendPasswordResetEmail: (email: string, resetToken: string) => Promise<EmailResult>;
export declare const sendOrderAssignedEmail: (user: User, order: Order) => Promise<EmailResult>;
export declare const sendOrderStatusChangeEmail: (users: User[], order: Pick<Order, "numeroOrden" | "clienteNombre">, previousStatus: string, newStatus: string) => Promise<EmailResult[]>;
export declare const sendWorkPlanApprovedEmail: (user: User, workPlan: WorkPlan, order: Pick<Order, "numeroOrden" | "clienteNombre">) => Promise<EmailResult>;
export declare const sendWeeklyReportEmail: (user: User, stats: Stats) => Promise<EmailResult>;
export {};
//# sourceMappingURL=email.service.d.ts.map