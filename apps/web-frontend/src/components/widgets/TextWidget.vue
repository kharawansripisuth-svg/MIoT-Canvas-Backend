<script setup>
import { computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

// Simple Markdown parser
const parseMarkdown = (text) => {
  if (!text) return ''

  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>')

    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')

    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del class="text-gray-400">$1</del>')

    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-pink-600">$1</code>')

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 hover:underline">$1</a>')

    // Unordered lists
    .replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-4">$1</li>')

    // Ordered lists
    .replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')

    // Blockquotes
    .replace(/^>\s+(.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>')

    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-gray-200">')

    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>')

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote')) {
    html = '<p class="mb-2">' + html + '</p>'
  }

  // Wrap consecutive li elements in ul
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="list-disc mb-2">$&</ul>')

  return html
}

const fontSizeClasses = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl'
}

const alignmentClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
}

const fontWeightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold'
}

const containerClasses = computed(() => {
  return [
    fontSizeClasses[props.config.fontSize] || 'text-base',
    alignmentClasses[props.config.alignment] || 'text-left',
    fontWeightClasses[props.config.fontWeight] || 'font-normal'
  ].join(' ')
})

const renderedContent = computed(() => {
  if (props.config.enableMarkdown !== false) {
    return parseMarkdown(props.config.content || '')
  }
  return (props.config.content || '').split('\n').map(line => `<p class="mb-1">${line || '&nbsp;'}</p>`).join('')
})
</script>

<template>
  <div
    class="h-full p-3 rounded-lg overflow-auto prose prose-sm max-w-none"
    :class="containerClasses"
    :style="{
      backgroundColor: config.backgroundColor || '#ffffff',
      color: config.textColor || '#374151'
    }"
  >
    <div v-html="renderedContent"></div>
  </div>
</template>

<style scoped>
.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  color: inherit;
}

.prose :deep(a) {
  color: #2563eb;
}

.prose :deep(code) {
  color: #db2777;
}

.prose :deep(blockquote) {
  color: #6b7280;
}
</style>
