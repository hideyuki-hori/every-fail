import { defineCollection, getCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

function formatDate(date: Date) {
  return date.toISOString().split('T')[0]
}

const blogSchema = z.object({
  kind: z.literal('blog'),
  title: z.string(),
  at: z.coerce.date(),
  tags: z.array(z.string()),
})

const planSchema = z
  .object({
    kind: z.literal('plan'),
    at: z.coerce.date(),
    tags: z.array(z.string()),
    start: z.coerce.date(),
    end: z.coerce.date(),
    sprint: z.coerce.number(),
  })
  .transform(data => ({
    ...data,
    title: `Sprint ${data.sprint} / 計画 ${formatDate(data.start)} to ${formatDate(data.end)}`,
  }))

const retroSchema = z
  .object({
    kind: z.literal('retro'),
    at: z.coerce.date(),
    tags: z.array(z.string()),
    start: z.coerce.date(),
    end: z.coerce.date(),
    sprint: z.coerce.number(),
  })
  .transform(data => ({
    ...data,
    title: `shard / sprint ${data.sprint} の振り返り`,
  }))

const issueRetroSchema = z.object({
  kind: z.literal('issue').optional().default('issue'),
  issue: z.number(),
  title: z.string(),
  url: z.string().url(),
  status: z.string(),
  start: z.coerce.date().nullable(),
  end: z.coerce.date().nullable(),
  estimated: z.number().nullable(),
  actual: z.number().nullable(),
})

const contentSchema = z.union([
  blogSchema,
  planSchema,
  retroSchema,
  issueRetroSchema,
])

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content' }),
  schema: contentSchema,
})

export const collections = { posts }

export const getPosts = () => getCollection('posts')
