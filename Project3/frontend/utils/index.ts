export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`
  
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function buildDirectoryTree(directories: any[]): any[] {
  const map = new Map()
  const tree: any[] = []
  
  directories.forEach(dir => {
    map.set(dir._id, { ...dir, children: [] })
  })
  
  directories.forEach(dir => {
    const node = map.get(dir._id)
    if (dir.parentId && map.has(dir.parentId)) {
      map.get(dir.parentId).children.push(node)
    } else {
      tree.push(node)
    }
  })
  
  const sortTree = (items: any[]): any[] => {
    return items
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'zh-CN'))
      .map(item => ({ ...item, children: sortTree(item.children) }))
  }
  
  return sortTree(tree)
}

export function stripHtml(html: string): string {
  if (!html) return ''
  if (typeof document === 'undefined') {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
  }
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}
