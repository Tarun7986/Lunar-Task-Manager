// ============================================
// ui.js  –  Visual helpers & small animations
// ============================================

export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function priorityClass(priority) {
  return `prio-${priority}`
}

export function statusLabel(completed) {
  return completed ? 'DONE' : 'OPEN'
}

// Simple typewriter effect for terminal feel
export function typeText(element, text, speed = 18) {
  if (!element) return
  element.textContent = ''
  let i = 0
  const timer = setInterval(() => {
    element.textContent += text[i]
    i++
    if (i >= text.length) clearInterval(timer)
  }, speed)
  return timer
}

// Flash a temporary class (used for save feedback)
export function flash(el, className = 'flash', ms = 600) {
  if (!el) return
  el.classList.add(className)
  setTimeout(() => el.classList.remove(className), ms)
}