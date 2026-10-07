import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const status = (err as { status?: number }).status ?? 500
  console.error('[BLEED API error]', err)
  // In production, never leak internal error details to callers
  if (process.env['NODE_ENV'] === 'production' && status >= 500) {
    res.status(status).json({ error: 'Internal server error' })
    return
  }
  const message = err instanceof Error ? err.message : 'Internal server error'
  res.status(status).json({ error: message })
}
