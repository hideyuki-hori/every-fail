import type { DotContext, Meta, Unmount } from '@every-fail/dot-sdk'

type DotModule = {
  mount: (c: DotContext) => Unmount
  meta: Meta
}

const modules = import.meta.glob<DotModule>('../../../dots/*/main.ts', {
  eager: true,
})

const byId = new Map<string, DotModule>()
for (const m of Object.values(modules)) {
  byId.set(m.meta.id, m)
}

export const getDotById = (id: string) => byId.get(id)
export const allDots = () => Array.from(byId.values())
