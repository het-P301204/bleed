import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/error.js'
import { rejectPathTraversal, rejectOversizedBody, rejectInvalidLabTarget } from './middleware/validate.js'
import sourcesRouter from './routes/sources.js'
import gadgetsRouter from './routes/gadgets.js'
import chainsRouter from './routes/chains.js'
import runsRouter from './routes/runs.js'
import labRouter from './routes/lab.js'
import scenariosRouter from './routes/scenarios.js'
import metricsRouter from './routes/metrics.js'
import dependenciesRouter from './routes/dependencies.js'
import researchRouter from './routes/research.js'

const ALLOWED_ORIGINS = (process.env['CORS_ORIGINS'] ?? 'http://localhost:4000,http://localhost:5173').split(',')
const API_TOKEN = process.env['BLEED_API_TOKEN']

function requireToken(req: Request, res: Response, next: NextFunction): void {
  if (!API_TOKEN) { next(); return } // dev mode: no token required when env var is absent
  const auth = req.headers['authorization']
  if (auth !== `Bearer ${API_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

export function createApp() {
  const app = express()

  app.use(cors({ origin: ALLOWED_ORIGINS }))
  app.use(rejectOversizedBody)
  app.use(express.json({ limit: '1mb' }))
  app.use(rejectPathTraversal)

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() })
  })

  app.use('/api', requireToken)
  app.use('/api/sources', sourcesRouter)
  app.use('/api/gadgets', gadgetsRouter)
  app.use('/api/chains', chainsRouter)
  app.use('/api/runs', runsRouter)
  app.use('/api/lab', labRouter)
  app.use('/api/scenarios', rejectInvalidLabTarget, scenariosRouter)
  app.use('/api/metrics', metricsRouter)
  app.use('/api/dependency-scan', rejectInvalidLabTarget, dependenciesRouter)
  app.use('/api/research', researchRouter)

  app.use(errorHandler)

  return app
}

const PORT = Number(process.env['PORT'] ?? 4001)

const app = createApp()
app.listen(PORT, () => {
  console.log(`BLEED API running on port ${PORT}`)
})
