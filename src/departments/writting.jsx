import React, { useEffect, useState } from 'react'

const INITIAL_WRITINGS = []

const CATEGORIES = [
  'Story',
  'Article',
  'Journal',
  'Poetry',
  'Idea',
  'Other',
]

const STATUSES = [
  'Draft',
  'In Progress',
  'Published',
  'Archived',
]

export default function Writing() {
  const [writings, setWritings] = useState(() => {
    try {
      const savedWritings = localStorage.getItem('lunar_writings')
      return savedWritings
        ? JSON.parse(savedWritings)
        : INITIAL_WRITINGS
    } catch (error) {
      console.error('Could not load saved writings:', error)
      return INITIAL_WRITINGS
    }
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Save writings whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem('lunar_writings', JSON.stringify(writings))
    } catch (error) {
      console.error('Could not save writings:', error)
    }
  }, [writings])

  const [form, setForm] = useState({
    title: '',
    category: 'Story',
    description: '',
    content: '',
    status: 'Draft',
  })

  const resetForm = () => {
    setForm({
      title: '',
      category: 'Story',
      description: '',
      content: '',
      status: 'Draft',
    })

    setEditingId(null)
  }

  const openNewWriting = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditWriting = (writing) => {
    setForm({
      title: writing.title,
      category: writing.category,
      description: writing.description,
      content: writing.content,
      status: writing.status,
    })

    setEditingId(writing.id)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.title.trim()) return

    const writingData = {
      ...form,
      id: editingId || Date.now(),
      updatedAt: new Date().toISOString(),
    }

    if (editingId) {
      setWritings(prev =>
        prev.map(writing =>
          writing.id === editingId ? writingData : writing
        )
      )
    } else {
      setWritings(prev => [writingData, ...prev])
    }

    setShowModal(false)
    resetForm()
  }

  const deleteWriting = (id) => {
    if (window.confirm('Delete this writing entry?')) {
      setWritings(prev =>
        prev.filter(writing => writing.id !== id)
      )
    }
  }

  const filteredWritings = writings.filter(writing => {
    const matchesSearch =
      writing.title.toLowerCase().includes(search.toLowerCase()) ||
      writing.description.toLowerCase().includes(search.toLowerCase()) ||
      writing.content.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' || writing.status === filter

    return matchesSearch && matchesFilter
  })

  const total = writings.length
  const drafts = writings.filter(w => w.status === 'Draft').length
  const inProgress = writings.filter(w => w.status === 'In Progress').length
  const published = writings.filter(w => w.status === 'Published').length

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="prompt">root@lunar</span>
          <span className="cmd">~ writing</span>
        </div>

        <div className="header-right">
          <span className="live">● SYSTEM ACTIVE</span>

          <button
            className="btn primary"
            onClick={openNewWriting}
          >
            + NEW ENTRY
          </button>
        </div>
      </header>

      {/* STATS */}
      <section className="stats">
        <div className="stat">
          <span className="label">TOTAL ENTRIES</span>
          <span className="value">{total}</span>
        </div>

        <div className="stat">
          <span className="label">DRAFTS</span>
          <span className="value">{drafts}</span>
        </div>

        <div className="stat">
          <span className="label">IN PROGRESS</span>
          <span className="value warn">{inProgress}</span>
        </div>

        <div className="stat">
          <span className="label">PUBLISHED</span>
          <span className="value ok">{published}</span>
        </div>
      </section>

      {/* FILTERS */}
      <section className="filters">
        <input
          className="search"
          type="text"
          placeholder="Search writings..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Entries</option>

          {STATUSES.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </section>

      {/* WRITING BOARD */}
      <section className="board">
        <div className="col">

          <div className="col-head">
            <span>WRITING DATABASE</span>
            <span className="count">{filteredWritings.length}</span>
          </div>

          <div className="col-body">
            {filteredWritings.length === 0 ? (
              <div className="empty">
                {search || filter !== 'All'
                  ? 'No matching entries found.'
                  : 'No writing entries yet. Create your first entry.'}
              </div>
            ) : (
              filteredWritings.map(writing => (
                <article
                  className={`card ${writing.status === 'Published' ? 'done' : ''}`}
                  key={writing.id}
                >

                  <div className="card-top">
                    <span className="badge prio-medium">
                      {writing.category.toUpperCase()}
                    </span>

                    <div className="actions">
                      <span className={`status ${
                        writing.status === 'Published'
                          ? 'ok'
                          : writing.status === 'In Progress'
                          ? 'warn'
                          : ''
                      }`}>
                        {writing.status.toUpperCase()}
                      </span>

                      <button
                        className="icon-btn"
                        title="Edit entry"
                        onClick={() => openEditWriting(writing)}
                      >
                        ✎
                      </button>

                      <button
                        className="icon-btn danger"
                        title="Delete entry"
                        onClick={() => deleteWriting(writing.id)}
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <h3 className="card-title">
                    {writing.title}
                  </h3>

                  {writing.description && (
                    <p className="card-desc">
                      {writing.description}
                    </p>
                  )}

                  {writing.content && (
                    <p className="card-desc">
                      {writing.content.length > 180
                        ? `${writing.content.slice(0, 180)}...`
                        : writing.content}
                    </p>
                  )}

                  <div className="meta">
                    <span className="date">
                      {writing.updatedAt
                        ? `UPDATED: ${new Date(writing.updatedAt).toLocaleDateString()}`
                        : 'NEW ENTRY'}
                    </span>
                  </div>

                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* WRITING MODAL */}
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
              <h3>
                {editingId ? 'EDIT ENTRY' : 'NEW WRITING ENTRY'}
              </h3>

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
                TITLE *
                <input
                  type="text"
                  placeholder="Enter title..."
                  value={form.title}
                  onChange={e =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  required
                  autoFocus
                />
              </label>

              <label>
                CATEGORY
                <select
                  value={form.category}
                  onChange={e =>
                    setForm({
                      ...form,
                      category: e.target.value,
                    })
                  }
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                DESCRIPTION
                <textarea
                  rows="2"
                  placeholder="Write a short description..."
                  value={form.description}
                  onChange={e =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                CONTENT
                <textarea
                  rows="8"
                  placeholder="Start writing..."
                  value={form.content}
                  onChange={e =>
                    setForm({
                      ...form,
                      content: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                STATUS
                <select
                  value={form.status}
                  onChange={e =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
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

                <button
                  type="submit"
                  className="btn primary"
                >
                  {editingId ? 'SAVE CHANGES' : 'CREATE ENTRY'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}