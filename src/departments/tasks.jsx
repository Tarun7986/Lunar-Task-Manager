import React, { useState, useEffect, useMemo } from 'react'

import {
  loadTasks,
  saveTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleComplete,
  filterTasks,
  getStats,
  isOverdue
} from '../core.js'

import { formatDate, priorityClass, statusLabel } from '../ui.js'

export default function Tasks() {
  // Load saved tasks immediately.
  const [tasks, setTasks] = useState(() => {
    try {
      return loadTasks()
    } catch (error) {
      console.error('Could not load tasks:', error)
      return []
    }
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [prioFilter, setPrioFilter] = useState('all')
  const [modal, setModal] = useState(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  })

  // Automatically save whenever tasks change.
  useEffect(() => {
    try {
      saveTasks(tasks)
    } catch (error) {
      console.error('Could not save tasks:', error)
    }
  }, [tasks])

  const stats = useMemo(
    () => getStats(tasks),
    [tasks]
  )

  const visible = useMemo(
    () => filterTasks(tasks, {
      search,
      status: statusFilter,
      priority: prioFilter
    }),
    [tasks, search, statusFilter, prioFilter]
  )

  const pending = visible.filter(t => !t.completed)
  const completed = visible.filter(t => t.completed)

  function openAdd() {
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: ''
    })

    setModal('add')
  }

  function openEdit(task) {
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate || ''
    })

    setModal(task)
  }

  function openDetail(task) {
    setModal({
      ...task,
      mode: 'detail'
    })
  }

  function closeModal() {
    setModal(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!form.title.trim()) return

    if (modal === 'add') {
      const newTask = createTask(form)
      setTasks(prev => [newTask, ...prev])
    } else if (modal && modal.id) {
      setTasks(prev => updateTask(prev, modal.id, form))
    }

    closeModal()
  }

  function handleToggle(id) {
    setTasks(prev => toggleComplete(prev, id))
  }

  function handleDelete(id) {
    if (confirm('Delete this task permanently?')) {
      setTasks(prev => deleteTask(prev, id))
      closeModal()
    }
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
          <span className="label">PENDING</span>
          <span className="value warn">{stats.pending}</span>
        </div>

        <div className="stat">
          <span className="label">DONE</span>
          <span className="value ok">{stats.completed}</span>
        </div>

        <div className="stat">
          <span className="label">HIGH</span>
          <span className="value high">{stats.high}</span>
        </div>
      </div>

      {/* FILTERS + ADD */}
      <div className="filters">
        <input
          className="search"
          type="text"
          placeholder="search://title | desc"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">ALL_STATUS</option>
          <option value="pending">PENDING</option>
          <option value="completed">COMPLETED</option>
        </select>

        <select
          value={prioFilter}
          onChange={e => setPrioFilter(e.target.value)}
        >
          <option value="all">ALL_PRIORITY</option>
          <option value="high">HIGH</option>
          <option value="medium">MEDIUM</option>
          <option value="low">LOW</option>
        </select>

        <button className="btn primary" onClick={openAdd}>
          + NEW_TASK
        </button>
      </div>

      {/* BOARD */}
      <main className="board">

        {/* PENDING TASKS */}
        <section className="col">
          <div className="col-head">
            <span>PENDING</span>
            <span className="count">{pending.length}</span>
          </div>

          <div className="col-body">
            {pending.length === 0 && (
              <div className="empty">// no open tasks</div>
            )}

            {pending.map(task => (
              <article
                key={task.id}
                className={`card ${priorityClass(task.priority)} ${
                  isOverdue(task) ? 'overdue' : ''
                }`}
                onClick={() => openDetail(task)}
              >
                <div className="card-top">
                  <span className={`badge ${priorityClass(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>

                  <span className="status">
                    {statusLabel(task.completed)}
                  </span>
                </div>

                <h3 className="card-title">{task.title}</h3>

                {task.description && (
                  <p className="card-desc">{task.description}</p>
                )}

                <div className="card-foot">
                  <div className="meta">
                    {task.dueDate && (
                      <span className={`due ${
                        isOverdue(task) ? 'overdue-text' : ''
                      }`}>
                        due {task.dueDate}
                      </span>
                    )}

                    <span className="date">
                      {formatDate(task.createdAt)}
                    </span>
                  </div>

                  <div
                    className="actions"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="icon-btn"
                      onClick={() => handleToggle(task.id)}
                    >
                      ✓
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => openEdit(task)}
                    >
                      ✎
                    </button>

                    <button
                      className="icon-btn danger"
                      onClick={() => handleDelete(task.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* COMPLETED TASKS */}
        <section className="col">
          <div className="col-head">
            <span>COMPLETED</span>
            <span className="count ok">{completed.length}</span>
          </div>

          <div className="col-body">
            {completed.length === 0 && (
              <div className="empty">// no completed tasks</div>
            )}

            {completed.map(task => (
              <article
                key={task.id}
                className={`card done ${priorityClass(task.priority)}`}
                onClick={() => openDetail(task)}
              >
                <div className="card-top">
                  <span className={`badge ${priorityClass(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>

                  <span className="status ok">DONE</span>
                </div>

                <h3 className="card-title">{task.title}</h3>

                {task.description && (
                  <p className="card-desc">{task.description}</p>
                )}

                <div className="card-foot">
                  <span className="date">
                    {formatDate(task.updatedAt)}
                  </span>

                  <div
                    className="actions"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="icon-btn"
                      onClick={() => handleToggle(task.id)}
                    >
                      ↺
                    </button>

                    <button
                      className="icon-btn danger"
                      onClick={() => handleDelete(task.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

      </main>

      {/* MODAL */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal"
            onClick={e => e.stopPropagation()}
          >

            {modal.mode === 'detail' ? (
              <>
                <div className="modal-head">
                  <span className="prompt">
                    task://{modal.id.slice(0, 8)}
                  </span>

                  <button
                    className="icon-btn"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>

                <div className="detail">

                  <div className="detail-row">
                    <span className="label">STATUS</span>

                    <span className={modal.completed ? 'ok' : 'warn'}>
                      {statusLabel(modal.completed)}
                    </span>
                  </div>

                  <div className="detail-row">
                    <span className="label">PRIORITY</span>

                    <span className={priorityClass(modal.priority)}>
                      {modal.priority.toUpperCase()}
                    </span>
                  </div>

                  {modal.dueDate && (
                    <div className="detail-row">
                      <span className="label">DUE DATE</span>

                      <span className={
                        isOverdue(modal) ? 'overdue-text' : ''
                      }>
                        {modal.dueDate}
                      </span>
                    </div>
                  )}

                  <h2 className="detail-title">{modal.title}</h2>

                  {modal.description && (
                    <p className="detail-desc">
                      {modal.description}
                    </p>
                  )}

                  <div className="detail-meta">
                    <div>
                      created {formatDate(modal.createdAt)}
                    </div>

                    <div>
                      updated {formatDate(modal.updatedAt)}
                    </div>
                  </div>

                  <div className="detail-actions">
                    <button
                      className="btn"
                      onClick={() => openEdit(modal)}
                    >
                      EDIT
                    </button>

                    <button
                      className="btn"
                      onClick={() => handleToggle(modal.id)}
                    >
                      {modal.completed ? 'REOPEN' : 'COMPLETE'}
                    </button>

                    <button
                      className="btn danger"
                      onClick={() => handleDelete(modal.id)}
                    >
                      DELETE
                    </button>
                  </div>

                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>

                <div className="modal-head">
                  <span className="prompt">
                    {modal === 'add'
                      ? 'new://task'
                      : `edit://${modal.id.slice(0, 8)}`}
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
                    onChange={e =>
                      setForm({
                        ...form,
                        title: e.target.value
                      })
                    }
                    placeholder="what needs to be done?"
                  />
                </label>

                <label>
                  DESCRIPTION
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={e =>
                      setForm({
                        ...form,
                        description: e.target.value
                      })
                    }
                    placeholder="optional notes..."
                  />
                </label>

                <label>
                  DUE DATE
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={e =>
                      setForm({
                        ...form,
                        dueDate: e.target.value
                      })
                    }
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
                        } ${priorityClass(p)}`}
                        onClick={() =>
                          setForm({
                            ...form,
                            priority: p
                          })
                        }
                      >
                        {p.toUpperCase()}
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

                  <button type="submit" className="btn primary">
                    {modal === 'add' ? 'CREATE' : 'UPDATE'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}