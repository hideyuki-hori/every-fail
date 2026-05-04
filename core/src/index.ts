export type Meta = {
  id: string
  title: string
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'published'
  ogImage?: string
}
