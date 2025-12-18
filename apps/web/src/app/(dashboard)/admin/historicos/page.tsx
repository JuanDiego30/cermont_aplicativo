/**
 * Historicos Page - Portal de descarga de datos archivados
 *
 * Permite a admins descargar CSVs y ZIPs de órdenes archivadas por mes/año
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileSpreadsheet, FileArchive, RefreshCw, BarChart3 } from 'lucide-react';

interface ArchivoHistorico {
    id: string;
    tipo: 'ORDENES_CSV' | 'EVIDENCIAS_ZIP' | 'INFORMES_PDF' | 'BACKUP_COMPLETO';
    mes: number;
    anio: number;
    nombreArchivo: string;
    tamanioMB: string;
    cantidadOrdenes: number;
    cantidadEvidencias: number;
    descripcion: string;
    fechaArchivado: string;
}

interface Estadisticas {
    totalArchivos: number;
    totalOrdenes: number;
    totalEvidencias: number;
    espacioUsado: {
        mb: string;
        gb: string;
    };
    porAnio: Record<string, { ordenes: number; evidencias: number; archivos: number }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export default function HistoricosPage() {
    const [archivos, setArchivos] = useState<ArchivoHistorico[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [anioFiltro, setAnioFiltro] = useState<number | undefined>(undefined);
    const [generando, setGenerando] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [anioFiltro]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const archivosRes = await fetch(
                `${API_URL}/archivado/archivos${anioFiltro ? `?anio=${anioFiltro}` : ''}`,
                { headers }
            );
            const archivosData = await archivosRes.json();
            setArchivos(archivosData.data || []);

            const statsRes = await fetch(`${API_URL}/archivado/estadisticas`, { headers });
            const statsData = await statsRes.json();
            setEstadisticas(statsData);
        } catch (error) {
            console.error('Error fetching archivos:', error);
        } finally {
            setLoading(false);
        }
    };

    const descargarArchivo = async (id: string, nombreArchivo: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/archivado/descargar/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Error descargando archivo');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = nombreArchivo;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al descargar el archivo');
        }
    };

    const generarZipEvidencias = async (mes: number, anio: number) => {
        setGenerando(`${mes}-${anio}`);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/archivado/zip-evidencias/${mes}/${anio}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Error generando ZIP');

            await fetchData();
            alert('ZIP de evidencias generado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al generar el ZIP');
        } finally {
            setGenerando(null);
        }
    };

    const archivarAhora = async () => {
        if (!confirm('¿Ejecutar archivado de órdenes completadas ahora?')) return;

        setGenerando('archivado');
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/archivado/archivar-ahora`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            await fetchData();
            alert(`Archivado completado: ${data.archivadas} órdenes procesadas`);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al ejecutar archivado');
        } finally {
            setGenerando(null);
        }
    };

    const getIconoTipo = (tipo: string) => {
        switch (tipo) {
            case 'ORDENES_CSV':
                return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
            case 'EVIDENCIAS_ZIP':
                return <FileArchive className="w-5 h-5 text-blue-600" />;
            default:
                return <FileSpreadsheet className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNombreMes = (mes: number) => {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1] || '';
    };

    const getAniosDisponibles = () => {
        const anios = new Set(archivos.map(a => a.anio));
        return Array.from(anios).sort((a, b) => b - a);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Históricos</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Portal de descarga de datos archivados</p>
            </div>

            {/* Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.totalArchivos}</p>
                                <p className="text-sm text-gray-500">Archivos totales</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.totalOrdenes}</p>
                                <p className="text-sm text-gray-500">Órdenes archivadas</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <FileArchive className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.totalEvidencias}</p>
                                <p className="text-sm text-gray-500">Evidencias</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                                <Calendar className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{estadisticas.espacioUsado.gb} GB</p>
                                <p className="text-sm text-gray-500">Espacio usado</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={archivarAhora}
                    disabled={generando === 'archivado'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${generando === 'archivado' ? 'animate-spin' : ''}`} />
                    Ejecutar Archivado Ahora
                </button>

                <select
                    value={anioFiltro || ''}
                    onChange={(e) => setAnioFiltro(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Todos los años</option>
                    {getAniosDisponibles().map(anio => (
                        <option key={anio} value={anio}>{anio}</option>
                    ))}
                </select>
            </div>

            {/* Información */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Las órdenes completadas con cierre administrativo completo son archivadas automáticamente
                    el último día de cada mes. Aquí puedes descargar los datos históricos en formato CSV o ZIP.
                </p>
            </div>

            {/* Lista de Archivos */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : archivos.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No hay archivos históricos disponibles
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archivos.map((archivo) => (
                        <div
                            key={archivo.id}
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {getIconoTipo(archivo.tipo)}
                                    <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        {archivo.tipo.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {getNombreMes(archivo.mes)} {archivo.anio}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{archivo.descripcion}</p>

                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {archivo.cantidadOrdenes > 0 && (
                                    <p>📋 {archivo.cantidadOrdenes} órdenes</p>
                                )}
                                {archivo.cantidadEvidencias > 0 && (
                                    <p>📷 {archivo.cantidadEvidencias} evidencias</p>
                                )}
                                <p>💾 {archivo.tamanioMB} MB</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => descargarArchivo(archivo.id, archivo.nombreArchivo)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar
                                </button>

                                {archivo.tipo === 'ORDENES_CSV' && (
                                    <button
                                        onClick={() => generarZipEvidencias(archivo.mes, archivo.anio)}
                                        disabled={generando === `${archivo.mes}-${archivo.anio}`}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                                        title="Generar ZIP de evidencias"
                                    >
                                        <FileArchive className={`w-4 h-4 ${generando === `${archivo.mes}-${archivo.anio}` ? 'animate-pulse' : ''}`} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
