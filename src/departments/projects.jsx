import React, { useEffect, useState } from 'react'

const INITIAL_PROJECTS = []

const STATUSES = ['Planned', 'In Progress', 'Completed', 'On Hold']

export default function Projects() {
  const [projects, setProjects] = useState(() => {
    try {
      const savedProjects = localStorage.getItem('lunar_projects')
      return savedProjects ? JSON.parse(savedProjects) : INITIAL_PROJECTS
    } catch (error) {
      console.error('Could not load saved projects:', error)
      return INITIAL_PROJECTS
    }
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Save projects whenever the project list changes.
  useEffect(() => {
    try {
      localStorage.setItem('lunar_projects', JSON.stringify(projects))
    } catch (error) {
      console.error('Could not save projects:', error)
    }
  }, [projects])

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Planned',
    progress: 0,
    dueDate: '',
  })

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      status: 'Planned',
      progress: 0,
      dueDate: '',
    })
    setEditingId(null)
  }

  const openNewProject = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditProject = (project) => {
    setForm({
      title: project.title,
      description: project.description,
      status: project.status,
      progress: project.progress,
      dueDate: project.dueDate,
    })
    setEditingId(project.id)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.title.trim()) return

    const projectData = {
      ...form,
      progress: Number(form.progress),
      id: editingId || Date.now(),
    }

    if (editingId) {
      setProjects(prev =>
        prev.map(project =>
          project.id === editingId ? projectData : project
        )
      )
    } else {
      setProjects(prev => [projectData, ...prev])
    }

    setShowModal(false)
    resetForm()
  }

  const deleteProject = (id) => {
    if (window.confirm('Delete this project?')) {
      setProjects(prev => prev.filter(project => project.id !== id))
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' || project.status === filter

    return matchesSearch && matchesFilter
  })

  const total = projects.length
  const active = projects.filter(p => p.status === 'In Progress').length
  const completed = projects.filter(p => p.status === 'Completed').length
  const planned = projects.filter(p => p.status === 'Planned').length

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="prompt">root@lunar</span>
          <span className="cmd">~ projects</span>
        </div>

        <div className="header-right">
          <span className="live">● SYSTEM ACTIVE</span>
          <button className="btn primary" onClick={openNewProject}>
            + NEW PROJECT
          </button>
        </div>
      </header>

      {/* STATS */}
      <section className="stats">
        <div className="stat">
          <span className="label">TOTAL PROJECTS</span>
          <span className="value">{total}</span>
        </div>

        <div className="stat">
          <span className="label">IN PROGRESS</span>
          <span className="value warn">{active}</span>
        </div>

        <div className="stat">
          <span className="label">COMPLETED</span>
          <span className="value ok">{completed}</span>
        </div>

        <div className="stat">
          <span className="label">PLANNED</span>
          <span className="value">{planned}</span>
        </div>
      </section>

      {/* FILTERS */}
      <section className="filters">
        <input
          className="search"
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Projects</option>
          {STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </section>

      {/* PROJECT BOARD */}
      <section className="board">
        <div className="col">
          <div className="col-head">
            <span>PROJECT DATABASE</span>
            <span className="count">{filteredProjects.length}</span>
          </div>

          <div className="col-body">
            {filteredProjects.length === 0 ? (
              <div className="empty">
                {search || filter !== 'All'
                  ? 'No matching projects found.'
                  : 'No projects yet. Create your first project.'}
              </div>
            ) : (
              filteredProjects.map(project => (
                <article
                  className={`card ${project.status === 'Completed' ? 'done' : ''}`}
                  key={project.id}
                >
                  <div className="card-top">
                    <span className={`badge ${
                      project.status === 'Completed'
                        ? 'prio-low'
                        : project.status === 'On Hold'
                        ? 'prio-high'
                        : 'prio-medium'
                    }`}>
                      {project.status.toUpperCase()}
                    </span>

                    <div className="actions">
                      <button
                        className="icon-btn"
                        title="Edit project"
                        onClick={() => openEditProject(project)}
                      >
                        ✎
                      </button>

                      <button
                        className="icon-btn danger"
                        title="Delete project"
                        onClick={() => deleteProject(project.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <h3 className="card-title">{project.title}</h3>

                  {project.description && (
                    <p className="card-desc">{project.description}</p>
                  )}

                  <div className="meta">
                    <span className="date">
                      PROGRESS: {project.progress}%
                    </span>

                    {project.dueDate && (
                      <span className="due">
                        DUE: {project.dueDate}
                      </span>
                    )}
                  </div>

                  <div style={{
                    height: '5px',
                    background: 'var(--border)',
                    borderRadius: '5px',
                    marginTop: '9px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${project.progress}%`,
                      background: 'var(--green)',
                      transition: 'width 0.2s',
                    }} />
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* PROJECT MODAL */}
      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={e => {
            if (e.target === e.currentTarget) {
              setShowModal(false)
              resetForm()
            }
          }}
        >
          <div className="modal">
            <div className="modal-head">
              <h3>{editingId ? 'EDIT PROJECT' : 'NEW PROJECT'}</h3>

              <button
                className="icon-btn"
                onClick={() => {
                  setShowModal(false)
                  resetForm()
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>
                PROJECT TITLE *
                <input
                  type="text"
                  placeholder="Enter project name..."
                  value={form.title}
                  onChange={e =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                  autoFocus
                />
              </label>

              <label>
                DESCRIPTION
                <textarea
                  rows="4"
                  placeholder="Describe your project..."
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>

              <label>
                STATUS
                <select
                  value={form.status}
                  onChange={e => {
                    const status = e.target.value
                    setForm({
                      ...form,
                      status,
                      progress: status === 'Completed'
                        ? 100
                        : form.progress,
                    })
                  }}
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                PROGRESS — {form.progress}%
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={e =>
                    setForm({
                      ...form,
                      progress: Number(e.target.value),
                      status: Number(e.target.value) === 100
                        ? 'Completed'
                        : form.status === 'Completed'
                        ? 'In Progress'
                        : form.status,
                    })
                  }
                />
              </label>

              <label>
                TARGET DATE
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                >
                  CANCEL
                </button>

                <button type="submit" className="btn primary">
                  {editingId ? 'SAVE CHANGES' : 'CREATE PROJECT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}