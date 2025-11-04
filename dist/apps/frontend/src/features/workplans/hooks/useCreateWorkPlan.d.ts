export declare const useCreateWorkPlan: () => import("@tanstack/react-query").UseMutationResult<WorkPlan, Error, {
    orderId: string;
    titulo: string;
    alcance: string;
    unidadNegocio: "IT" | "MNT" | "SC" | "GEN" | "Otros";
    startDate: string;
    endDate: string;
    assignedUsers: string[];
    tools: string[];
    estado: "borrador" | "en_revision" | "aprobado" | "en_ejecucion" | "completado" | "cancelado";
    descripcion?: string | undefined;
}, unknown>;
//# sourceMappingURL=useCreateWorkPlan.d.ts.map