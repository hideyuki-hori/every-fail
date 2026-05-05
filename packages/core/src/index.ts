export type Meta = {
  id: string
  title: string
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  status: 'draft' | 'published'
  ogImage?: string
}

export type LogFn = (...args: unknown[]) => void
