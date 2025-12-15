'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, RefreshCw, LogIn, AlertCircle } from 'lucide-react';

interface Email {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    date: string;
    read: boolean;
}

interface AuthUrlResponse {
    authUrl: string;
}

interface EmailsResponse {
    success: boolean;
    emails?: Email[];
    error?: string;
}

export default function EmailsPage() {
    const { user } = useAuth();
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authorized, setAuthorized] = useState(false);
    const [searchQuery, setSearchQuery] = useState('from:cermont@');
    const [accessToken, setAccessToken] = useState<string | null>(null);

    // Check for access token in URL (callback) or localStorage
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const storedToken = localStorage.getItem('gmail_access_token');

        if (code) {
            // Exchange code for token
            setLoading(true);
            apiClient.post<{ success: boolean; accessToken?: string; error?: string }>('/emails/auth-callback', { code })
                .then((res) => {
                    if (res.success && res.accessToken) {
                        setAccessToken(res.accessToken);
                        localStorage.setItem('gmail_access_token', res.accessToken);
                        setAuthorized(true);
                        // Clear URL
                        window.history.replaceState({}, document.title, '/dashboard/emails');
                    } else {
                        setError(res.error || 'Unknown error');
                    }
                })
                .catch((err) => setError('Failed to exchange code'))
                .finally(() => setLoading(false));
        } else if (storedToken) {
            setAccessToken(storedToken);
            setAuthorized(true);
        }
    }, []);

    // Solicitar autorización
    const requestGmailAuthorization = async () => {
        try {
            const response = await apiClient.get<AuthUrlResponse>('/emails/auth-url');
            // Redirect to Google
            window.location.href = response.authUrl;
        } catch (err) {
            setError('Error obtaining Gmail authorization URL');
        }
    };

    // Obtener emails
    const fetchEmails = async () => {
        if (!accessToken) return;

        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.get<EmailsResponse>('/emails', {
                maxResults: '10',
                query: searchQuery,
                accessToken: accessToken,
            });

            if (response.success && response.emails) {
                setEmails(response.emails);
            } else {
                if (response.error?.includes('authorization') || response.error?.includes('token')) {
                    setAuthorized(false);
                    localStorage.removeItem('gmail_access_token');
                    setError('Sesión de Gmail expirada. Por favor autoriza nuevamente.');
                } else {
                    setError(response.error ?? 'Error desconocido');
                }
            }
        } catch (err: unknown) {
            console.error(err);
            setError('Error fetching emails');
        } finally {
            setLoading(false);
        }
    };

    // Cargar emails cuando estamos autorizados
    useEffect(() => {
        if (authorized && accessToken) {
            fetchEmails();
        }
    }, [authorized, accessToken]);

    // Solo admin/supervisores pueden ver
    if (user && user.role !== 'admin' && user.role !== 'supervisor') {
        return (
            <div className="flex items-center justify-center min-h-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Acceso denegado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            Solo administradores y supervisores pueden ver los emails de Cermont.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Emails Cermont</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Panel de correos de la empresa Cermont SAS
                </p>
            </div>

            {/* Autorización */}
            {!authorized && (
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900">
                    <CardHeader>
                        <CardTitle className="text-yellow-800 dark:text-yellow-500">Autorización requerida</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-yellow-700 dark:text-yellow-600">
                            Necesitas autorizar el acceso a Gmail para ver los correos de Cermont.
                        </p>
                        <Button
                            onClick={requestGmailAuthorization}
                            className="flex items-center gap-2"
                        >
                            <LogIn size={18} />
                            Autorizar con Gmail
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Filtro y acciones */}
            {authorized && (
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y acciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Ej: from:cermont@ OR to:cermont@"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                onClick={fetchEmails}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                {loading ? 'Cargando...' : 'Buscar'}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Usa sintaxis de Gmail: from:, to:, subject:, etc.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Error message */}
            {error && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900">
                    <CardContent className="pt-6 flex items-start gap-3">
                        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-semibold text-red-900 dark:text-red-500">Error</p>
                            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Lista de emails */}
            {authorized && emails.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Correos ({emails.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {emails.map((email) => (
                                <div
                                    key={email.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 cursor-pointer transition"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className={`font-semibold ${email.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white font-bold'}`}>
                                                {email.subject}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                De: {email.from}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 line-clamp-2">
                                                {email.snippet}
                                            </p>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-xs text-gray-500">
                                                {new Date(email.date).toLocaleDateString('es-CO')}
                                            </p>
                                            {!email.read && (
                                                <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                                                    Sin leer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {authorized && emails.length === 0 && !loading && (
                <Card className="border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20">
                    <CardContent className="pt-6 flex items-center justify-center gap-2">
                        <Mail className="text-gray-400" size={20} />
                        <p className="text-gray-600 dark:text-gray-400">No hay correos que coincidan con tu búsqueda</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
