import { visit } from 'unist-util-visit'

const colorToTokenClass = {
  '#FF7B72': 'keyword',
  '#A5D6FF': 'string',
  '#8b949e': 'comment',
  '#C9D1D9': 'punctuation',
  '#79C0FF': 'constant',
  '#D2A8FF': 'function',
  '#7EE787': 'type',
}

export function rehypeTrimKeywordSpaces() {
  return tree => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'pre' && node.properties?.style) {
        delete node.properties.style
      }

      if (node.tagName === 'span' && node.properties?.style) {
        const style = node.properties.style

        for (const [color, tokenClass] of Object.entries(colorToTokenClass)) {
          if (style.includes(`color:${color}`)) {
            node.properties.className = [
              ...(node.properties.className || []),
              'token',
              tokenClass,
            ]
            delete node.properties.style

            if (tokenClass === 'keyword') {
              const textNode = node.children[0]
              if (textNode?.type === 'text' && /^\s+/.test(textNode.value)) {
                const match = textNode.value.match(/^(\s+)(.*)/)
                if (match) {
                  const [, spaces, keyword] = match
                  textNode.value = keyword
                  parent.children.splice(index, 0, {
                    type: 'text',
                    value: spaces,
                  })
                }
              }
            }
            break
          }
        }
      }
    })
  }
}
