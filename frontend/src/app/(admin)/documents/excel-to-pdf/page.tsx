'use client';

import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/components/ui';
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '@/core/api/client';

export default function ExcelToPdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [options, setOptions] = useState({
        includeHeader: true,
        includeGridlines: true,
        landscape: false,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];

            if (!validTypes.includes(selectedFile.type)) {
                setError('Por favor selecciona un archivo Excel (.xlsx o .xls)');
                return;
            }

            setFile(selectedFile);
            setError(null);
            setSuccess(false);
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError('Por favor selecciona un archivo');
            return;
        }

        setIsConverting(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('includeHeader', String(options.includeHeader));
            formData.append('includeGridlines', String(options.includeGridlines));
            formData.append('landscape', String(options.landscape));

            const response = await apiClient.post('/documents/excel-to-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }) as { data: Blob | ArrayBuffer };

            // Response should be a blob (PDF binary data)
            const blob = response.data instanceof Blob
                ? response.data
                : new Blob([response.data], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.name.replace(/\.(xlsx?|xls)$/i, '.pdf');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccess(true);
            setFile(null);

            // Reset file input
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Error al convertir el archivo. Por favor intenta nuevamente.'
            );
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="space-y-6 p-6 max-w-3xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Convertir Excel a PDF</h1>
                <p className="text-muted-foreground mt-2">
                    Sube un archivo Excel (.xlsx o .xls) y conviértelo a PDF con formato profesional.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Subir Archivo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-brand-500 transition-colors">
                        <input
                            id="file-input"
                            type="file"
                            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="file-input"
                            className="cursor-pointer flex flex-col items-center gap-2"
                        >
                            {file ? (
                                <>
                                    <FileSpreadsheet className="h-12 w-12 text-green-500" />
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-12 w-12 text-gray-400" />
                                    <p className="text-sm font-medium">
                                        Click para seleccionar archivo Excel
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        .xlsx o .xls (máximo 10MB)
                                    </p>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Opciones de Conversión</h3>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.includeHeader}
                                onChange={(e) =>
                                    setOptions({ ...options, includeHeader: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm">Incluir encabezados de tabla</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.includeGridlines}
                                onChange={(e) =>
                                    setOptions({ ...options, includeGridlines: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm">Incluir líneas de cuadrícula</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.landscape}
                                onChange={(e) =>
                                    setOptions({ ...options, landscape: e.target.checked })
                                }
                                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                            />
                            <span className="text-sm">Orientación horizontal</span>
                        </label>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                            <p className="text-sm text-green-600 dark:text-green-400">
                                ¡Conversión exitosa! El PDF se ha descargado.
                            </p>
                        </div>
                    )}

                    {/* Convert Button */}
                    <Button
                        onClick={handleConvert}
                        disabled={!file || isConverting}
                        className="w-full"
                        size="lg"
                    >
                        {isConverting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Convirtiendo...
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" />
                                Convertir a PDF
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>• El archivo Excel se convertirá manteniendo el formato y estilos</p>
                    <p>• Se admiten archivos .xlsx y .xls hasta 10MB</p>
                    <p>• El PDF se descargará automáticamente al completar la conversión</p>
                    <p>• Los datos sensibles se procesan de forma segura y no se almacenan</p>
                </CardContent>
            </Card>
        </div>
    );
}
