import React, { useEffect, useState } from 'react'

const INITIAL_TRANSACTIONS = []

const CATEGORIES = [
  'Sales',
  'Services',
  'Investment',
  'Salary',
  'Marketing',
  'Equipment',
  'Operations',
  'Other',
]

const TYPES = ['Income', 'Expense']

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function Business() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const savedTransactions = localStorage.getItem('lunar_business')
      return savedTransactions
        ? JSON.parse(savedTransactions)
        : INITIAL_TRANSACTIONS
    } catch (error) {
      console.error('Could not load saved transactions:', error)
      return INITIAL_TRANSACTIONS
    }
  })

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Save transactions whenever the list changes.
  useEffect(() => {
    try {
      localStorage.setItem(
        'lunar_business',
        JSON.stringify(transactions)
      )
    } catch (error) {
      console.error('Could not save transactions:', error)
    }
  }, [transactions])

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Income',
    category: 'Sales',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      type: 'Income',
      category: 'Sales',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    })

    setEditingId(null)
  }

  const openNewTransaction = () => {
    resetForm()
    setShowModal(true)
  }

  const openEditTransaction = (transaction) => {
    setForm({
      title: transaction.title,
      description: transaction.description,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
    })

    setEditingId(transaction.id)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.title.trim() || !form.amount || Number(form.amount) <= 0) {
      return
    }

    const transactionData = {
      ...form,
      amount: Number(form.amount),
      id: editingId || Date.now(),
    }

    if (editingId) {
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === editingId
            ? transactionData
            : transaction
        )
      )
    } else {
      setTransactions(prev => [
        transactionData,
        ...prev,
      ])
    }

    setShowModal(false)
    resetForm()
  }

  const deleteTransaction = (id) => {
    if (window.confirm('Delete this transaction?')) {
      setTransactions(prev =>
        prev.filter(transaction => transaction.id !== id)
      )
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(search.toLowerCase()) ||
      transaction.description.toLowerCase().includes(search.toLowerCase()) ||
      transaction.category.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'All' || transaction.type === filter

    return matchesSearch && matchesFilter
  })

  const totalIncome = transactions
    .filter(transaction => transaction.type === 'Income')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const totalExpenses = transactions
    .filter(transaction => transaction.type === 'Expense')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const balance = totalIncome - totalExpenses
  const totalTransactions = transactions.length

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="prompt">root@lunar</span>
          <span className="cmd">~ business</span>
        </div>

        <div className="header-right">
          <span className="live">● SYSTEM ACTIVE</span>

          <button
            className="btn primary"
            onClick={openNewTransaction}
          >
            + NEW TRANSACTION
          </button>
        </div>
      </header>

      {/* STATS */}
      <section className="stats">

        <div className="stat">
          <span className="label">TOTAL INCOME</span>
          <span className="value ok">
            {formatCurrency(totalIncome)}
          </span>
        </div>

        <div className="stat">
          <span className="label">TOTAL EXPENSES</span>
          <span className="value warn">
            {formatCurrency(totalExpenses)}
          </span>
        </div>

        <div className="stat">
          <span className="label">NET BALANCE</span>
          <span className={`value ${balance >= 0 ? 'ok' : 'warn'}`}>
            {formatCurrency(balance)}
          </span>
        </div>

        <div className="stat">
          <span className="label">TRANSACTIONS</span>
          <span className="value">
            {totalTransactions}
          </span>
        </div>

      </section>

      {/* FILTERS */}
      <section className="filters">

        <input
          className="search"
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="All">All Transactions</option>

          {TYPES.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

      </section>

      {/* TRANSACTION BOARD */}
      <section className="board">
        <div className="col">

          <div className="col-head">
            <span>FINANCIAL DATABASE</span>
            <span className="count">
              {filteredTransactions.length}
            </span>
          </div>

          <div className="col-body">

            {filteredTransactions.length === 0 ? (
              <div className="empty">
                {search || filter !== 'All'
                  ? 'No matching transactions found.'
                  : 'No transactions yet. Add your first transaction.'}
              </div>
            ) : (
              filteredTransactions.map(transaction => (
                <article
                  className={`card ${
                    transaction.type === 'Income' ? 'done' : ''
                  }`}
                  key={transaction.id}
                >

                  <div className="card-top">

                    <span className={`badge ${
                      transaction.type === 'Income'
                        ? 'prio-low'
                        : 'prio-high'
                    }`}>
                      {transaction.type.toUpperCase()}
                    </span>

                    <div className="actions">

                      <button
                        className="icon-btn"
                        title="Edit transaction"
                        onClick={() => openEditTransaction(transaction)}
                      >
                        ✎
                      </button>

                      <button
                        className="icon-btn danger"
                        title="Delete transaction"
                        onClick={() => deleteTransaction(transaction.id)}
                      >
                        ×
                      </button>

                    </div>
                  </div>

                  <h3 className="card-title">
                    {transaction.title}
                  </h3>

                  {transaction.description && (
                    <p className="card-desc">
                      {transaction.description}
                    </p>
                  )}

                  <div className="meta">

                    <span className="date">
                      {transaction.category.toUpperCase()}
                    </span>

                    <span className="due">
                      {transaction.date}
                    </span>

                  </div>

                  <div className="card-foot">
                    <strong className={
                      transaction.type === 'Income' ? 'ok' : 'warn'
                    }>
                      {transaction.type === 'Income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </strong>
                  </div>

                </article>
              ))
            )}

          </div>
        </div>
      </section>

      {/* TRANSACTION MODAL */}
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
                {editingId
                  ? 'EDIT TRANSACTION'
                  : 'NEW TRANSACTION'}
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
                TRANSACTION TITLE *
                <input
                  type="text"
                  placeholder="Enter transaction title..."
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
                DESCRIPTION
                <textarea
                  rows="3"
                  placeholder="Add transaction details..."
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
                TRANSACTION TYPE
                <select
                  value={form.type}
                  onChange={e => {
                    const type = e.target.value

                    setForm({
                      ...form,
                      type,
                      category: type === 'Income' ? 'Sales' : 'Marketing',
                    })
                  }}
                >
                  {TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
                AMOUNT (₹) *
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount..."
                  value={form.amount}
                  onChange={e =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                TRANSACTION DATE
                <input
                  type="date"
                  value={form.date}
                  onChange={e =>
                    setForm({
                      ...form,
                      date: e.target.value,
                    })
                  }
                  required
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

                <button
                  type="submit"
                  className="btn primary"
                >
                  {editingId
                    ? 'SAVE CHANGES'
                    : 'CREATE TRANSACTION'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}