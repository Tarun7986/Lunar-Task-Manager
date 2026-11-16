// ============================================
// core.js  –  Data, LocalStorage, CRUD
// ============================================

const STORAGE_KEY = 'hacker_tasks_v1'

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function createTask({ title, description = '', priority = 'medium', dueDate = '' }) {
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description.trim(),
    priority,
    dueDate: dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function updateTask(tasks, id, updates) {
  return tasks.map(t =>
    t.id === id
      ? { ...t, ...updates, updatedAt: new Date().toISOString() }
      : t
  )
}

export function deleteTask(tasks, id) {
  return tasks.filter(t => t.id !== id)
}

export function toggleComplete(tasks, id) {
  return tasks.map(t =>
    t.id === id
      ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() }
      : t
  )
}

export function filterTasks(tasks, { search = '', status = 'all', priority = 'all' }) {
  return tasks.filter(t => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())

    const matchStatus =
      status === 'all' ||
      (status === 'pending' && !t.completed) ||
      (status === 'completed' && t.completed)

    const matchPriority = priority === 'all' || t.priority === priority

    return matchSearch && matchStatus && matchPriority
  })
}

export function getStats(tasks) {
  return {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    high: tasks.filter(t => t.priority === 'high' && !t.completed).length
  }
}

// Helper: check if a task is overdue
export function isOverdue(task) {
  if (!task.dueDate || task.completed) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(task.dueDate)
  return due < today
}