import type { Request, Response, NextFunction } from 'express'

const LAB_TARGET_ALLOWLIST = new Set(['http-sim', 'auth-sim', 'metadata-sim', 'internal-api'])

export function rejectOversizedBody(req: Request, res: Response, next: NextFunction): void {
  const contentLength = Number(req.headers['content-length'] ?? 0)
  if (contentLength > 1_048_576) {
    res.status(413).json({ error: 'Request body too large (max 1 MB)' })
    return
  }
  next()
}

export function rejectPathTraversal(req: Request, res: Response, next: NextFunction): void {
  const raw = req.path + JSON.stringify(req.params)
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
