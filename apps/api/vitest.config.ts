import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@bleed/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@bleed/runtime-model': resolve(__dirname, '../../packages/runtime-model/src/index.ts'),
      '@bleed/gadget-engine': resolve(__dirname, '../../packages/gadget-engine/src/index.ts'),
      '@bleed/chain-engine': resolve(__dirname, '../../packages/chain-engine/src/index.ts'),
      '@bleed/evidence': resolve(__dirname, '../../packages/evidence/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
