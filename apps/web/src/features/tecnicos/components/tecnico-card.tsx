/**
 * ARCHIVO: tecnico-card.tsx
 * FUNCION: Tarjeta visual con info completa de un técnico
 * IMPLEMENTACION: Server Component - Avatar, rating, contacto, certificaciones y estado
 * DEPENDENCIAS: next/link, lucide-react, tecnico-status.utils
 * EXPORTS: TecnicoCard, TecnicoCardSkeleton
 */
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Star,
  MoreVertical,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';
import {
  getTecnicoInitials,
  getAvatarGradient,
  getDisponibilidadColor,
} from '../utils/tecnico-status.utils';
import type { Tecnico } from '../api/tecnicos.types';

interface TecnicoCardProps {
  tecnico: Tecnico;
}

export function TecnicoCard({ tecnico }: TecnicoCardProps) {
  const disponibilidadColor = getDisponibilidadColor(tecnico.disponible);
  const avatarGradient = getAvatarGradient(tecnico.nombre);

  // Normalizar certificaciones
  const certificaciones = tecnico.certificaciones.map((cert) =>
    typeof cert === 'string' ? cert : cert.nombre
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header de la tarjeta */}
      <div className="relative p-6 pb-4">
        <div className="absolute top-4 right-4">
          <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="relative">
            {tecnico.avatar ? (
              <img
                src={tecnico.avatar}
                alt={tecnico.nombre}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-16 h-16 rounded-full bg-linear-to-br ${avatarGradient} flex items-center justify-center text-white text-xl font-bold`}
              >
                {getTecnicoInitials(tecnico.nombre)}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 ${disponibilidadColor.dot}`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {tecnico.nombre}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tecnico.cargo}
            </p>
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
              className={`w-4 h-4 ${
                star <= Math.round(tecnico.calificacion)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
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
          {certificaciones.slice(0, 3).map((cert) => (
            <span
              key={cert}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
            >
              <Award className="w-3 h-3" />
              {cert}
            </span>
          ))}
          {certificaciones.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              +{certificaciones.length - 3} más
            </span>
          )}
        </div>
      </div>

      {/* Footer con estado */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${disponibilidadColor.text}`}
        >
          {tecnico.disponible ? (
            <>
              <CheckCircle className="w-4 h-4" /> Disponible
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" /> En servicio
            </>
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
  );
}

// Skeleton para loading
export function TecnicoCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden animate-pulse">
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
          </div>
        </div>
        <div className="flex gap-1 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
        </div>
      </div>
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 flex justify-between">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
    </div>
  );
}
