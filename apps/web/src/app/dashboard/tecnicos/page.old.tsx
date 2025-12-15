"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Phone,
  Star,
  Shield,
  Clock,
  CheckCircle,
  MoreVertical,
  Award
} from "lucide-react";

// Mock data para técnicos
const mockTecnicos = [
  { 
    id: "1", 
    nombre: "Juan Pérez", 
    cargo: "Técnico Senior", 
    especialidad: "Mantenimiento Industrial",
    certificaciones: ["Trabajo en Alturas", "Espacios Confinados", "Rescate Vertical"],
    telefono: "+57 300 123 4567",
    email: "juan.perez@cermont.co",
    estado: "activo",
    ubicacion: "Barrancabermeja",
    ordenesCompletadas: 156,
    calificacion: 4.8,
    disponible: true
  },
  { 
    id: "2", 
    nombre: "María García", 
    cargo: "Técnico de Campo", 
    especialidad: "Inspección de Equipos",
    certificaciones: ["Trabajo en Alturas", "Inspector de Líneas de Vida"],
    telefono: "+57 301 234 5678",
    email: "maria.garcia@cermont.co",
    estado: "activo",
    ubicacion: "Cartagena",
    ordenesCompletadas: 89,
    calificacion: 4.9,
    disponible: false
  },
  { 
    id: "3", 
    nombre: "Carlos López", 
    cargo: "Técnico Senior", 
    especialidad: "Montaje Industrial",
    certificaciones: ["Trabajo en Alturas", "Izaje de Cargas", "Soldadura TIG"],
    telefono: "+57 302 345 6789",
    email: "carlos.lopez@cermont.co",
    estado: "activo",
    ubicacion: "Bogotá",
    ordenesCompletadas: 234,
    calificacion: 4.7,
    disponible: true
  },
  { 
    id: "4", 
    nombre: "Ana Rodríguez", 
    cargo: "Supervisora HES", 
    especialidad: "Seguridad Industrial",
    certificaciones: ["Auditor ISO 45001", "Trabajo en Alturas", "Primeros Auxilios"],
    telefono: "+57 303 456 7890",
    email: "ana.rodriguez@cermont.co",
    estado: "activo",
    ubicacion: "Medellín",
    ordenesCompletadas: 67,
    calificacion: 5.0,
    disponible: true
  },
  { 
    id: "5", 
    nombre: "Pedro Martínez", 
    cargo: "Técnico de Campo", 
    especialidad: "Mantenimiento Preventivo",
    certificaciones: ["Trabajo en Alturas"],
    telefono: "+57 304 567 8901",
    email: "pedro.martinez@cermont.co",
    estado: "inactivo",
    ubicacion: "Cúcuta",
    ordenesCompletadas: 45,
    calificacion: 4.3,
    disponible: false
  },
];

export default function TechniciansPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDisponible, setFilterDisponible] = useState<string>("todos");

  const filteredTecnicos = mockTecnicos.filter((tecnico) => {
    const matchesSearch = 
      tecnico.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tecnico.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tecnico.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDisponible = 
      filterDisponible === "todos" || 
      (filterDisponible === "disponible" && tecnico.disponible) ||
      (filterDisponible === "ocupado" && !tecnico.disponible);
    return matchesSearch && matchesDisponible;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Técnicos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión del personal técnico de campo
          </p>
        </div>
        <Link
          href="/dashboard/tecnicos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Agregar Técnico
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Técnicos", value: mockTecnicos.length, icon: <Shield className="w-5 h-5 text-blue-500" /> },
          { label: "Disponibles", value: mockTecnicos.filter(t => t.disponible).length, icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
          { label: "En Servicio", value: mockTecnicos.filter(t => !t.disponible && t.estado === "activo").length, icon: <Clock className="w-5 h-5 text-amber-500" /> },
          { label: "Calificación Prom.", value: (mockTecnicos.reduce((acc, t) => acc + t.calificacion, 0) / mockTecnicos.length).toFixed(1), icon: <Star className="w-5 h-5 text-yellow-500" /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, especialidad o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterDisponible}
            onChange={(e) => setFilterDisponible(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="todos">Todos</option>
            <option value="disponible">Disponibles</option>
            <option value="ocupado">En servicio</option>
          </select>
          <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Grid de tarjetas de técnicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTecnicos.map((tecnico) => (
          <div 
            key={tecnico.id} 
            className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header de la tarjeta */}
            <div className="relative p-6 pb-4">
              <div className="absolute top-4 right-4">
                <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {tecnico.nombre.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 ${tecnico.disponible ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {tecnico.nombre}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{tecnico.cargo}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {tecnico.especialidad}
                  </p>
                </div>
              </div>

              {/* Calificación */}
              <div className="flex items-center gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${star <= Math.round(tecnico.calificacion) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {tecnico.calificacion}
                </span>
                <span className="text-sm text-gray-400">
                  • {tecnico.ordenesCompletadas} órdenes
                </span>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{tecnico.ubicacion}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span>{tecnico.telefono}</span>
              </div>
            </div>

            {/* Certificaciones */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Certificaciones
              </p>
              <div className="flex flex-wrap gap-2">
                {tecnico.certificaciones.slice(0, 3).map((cert) => (
                  <span 
                    key={cert} 
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                  >
                    <Award className="w-3 h-3" />
                    {cert}
                  </span>
                ))}
                {tecnico.certificaciones.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    +{tecnico.certificaciones.length - 3} más
                  </span>
                )}
              </div>
            </div>

            {/* Footer con estado */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${tecnico.disponible ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tecnico.disponible ? (
                  <><CheckCircle className="w-4 h-4" /> Disponible</>
                ) : (
                  <><Clock className="w-4 h-4" /> En servicio</>
                )}
              </span>
              <Link 
                href={`/dashboard/tecnicos/${tecnico.id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Ver perfil →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredTecnicos.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron técnicos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Intenta con otros criterios de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
