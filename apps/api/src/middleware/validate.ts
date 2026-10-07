import type { Request, Response, NextFunction } from 'express'

const LAB_TARGET_ALLOWLIST = new Set(['http-sim', 'auth-sim', 'metadata-sim', 'internal-api'])

export function rejectOversizedBody(_req: Request, _res: Response, next: NextFunction): void {
  // Body-size enforcement is handled by express.json({limit:'1mb'}) which measures
  // actual bytes received, not the client-supplied Content-Length header.
  next()
}

export function rejectPathTraversal(req: Request, res: Response, next: NextFunction): void {
  // Check path, params, query string, and parsed body (body is parsed before this middleware runs)
  const raw = req.path + JSON.stringify(req.params) + JSON.stringify(req.query) + JSON.stringify(req.body ?? {})
  if (raw.includes('..') || raw.toLowerCase().includes('%2e%2e')) {
    res.status(400).json({ error: 'Path traversal attempt detected' })
    return
  }
  next()
}

export function validateLabTarget(labTarget: unknown): labTarget is string {
  return typeof labTarget === 'string' && LAB_TARGET_ALLOWLIST.has(labTarget)
}

export function rejectInvalidLabTarget(req: Request, res: Response, next: NextFunction): void {
  const target = (req.body as Record<string, unknown>)['labTarget']
  if (target !== undefined && !validateLabTarget(target)) {
    res.status(400).json({ error: `Invalid labTarget. Allowed: ${[...LAB_TARGET_ALLOWLIST].join(', ')}` })
    return
  }
  next()
}
