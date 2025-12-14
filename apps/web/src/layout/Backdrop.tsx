/**
 * ARCHIVO: Backdrop.tsx
 * FUNCION: Overlay oscuro para cerrar el sidebar móvil al hacer clic fuera
 * IMPLEMENTACION: Div con blur que aparece condicionalmente y cierra sidebar al click
 * DEPENDENCIAS: React, SidebarContext (useSidebar)
 * EXPORTS: Backdrop (default)
 */
import React from "react";
import { useSidebar } from "../context/SidebarContext";

const Backdrop: React.FC = () => {
    const { isMobileOpen, toggleMobileSidebar } = useSidebar();

    if (!isMobileOpen) return null;

    return (
        <div
            onClick={toggleMobileSidebar}
            className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
        />
    );
};

export default Backdrop;
