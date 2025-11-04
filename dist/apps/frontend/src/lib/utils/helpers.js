import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function formatNumber(value, locale = 'es-ES') {
    return new Intl.NumberFormat(locale).format(value);
}
export function formatDate(date, options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
}) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
}
export function formatRelativeTime(date) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'hace unos segundos';
    if (diffInSeconds < 3600)
        return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400)
        return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800)
        return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    if (diffInSeconds < 2592000)
        return `hace ${Math.floor(diffInSeconds / 604800)} semanas`;
    if (diffInSeconds < 31536000)
        return `hace ${Math.floor(diffInSeconds / 2592000)} meses`;
    return `hace ${Math.floor(diffInSeconds / 31536000)} años`;
}
export function truncate(str, length, suffix = '...') {
    if (str.length <= length)
        return str;
    return str.slice(0, length) + suffix;
}
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
export function downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    }
    catch (error) {
        console.error('Error copiando al portapapeles:', error);
        return false;
    }
}
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
//# sourceMappingURL=helpers.js.map