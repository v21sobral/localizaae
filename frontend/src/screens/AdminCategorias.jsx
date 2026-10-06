import { useState } from 'react'
import AdminShell from '../components/AdminShell'
import { Plus, Pencil, Trash2, Check, X } from '../components/Icons'
export default function AdminCategorias({
  categories,
  items,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onNavigate,
  onLogout,
}) {
  const [editing, setEditing] = useState(null)
  const [newValue, setNewValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editError, setEditError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const itemsUsing = (catName) => items.filter((i) => i.category === catName).length
  const handleAdd = () => {
    const v = newValue.trim()
    if (!v) {
      setAddError('Nome obrigatório')
      return
    }
    if (categories.map((c) => c.toLowerCase()).includes(v.toLowerCase())) {
      setAddError('Categoria já existe')
      return
    }
    onAddCategory(v)
    setNewValue('')
    setAdding(false)
    setAddError('')
  }
  const handleSave = () => {
    if (!editing) return
    const v = editing.value.trim()
    if (!v) {
      setEditError('Nome obrigatório')
      return
    }
    const oldName = categories[editing.index]
    if (categories.some((c, i) => i !== editing.index && c.toLowerCase() === v.toLowerCase())) {
      setEditError('Já existe uma categoria com esse nome')
      return
    }
    onRenameCategory(oldName, v)
    setEditing(null)
    setEditError('')
  }
  const handleDelete = (catName) => {
    const count = itemsUsing(catName)
    if (count > 0) {
      setDeleteError(
        `Categoria em uso por ${count} ${count === 1 ? 'item' : 'itens'}. Reatribua os itens antes de excluir.`,
      )
      setDeleteConfirm(null)
      return
    }
    onDeleteCategory(catName)
    setDeleteConfirm(null)
    setDeleteError('')
  }
  const inputBase = {
    padding: '7px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    flex: 1,
  }
  return (
    <AdminShell active="admin-categorias" onNavigate={onNavigate} onLogout={onLogout}>
      <div style={{ maxWidth: 560 }}>
        <div
          style={{
            marginBottom: 22,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontWeight: 600,
                fontSize: 18,
                color: 'var(--color-text)',
                letterSpacing: '-0.02em',
                marginBottom: 2,
              }}
            >
              Categorias
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              {categories.length} categorias cadastradas
            </p>
          </div>
          <button
            onClick={() => {
              setAdding(true)
              setAddError('')
              setNewValue('')
              setDeleteError('')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: 6,
              padding: '7px 14px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
          >
            <Plus size={14} strokeWidth={2} />
            Nova categoria
          </button>
        </div>

        {/* Delete error */}
        {deleteError && (
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              borderRadius: 6,
              marginBottom: 10,
              fontSize: 13,
              color: 'var(--color-danger-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <span>{deleteError}</span>
            <button
              onClick={() => setDeleteError('')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-danger-text)',
                padding: 0,
                lineHeight: 1,
              }}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Add form */}
        {adding && (
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-primary)',
              borderRadius: 7,
              padding: '14px 16px',
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
              Nova categoria
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="cat-new-input"
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value)
                  setAddError('')
                }}
                placeholder="Nome da categoria"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                style={{
                  ...inputBase,
                  borderColor: addError ? 'var(--color-invalid)' : 'var(--color-border)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) =>
                  (e.target.style.borderColor = addError ? 'var(--color-invalid)' : 'var(--color-border)')
                }
                autoFocus
              />
              <button
                onClick={handleAdd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '7px 14px',
                  background: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <Check size={13} strokeWidth={2.5} /> Salvar
              </button>
              <button
                onClick={() => {
                  setAdding(false)
                  setNewValue('')
                  setAddError('')
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '7px 10px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  flexShrink: 0,
                }}
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            {addError && (
              <div style={{ fontSize: 11, color: 'var(--color-danger-text)', marginTop: 5 }}>{addError}</div>
            )}
          </div>
        )}

        {/* List */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 7,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 14px',
              background: 'var(--color-bg)',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Nome
            </span>
          </div>

          {categories.map((cat, index) => (
            <div
              key={`${cat}-${index}`}
              style={{
                padding: '10px 14px',
                borderBottom: index < categories.length - 1 ? '1px solid var(--color-border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.1s',
                minHeight: 44,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {editing?.index === index ? (
                <>
                  <div style={{ flex: 1 }}>
                    <input
                      value={editing.value}
                      onChange={(e) => {
                        setEditing((p) => (p ? { ...p, value: e.target.value } : null))
                        setEditError('')
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      style={{
                        ...inputBase,
                        padding: '5px 8px',
                        width: '100%',
                        borderColor: editError ? 'var(--color-invalid)' : 'var(--color-border)',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                      onBlur={(e) =>
                        (e.target.style.borderColor = editError
                          ? 'var(--color-invalid)'
                          : 'var(--color-border)')
                      }
                      autoFocus
                    />
                    {editError && (
                      <div style={{ fontSize: 11, color: 'var(--color-danger-text)', marginTop: 3 }}>
                        {editError}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSave}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '5px 10px',
                      background: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 5,
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={12} strokeWidth={2.5} /> Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditing(null)
                      setEditError('')
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '5px 8px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 5,
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{cat}</span>
                    {itemsUsing(cat) > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--color-text-subtle)' }}>
                        {itemsUsing(cat)} {itemsUsing(cat) === 1 ? 'item' : 'itens'}
                      </span>
                    )}
                  </div>

                  {deleteConfirm === cat ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        Confirmar exclusão?
                      </span>
                      <button
                        onClick={() => handleDelete(cat)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          background: 'var(--color-danger-bg)',
                          color: 'var(--color-danger-text)',
                          border: '1px solid var(--color-danger-border)',
                          borderRadius: 5,
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        <Check size={12} strokeWidth={2.5} /> Sim
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 5,
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        <X size={13} strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => {
                          setEditing({ index, value: cat })
                          setEditError('')
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 10px',
                          background: 'transparent',
                          border: '1px solid var(--color-border)',
                          borderRadius: 5,
                          fontSize: 12,
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          fontWeight: 500,
                          transition: 'all 0.1s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-bg)'
                          e.currentTarget.style.color = 'var(--color-text)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--color-text-muted)'
                        }}
                      >
                        <Pencil size={12} strokeWidth={2} /> Editar
                      </button>
                      <button
                        onClick={() => {
                          setDeleteConfirm(cat)
                          setDeleteError('')
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          background: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: 5,
                          cursor: 'pointer',
                          color: 'var(--color-text-subtle)',
                          transition: 'all 0.1s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-danger-text)'
                          e.currentTarget.style.borderColor = 'var(--color-danger-border)'
                          e.currentTarget.style.background = 'var(--color-danger-bg)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--color-text-subtle)'
                          e.currentTarget.style.borderColor = 'transparent'
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <Trash2 size={13} strokeWidth={1.75} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div
              style={{
                padding: '28px 16px',
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--color-text-muted)',
              }}
            >
              Nenhuma categoria cadastrada.
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
