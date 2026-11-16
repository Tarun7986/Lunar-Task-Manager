
import React, { useState } from 'react'

import Tasks from './departments/tasks.jsx'
import Goals from './departments/goals.jsx'
import Projects from './departments/projects.jsx'
import Writing from './departments/writting.jsx'
import Notes from './departments/notes.jsx'
import Business from './departments/business.jsx'


const DEPARTMENTS = [
  { id: 'tasks', name: 'Tasks', icon: '▣' },
  { id: 'goals', name: 'Goals', icon: '◎' },
  { id: 'projects', name: 'Projects', icon: '⌘' },
  { id: 'writing', name: 'Writing', icon: '✎' },
  { id: 'notes', name: 'Notes', icon: '▤' },
  { id: 'business', name: 'Business', icon: '₿' },
]

export default function App() {
  const [active, setActive] = useState('tasks')

  return (
    <div className="archive">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="moon">☽</span>
          <div>
            <div className="title">LUNAR</div>
            <div className="subtitle">ARCHIVE</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-label">DEPARTMENTS</div>
          {DEPARTMENTS.map(dep => (
            <button
              key={dep.id}
              className={`nav-item ${active === dep.id ? 'active' : ''}`}
              onClick={() => setActive(dep.id)}
            >
              <span className="nav-icon">{dep.icon}</span>
              <span>{dep.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-line">
            <span className="dot"></span>
            SYSTEM ONLINE
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="prompt">root@lunar</span>
            <span className="sep">/</span>
            <span className="current">{active}</span>
          </div>
        </header>

        <div className="content">
          {active === 'tasks' && <Tasks />}
          {active === 'goals' && <Goals />}
          {active === 'projects' && <Projects />}
          {active === 'writing' && <Writing />}
          {active === 'notes' && <Notes />}
          {active === 'business' && <Business />}
        </div>
      </div>
    </div>
  )
}