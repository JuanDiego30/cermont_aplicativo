import { type ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
export declare function formatNumber(value: number, locale?: string): string;
export declare function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string;
export declare function formatRelativeTime(date: Date | string): string;
export declare function truncate(str: string, length: number, suffix?: string): string;
export declare function capitalize(str: string): string;
export declare function generateId(): string;
export declare function isValidEmail(email: string): boolean;
export declare function downloadBlob(blob: Blob, filename: string): void;
export declare function copyToClipboard(text: string): Promise<boolean>;
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void;
//# sourceMappingURL=helpers.d.ts.map