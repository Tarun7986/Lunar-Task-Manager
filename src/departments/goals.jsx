
import React, { useState, useEffect, useMemo } from 'react'

const STORAGE_KEY = 'lunar_goals_v1'

function loadGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Could not load goals:', error)
    return []
  }
}

function saveGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  } catch (error) {
    console.error('Could not save goals:', error)
  }
}

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'planned',
  targetDate: ''
}

export default function Goals() {
  const [goals, setGoals] = useState(() => loadGoals())
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })

  useEffect(() => {
    saveGoals(goals)
  }, [goals])

  const stats = useMemo(() => ({
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    planned: goals.filter(g => g.status === 'planned').length
  }), [goals])

  function openAdd() {
    setForm({ ...emptyForm })
    setModal({ mode: 'add' })
  }

  function openEdit(goal) {
    setForm({
      title: goal.title || '',
      description: goal.description || '',
      priority: goal.priority || 'medium',
      status: goal.status || 'planned',
      targetDate: goal.targetDate || ''
    })

    setModal({
      mode: 'edit',
      id: goal.id
    })
  }

  function closeModal() {
    setModal(null)
    setForm({ ...emptyForm })
  }

  function updateForm(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const title = form.title.trim()
    if (!title || !modal) return

    const now = new Date().toISOString()

    if (modal.mode === 'add') {
      const newGoal = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
        ...form,
        title,
        description: form.description.trim(),
        createdAt: now,
        updatedAt: now
      }

      setGoals(prev => [newGoal, ...prev])
    }

    if (modal.mode === 'edit') {
      setGoals(prev =>
        prev.map(goal =>
          goal.id === modal.id
            ? {
                ...goal,
                ...form,
                title,
                description: form.description.trim(),
                updatedAt: now
              }
            : goal
        )
      )
    }

    closeModal()
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this goal?')) return

    setGoals(prev => prev.filter(goal => goal.id !== id))
  }

  function setStatus(id, status) {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === id
          ? {
              ...goal,
              status,
              updatedAt: new Date().toISOString()
            }
          : goal
      )
    )
  }

  const statusColor = {
    planned: '',
    active: 'ok',
    completed: 'ok',
    paused: ''
  }

  return (
    <div className="department">

      {/* STATS */}
      <div className="stats">

        <div className="stat">
          <span className="label">TOTAL</span>
          <span className="value">{stats.total}</span>
        </div>

        <div className="stat">
          <span className="label">ACTIVE</span>
          <span className="value ok">{stats.active}</span>
        </div>

        <div className="stat">
          <span className="label">PLANNED</span>
          <span className="value warn">{stats.planned}</span>
        </div>

        <div className="stat">
          <span className="label">DONE</span>
          <span className="value">{stats.completed}</span>
        </div>

      </div>

      {/* HEADER */}
      <div className="filters">
        <div style={{ flex: 1 }} />

        <button
          type="button"
          className="btn primary"
          onClick={openAdd}
        >
          + NEW_GOAL
        </button>
      </div>

      {/* GOALS LIST */}
      <div className="goals-list">

        {goals.length === 0 && (
          <div className="empty">
            // no goals yet — create your first one
          </div>
        )}

        {goals.map(goal => (
          <article
            key={goal.id}
            className={`card ${goal.status === 'completed' ? 'done' : ''}`}
          >

            {/* CARD TOP */}
            <div className="card-top">

              <span className={`badge prio-${goal.priority || 'medium'}`}>
                {(goal.priority || 'medium').toUpperCase()}
              </span>

              <span className={`status ${statusColor[goal.status] || ''}`}>
                {(goal.status || 'planned').toUpperCase()}
              </span>

            </div>

            {/* CARD CONTENT */}
            <h3 className="card-title">
              {goal.title}
            </h3>

            {goal.description && (
              <p className="card-desc">
                {goal.description}
              </p>
            )}

            {/* CARD FOOTER */}
            <div className="card-foot">

              <div className="meta">
                {goal.targetDate && (
                  <span className="due">
                    target {goal.targetDate}
                  </span>
                )}
              </div>

              {/* ACTIONS */}
              <div className="actions">

                {goal.status !== 'active' && (
                  <button
                    type="button"
                    className="icon-btn"
                    title="Activate"
                    onClick={() => setStatus(goal.id, 'active')}
                  >
                    ▶
                  </button>
                )}

                {goal.status !== 'completed' && (
                  <button
                    type="button"
                    className="icon-btn"
                    title="Complete"
                    onClick={() => setStatus(goal.id, 'completed')}
                  >
                    ✓
                  </button>
                )}

                {goal.status !== 'paused' &&
                  goal.status !== 'completed' && (
                    <button
                      type="button"
                      className="icon-btn"
                      title="Pause"
                      onClick={() => setStatus(goal.id, 'paused')}
                    >
                      Ⅱ
                    </button>
                  )}

                {goal.status !== 'planned' && (
                  <button
                    type="button"
                    className="icon-btn"
                    title="Move to planned"
                    onClick={() => setStatus(goal.id, 'planned')}
                  >
                    ↺
                  </button>
                )}

                <button
                  type="button"
                  className="icon-btn"
                  title="Edit goal"
                  onClick={() => openEdit(goal)}
                >
                  ✎
                </button>

                <button
                  type="button"
                  className="icon-btn danger"
                  title="Delete goal"
                  onClick={() => handleDelete(goal.id)}
                >
                  ✕
                </button>

              </div>

            </div>

          </article>
        ))}

      </div>

      {/* MODAL */}
      {modal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >

            <form onSubmit={handleSubmit}>

              <div className="modal-head">

                <span className="prompt">
                  {modal.mode === 'add'
                    ? 'new://goal'
                    : `edit://${String(modal.id).slice(0, 8)}`}
                </span>

                <button
                  type="button"
                  className="icon-btn"
                  onClick={closeModal}
                >
                  ✕
                </button>

              </div>

              <label>
                TITLE

                <input
                  autoFocus
                  required
                  value={form.title}
                  onChange={e => updateForm('title', e.target.value)}
                  placeholder="what do you want to achieve?"
                />
              </label>

              <label>
                DESCRIPTION

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="optional details..."
                />
              </label>

              <label>
                TARGET DATE

                <input
                  type="date"
                  value={form.targetDate}
                  onChange={e => updateForm('targetDate', e.target.value)}
                />
              </label>

              <label>
                PRIORITY

                <div className="prio-group">
                  {['low', 'medium', 'high'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`prio-btn ${
                        form.priority === p ? 'on' : ''
                      } prio-${p}`}
                      onClick={() => updateForm('priority', p)}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                STATUS

                <div className="prio-group">
                  {['planned', 'active', 'completed', 'paused'].map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`prio-btn ${
                        form.status === s ? 'on' : ''
                      }`}
                      onClick={() => updateForm('status', s)}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </label>

              <div className="modal-actions">

                <button
                  type="button"
                  className="btn ghost"
                  onClick={closeModal}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="btn primary"
                >
                  {modal.mode === 'add' ? 'CREATE' : 'UPDATE'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
