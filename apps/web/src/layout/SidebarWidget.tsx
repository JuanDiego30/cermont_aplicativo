/**
 * ARCHIVO: SidebarWidget.tsx
 * FUNCION: Widget informativo que muestra branding y versión en el sidebar
 * IMPLEMENTACION: Componente presentacional con estilos Tailwind CSS
 * DEPENDENCIAS: React
 * EXPORTS: SidebarWidget (default)
 */
import React from "react";
const SidebarWidget: React.FC = () => {
    return (
        <div className="mx-5 mb-10 mt-10 rounded-2xl bg-brand-500 p-5 text-center text-white">
            <h3 className="mb-2 text-lg font-semibold text-white">Cermont App</h3>
            <p className="mb-4 text-sm text-white/90">Sistema de Gestión de Órdenes v1.0</p>
        </div>
    );
};

export default SidebarWidget;
