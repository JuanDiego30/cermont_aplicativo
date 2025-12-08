import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxCubeIcon } from "../icons";

const SidebarWidget: React.FC = () => {
    // Versión simplificada o placeholder si se desea quitar.
    // TailAdmin original tenía un banner promo.
    // Si no se quiere, retornar null.
    // Retornaré algo simple para mantener consistencia si se importa.
    return (
        <div className="mx-5 mb-10 mt-10 rounded-2xl bg-brand-500 p-5 text-center text-white">
            <h3 className="mb-2 text-lg font-semibold text-white">Cermont App</h3>
            <p className="mb-4 text-sm text-white/90">Sistema de Gestión de Órdenes v1.0</p>
        </div>
    );
};

export default SidebarWidget;
