export class AppError extends Error { constructor(status, message, details) { super(message); this.status = status; this.details = details; } }
export const notFound = (resource = 'Student') => new AppError(404, `${resource} not found`);
export function errorHandler(error, _request, response, _next) {
  if (error?.code === 'SQLITE_CONSTRAINT' || /UNIQUE constraint failed: students\.enrollment_number/.test(error?.message || '')) return response.status(409).json({ error: { message: 'Enrollment number already exists' } });
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return response.status(status).json({ error: { message: status >= 500 ? 'Something went wrong. Please try again.' : error.message, ...(error.details ? { details: error.details } : {}) } });
}
