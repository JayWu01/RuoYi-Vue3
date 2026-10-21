export function isTrendUp(value, fallback = true) {
  if (typeof value === 'number') {
    return value >= 0
  }

  const text = String(value ?? '').trim()
  if (!text || text === '-') {
    return fallback
  }
  if (text.startsWith('↑') || text.startsWith('+')) {
    return true
  }
  if (text.startsWith('↓') || text.startsWith('-')) {
    return false
  }

  const number = Number.parseFloat(text.replaceAll(',', '').replace('%', ''))
  return Number.isFinite(number) ? number >= 0 : fallback
}
