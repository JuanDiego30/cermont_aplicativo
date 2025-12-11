'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { Camera, User, Mail, Phone, Shield, Save, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
    const { user } = useAuthStore();
    const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onload = () => {
                setAvatar(reader.result as string);
                setIsUploading(false);
                // TODO: Subir a API
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    });

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Guardar en API
        console.log('Guardando perfil:', formData);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gestiona tu información personal
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Avatar Card */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                            Foto de Perfil
                        </h3>

                        {/* Avatar Upload */}
                        <div
                            {...getRootProps()}
                            className={`relative mx-auto w-32 h-32 rounded-full cursor-pointer group ${isDragActive ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                                }`}
                        >
                            <input {...getInputProps()} />
                            {avatar ? (
                                <Image
                                    src={avatar}
                                    alt="Avatar"
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                                    {getInitials(formData.name || 'US')}
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {isUploading ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                ) : (
                                    <Camera className="w-8 h-8 text-white" />
                                )}
                            </div>
                        </div>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                            Haz clic o arrastra una imagen
                        </p>
                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
                            JPG, PNG o WEBP. Máx 5MB
                        </p>

                        {/* Role Badge */}
                        <div className="mt-6 text-center">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-medium">
                                <Shield className="w-4 h-4" />
                                {user?.role || 'Usuario'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="lg:col-span-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Información Personal
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Nombre Completo
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <User className="w-5 h-5" />
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Tu nombre"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Correo Electrónico
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="w-5 h-5" />
                                    </span>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="correo@cermont.com"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Teléfono
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Phone className="w-5 h-5" />
                                    </span>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="+57 300 000 0000"
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
