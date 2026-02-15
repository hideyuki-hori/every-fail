import { Context } from 'effect'

export class Doc extends Context.Tag('Doc')<Doc, Document>() {}
