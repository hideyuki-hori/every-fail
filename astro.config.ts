// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import solidJs from '@astrojs/solid-js'
import { rehypeTrimKeywordSpaces } from './src/plugins/rehype-trim-keyword-spaces.js'
import remarkBreaks from 'remark-breaks'

export default defineConfig({
  integrations: [mdx(), solidJs()],
  vite: {
    plugins: [tailwindcss()]
  },
  markdown: {
    shikiConfig: {
      theme: {
        name: 'custom',
        settings: [
          { scope: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'], settings: { foreground: '#FF7B72' } },
          { scope: ['keyword.operator', 'punctuation'], settings: { foreground: '#C9D1D9' } },
          { scope: ['string'], settings: { foreground: '#A5D6FF' } },
          { scope: ['comment'], settings: { foreground: '#8b949e', fontStyle: 'italic' } },
          { scope: ['variable', 'variable.other'], settings: { foreground: '#C9D1D9' } },
          { scope: ['constant', 'constant.numeric'], settings: { foreground: '#79C0FF' } },
          { scope: ['entity.name.function'], settings: { foreground: '#D2A8FF' } },
          { scope: ['entity.name.type', 'entity.name.class'], settings: { foreground: '#7EE787' } },
          { scope: ['support.function'], settings: { foreground: '#D2A8FF' } },
        ],
        colors: {
          'editor.background': '#161b22',
          'editor.foreground': '#c9d1d9',
        }
      },
    },
    remarkPlugins: [remarkBreaks],
    rehypePlugins: [rehypeTrimKeywordSpaces]
  }
})