export function maskEmailForLogs(email: string): string {
  const trimmed = (email ?? '').trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0 || atIndex === trimmed.length - 1) {
    return '***';
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const firstChar = local[0] ?? '*';

  return `${firstChar}***@${domain}`;
}
