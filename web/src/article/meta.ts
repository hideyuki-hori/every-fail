import { Schema } from 'effect'

export class ArticleMeta extends Schema.Class<ArticleMeta>('ArticleMeta')({
  title: Schema.String,
  description: Schema.String,
}) {}
