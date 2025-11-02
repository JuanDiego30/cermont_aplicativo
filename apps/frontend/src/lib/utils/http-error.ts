export type NormalizedError = { message: string; code?: string; status?: number };
export function normalizeError(e: unknown): NormalizedError {
  if (e && typeof e === 'object' && 'response' in e && e.response && typeof e.response === 'object' && 'data' in e.response && e.response.data && typeof e.response.data === 'object' && 'error' in e.response.data && e.response.data.error && typeof e.response.data.error === 'object' && 'message' in e.response.data.error) {
    return { message: String(e.response.data.error.message), code: 'code' in e.response.data.error ? String(e.response.data.error.code) : undefined, status: 'status' in e.response ? Number(e.response.status) : undefined };
  }
  if (e && typeof e === 'object' && 'message' in e) return { message: String(e.message) };
  return { message: 'Error inesperado' };
}