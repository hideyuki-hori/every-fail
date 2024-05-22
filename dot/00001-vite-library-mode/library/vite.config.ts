import { defineConfig } from 'vite'
import { resolve } from 'path'
import url from '@rollup/plugin-url'
import copy from 'rollup-plugin-copy'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.ts'),
      name: 'Counter',
      fileName: _ => `main.[hash].js`,
      formats: ['umd'],
    },
    rollupOptions: {
      plugins: [
        url({
          limit: 0,
          include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
          emitFiles: true,
          fileName: '[name].[hash][ext]',
          publicPath: '/',
          destDir: 'dist',
        }),
        copy({
          targets: [
            { src: 'lib/assets/*', dest: 'assets/dist/assets' }
          ],
          hook: 'writeBundle',
        })
      ],
      output: {
        assetFileNames: '[name].[hash][extname]',
      },
    },
  },
})
