import React, { useEffect, useState } from 'react'

const INITIAL_NOTES = []

const CATEGORIES = [
  'Personal',
  'Work',
  'Ideas',
  'Learning',
  'Projects',
  'Other',
]

export default function Notes() {
  const [notes, setNotes] = useState(() => {
    try {
      const savedNotes = localStorage.getItem('lunar_notes')
      return savedNotes ? JSON.parse(savedNotes) : INITIAL_NOTES
    } catch (error) {
      console.error('Could not load saved notes:', error)
      return INITIAL_NOTES
    }
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Save notes whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem('lunar_notes', JSON.stringify(notes))
    } catch (error) {
      console.error('Could not save notes:', error)
    }
  }, [notes])

  const [form, setForm] = useState({
    title: '',
    category: 'Personal',
    content: '',
    pinned: false,
  })

  const resetForm = () => {
    setForm({
      title: '',
      category: 'Personal',
      content: '',
      pinned: false,
    })

    setEditingId(null)
  }

  const openNewNote = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditNote = (note) => {
    setForm({
      title: note.title,
      category: note.category,
      content: note.content,
      pinned: note.pinned,
    })

    setEditingId(note.id)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.title.trim()) return

    const noteData = {
      ...form,
      id: editingId || Date.now(),
      updatedAt: new Date().toISOString(),
    }

    if (editingId) {
      setNotes(prev =>
        prev.map(note =>
          note.id === editingId ? noteData : note
        )
      )
    } else {
      setNotes(prev => [noteData, ...prev])
    }

    setShowModal(false)
    resetForm()
  }

  const deleteNote = (id) => {
    if (window.confirm('Delete this note?')) {
      setNotes(prev => prev.filter(note => note.id !== id))
    }
  }

  const togglePin = (id) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    )
  }

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase())

      const matchesCategory =
        filter === 'All' || note.category === filter

      const matchesPinned =
        !showPinnedOnly || note.pinned

      return matchesSearch && matchesCategory && matchesPinned
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))

  const total = notes.length
  const pinned = notes.filter(note => note.pinned).length
  const categoriesUsed = new Set(notes.map(note => note.category)).size

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="prompt">root@lunar</span>
          <span className="cmd">~ notes</span>
        </div>

        <div className="header-right">
          <span className="live">● SYSTEM ACTIVE</span>

          <button
            className="btn primary"
            onClick={openNewNote}
          >
            + NEW NOTE
          </button>
        </div>
      </header>

      {/* STATS */}
      <section className="stats">
        <div className="stat">
          <span className="label">TOTAL NOTES</span>
          <span className="value">{total}</span>
        </div>

        <div className="stat">
          <span className="label">PINNED NOTES</span>
          <span className="value warn">{pinned}</span>
        </div>

        <div className="stat">
          <span className="label">CATEGORIES USED</span>
          <span className="value ok">{categoriesUsed}</span>
        </div>

        <div className="stat">
          <span className="label">UNPINNED NOTES</span>
          <span className="value">{total - pinned}</span>
        </div>
      </section>

      {/* FILTERS */}
      <section className="filters">
        <input
          className="search"
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Categories</option>

          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <button
          type="button"
          className={`btn ${showPinnedOnly ? 'primary' : 'ghost'}`}
          onClick={() => setShowPinnedOnly(prev => !prev)}
        >
          {showPinnedOnly ? 'SHOW ALL' : 'PINNED ONLY'}
        </button>
      </section>

      {/* NOTES BOARD */}
      <section className="board">
        <div className="col">

          <div className="col-head">
            <span>NOTES DATABASE</span>
            <span className="count">{filteredNotes.length}</span>
          </div>

          <div className="col-body">
            {filteredNotes.length === 0 ? (
              <div className="empty">
                {search || filter !== 'All' || showPinnedOnly
                  ? 'No matching notes found.'
                  : 'No notes yet. Create your first note.'}
              </div>
            ) : (
              filteredNotes.map(note => (
                <article
                  className="card"
                  key={note.id}
                >

                  <div className="card-top">
                    <span className="badge prio-medium">
                      {note.category.toUpperCase()}
                    </span>

                    <div className="actions">

                      {note.pinned && (
                        <span className="status warn">
                          PINNED
                        </span>
                      )}

                      <button
                        className="icon-btn"
                        title={note.pinned ? 'Unpin note' : 'Pin note'}
                        onClick={() => togglePin(note.id)}
                      >
                        {note.pinned ? '★' : '☆'}
                      </button>

                      <button
                        className="icon-btn"
                        title="Edit note"
                        onClick={() => openEditNote(note)}
                      >
                        ✎
                      </button>

                      <button
                        className="icon-btn danger"
                        title="Delete note"
                        onClick={() => deleteNote(note.id)}
                      >
                        ×
                      </button>

                    </div>
                  </div>

                  <h3 className="card-title">
                    {note.title}
                  </h3>

                  {note.content && (
                    <p className="card-desc">
                      {note.content.length > 200
                        ? `${note.content.slice(0, 200)}...`
                        : note.content}
                    </p>
                  )}

                  <div className="meta">
                    <span className="date">
                      {note.updatedAt
                        ? `UPDATED: ${new Date(note.updatedAt).toLocaleDateString()}`
                        : 'NEW NOTE'}
                    </span>
                  </div>

                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* NOTE MODAL */}
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
                {editingId ? 'EDIT NOTE' : 'NEW NOTE'}
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
                NOTE TITLE *
                <input
                  type="text"
                  placeholder="Enter note title..."
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
                CONTENT
                <textarea
                  rows="8"
                  placeholder="Write your note here..."
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
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e =>
                    setForm({
                      ...form,
                      pinned: e.target.checked,
                    })
                  }
                />
                PIN THIS NOTE
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
                  {editingId ? 'SAVE CHANGES' : 'CREATE NOTE'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}