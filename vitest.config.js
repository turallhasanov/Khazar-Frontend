import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Tests reuse the app's Vite config (the @ alias, React plugin) and run in jsdom. Test files live next to what they
// test in __tests__ folders; the production build never imports them.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{js,jsx}'],
      setupFiles: ['./src/test/setup.js'],
      restoreMocks: true,
    },
  }),
)
