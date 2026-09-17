import { getCategoryColor } from '../lib/categories'

export default function CategoryBadge({ categoryId, name, style }) {
  if (!name) return null
  const color = getCategoryColor(categoryId)
  return (
    <span
      className="category-pill"
      style={{ background: `${color}22`, color, ...style }}
    >
      {name}
    </span>
  )
}
