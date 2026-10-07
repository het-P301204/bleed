import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@bleed/shared': resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@bleed/gadget-engine': resolve(__dirname, '../../packages/gadget-engine/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
