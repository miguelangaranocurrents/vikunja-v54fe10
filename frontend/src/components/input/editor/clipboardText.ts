import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

// Plain text for the clipboard. ProseMirror's default flattens lists into bare
// paragraphs, so the bullets and numbers are kept as markdown-style markers.
export function sliceToPlainText(slice: Slice): string {
	return childLines(slice.content).join('\n')
}

function blockLines(node: ProseMirrorNode): string[] {
	if (node.isTextblock) {
		return [node.textContent]
	}

	switch (node.type.name) {
		case 'bulletList':
		case 'taskList':
			return listLines(node, () => '- ')
		case 'orderedList':
			return listLines(node, index => `${index + 1}. `)
		default:
			return childLines(node)
	}
}

function listLines(list: ProseMirrorNode, marker: (index: number) => string): string[] {
	const lines: string[] = []
	list.forEach((item, _offset, index) => {
		childLines(item).forEach((line, lineIndex) => {
			// continuation lines of a multi-block item are indented under its marker
			lines.push((lineIndex === 0 ? marker(index) : '  ') + line)
		})
	})
	return lines
}

function childLines(parent: Fragment | ProseMirrorNode): string[] {
	const lines: string[] = []
	parent.forEach(child => {
		lines.push(...blockLines(child))
	})
	return lines
}
