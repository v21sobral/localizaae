import { useState, useEffect, useCallback, useRef } from 'react'
import LoginScreen from './screens/LoginScreen'
import MuralScreen from './screens/MuralScreen'
import ItemDetailScreen from './screens/ItemDetailScreen'
import ItemClaimScreen from './screens/ItemClaimScreen'
import AdminDashboard from './screens/AdminDashboard'
import AdminItemForm from './screens/AdminItemForm'
import AdminRetirada from './screens/AdminRetirada'
import AdminRelatorios from './screens/AdminRelatorios'
import AdminCategorias from './screens/AdminCategorias'
import AdminAuditoria from './screens/AdminAuditoria'
import { api, getToken, setToken, errorMessage } from './services/api'
import { todayLocalISO } from './utils/date'

/**
 * Telas: 'mural' | 'item-detail' | 'item-claim' | 'login' | 'admin-dashboard' |
 * 'admin-item-form' | 'admin-retirada' | 'admin-relatorios' | 'admin-categorias' | 'admin-auditoria'
 *
 * Item: { id, name, description, category, locationPublic, locationDetail?, date,
 *         status: 'disponivel' | 'pendente' | 'retirado', imageUrl? }
 * (locationDetail só vem da API administrativa.)
 */

// ── Hash routing helpers ───────────────────────────────────
const ADMIN_SCREENS = [
  'admin-dashboard',
  'admin-item-form',
  'admin-retirada',
  'admin-relatorios',
  'admin-categorias',
  'admin-auditoria',
]
function screenToHash(screen, selectedItemId) {
  if (screen === 'item-detail' && selectedItemId) return `#/item/${selectedItemId}`
  if (screen === 'item-claim' && selectedItemId) return `#/item-claim/${selectedItemId}`
  const map = {
    mural: '#/mural',
    login: '#/login',
    'admin-dashboard': '#/admin',
    'admin-item-form': '#/admin/item-form',
    'admin-retirada': '#/admin/retirada',
    'admin-relatorios': '#/admin/relatorios',
    'admin-categorias': '#/admin/categorias',
    'admin-auditoria': '#/admin/auditoria',
  }
  return map[screen] ?? '#/mural'
}
function hashToScreen(hash, isAdmin) {
  if (hash.startsWith('#/item-claim/')) {
    return { screen: 'item-claim', itemId: hash.split('/')[2] }
  }
  if (hash.startsWith('#/item/')) {
    return { screen: 'item-detail', itemId: hash.split('/')[2] }
  }
  if (hash.startsWith('#/admin') && isAdmin) {
    const map = {
      '#/admin': 'admin-dashboard',
      '#/admin/item-form': 'admin-item-form',
      '#/admin/retirada': 'admin-retirada',
      '#/admin/relatorios': 'admin-relatorios',
      '#/admin/categorias': 'admin-categorias',
      '#/admin/auditoria': 'admin-auditoria',
    }
    return { screen: map[hash] ?? 'admin-dashboard' }
  }
  if (hash === '#/login') return { screen: 'login' }
  return { screen: 'mural' }
}
export default function App() {
  const [screen, setScreen] = useState('mural')
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [editingItemId, setEditingItemId] = useState(null)
  const [items, setItems] = useState([])
  const [categoryList, setCategoryList] = useState([]) // [{ id, name }]
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [toast, setToast] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState('')
  const [adminSection, setAdminSection] = useState('dashboard')
  const [_skipHashWrite, setSkipHashWrite] = useState(false)
  const savingRef = useRef(false)
  const categories = categoryList.map((c) => c.name)
  const showError = useCallback((err) => setToast(errorMessage(err)), [])

  // ── Dados vindos da API ──────────────────────────────────
  // Com sessão ativa carrega a visão administrativa (inclui o local detalhado).
  const loadData = useCallback(async () => {
    try {
      const [its, cats] = await Promise.all([
        getToken() ? api.getAdminItems() : api.getItems(),
        api.getCategories(),
      ])
      setItems(its)
      setCategoryList(cats)
      setLoadError('')
    } catch (err) {
      if (err.status !== 401) setLoadError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // Restaura a sessão (token em sessionStorage) e carrega os dados.
  useEffect(() => {
    loadData()
    if (!getToken()) return
    api
      .me()
      .then(({ user }) => {
        setIsAdmin(true)
        setLoggedInUser(user.email)
        const { screen: s } = hashToScreen(window.location.hash, true)
        if (ADMIN_SCREENS.includes(s)) setScreen(s)
      })
      .catch(() => setToken(null))
  }, [loadData])

  // Token expirado/inválido: volta ao login.
  useEffect(() => {
    const onExpired = () => {
      setIsAdmin(false)
      setLoggedInUser('')
      setScreen('login')
      setToast('Sua sessão expirou. Entre novamente.')
      loadData()
    }
    window.addEventListener('localiza:session-expired', onExpired)
    return () => window.removeEventListener('localiza:session-expired', onExpired)
  }, [loadData])

  // Some o aviso de erro sozinho
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 7000)
    return () => clearTimeout(t)
  }, [toast])

  // Sync screen → hash
  useEffect(() => {
    const newHash = screenToHash(screen, selectedItemId)
    if (window.location.hash !== newHash) {
      window.location.hash = newHash
    }
  }, [screen, selectedItemId])
  // Handle browser back/forward
  useEffect(() => {
    const handler = () => {
      const { screen: s, itemId } = hashToScreen(window.location.hash, isAdmin)
      setSkipHashWrite(true)
      setScreen(s)
      if (itemId) setSelectedItemId(itemId)
    }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [isAdmin])
  // On mount, restore screen from hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash !== '#/mural' && hash !== '') {
      const { screen: s, itemId } = hashToScreen(hash, false)
      // Admin routes without auth go to mural
      if (!ADMIN_SCREENS.includes(s)) {
        setScreen(s)
        if (itemId) setSelectedItemId(itemId)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const navigate = useCallback((s, opts) => {
    setScreen(s)
    if (opts?.itemId !== undefined) setSelectedItemId(opts.itemId)
    if (opts?.editId !== undefined) setEditingItemId(opts.editId)
  }, [])
  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null

  // ── Item handlers ────────────────────────────────────────
  const handleSaveItem = async (item) => {
    if (savingRef.current) return false
    savingRef.current = true
    try {
      const { id: _id, ...payload } = item
      const saved = editingItemId
        ? await api.updateItem(editingItemId, payload)
        : await api.createItem(payload)
      setItems((prev) =>
        editingItemId ? prev.map((i) => (i.id === editingItemId ? saved : i)) : [saved, ...prev],
      )
      setScreen('admin-dashboard')
      setEditingItemId(null)
      return true
    } catch (err) {
      showError(err)
      return false
    } finally {
      savingRef.current = false
    }
  }
  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      showError(err)
    }
  }

  // ── Category handlers ────────────────────────────────────
  const handleAddCategory = async (name) => {
    try {
      const created = await api.createCategory(name)
      setCategoryList((prev) => [...prev, created])
    } catch (err) {
      showError(err)
    }
  }
  const handleRenameCategory = async (oldName, newName) => {
    const cat = categoryList.find((c) => c.name === oldName)
    if (!cat) return
    try {
      const updated = await api.renameCategory(cat.id, newName)
      setCategoryList((prev) => prev.map((c) => (c.id === cat.id ? updated : c)))
      setItems((prev) => prev.map((i) => (i.category === oldName ? { ...i, category: updated.name } : i)))
    } catch (err) {
      showError(err)
    }
  }
  const handleDeleteCategory = async (name) => {
    const cat = categoryList.find((c) => c.name === name)
    if (!cat) return
    try {
      await api.deleteCategory(cat.id)
      setCategoryList((prev) => prev.filter((c) => c.id !== cat.id))
    } catch (err) {
      showError(err)
    }
  }

  const doLogout = () => {
    setToken(null)
    setIsAdmin(false)
    setLoggedInUser('')
    setScreen('mural')
    loadData() // recarrega a visão pública (sem local detalhado)
  }
  const todayStr = todayLocalISO()

  if (loading) {
    return (
      <div
        className="min-h-screen"
        style={{
          background: 'var(--color-bg)',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
        }}
        role="status"
      >
        Carregando…
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {loadError && items.length === 0 && (
        <div
          role="alert"
          style={{
            maxWidth: 520,
            margin: '48px auto 0',
            padding: '14px 16px',
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 10,
            color: 'var(--color-danger-text)',
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          {loadError}{' '}
          <button
            onClick={() => {
              setLoading(true)
              loadData()
            }}
            style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {toast && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            maxWidth: 360,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            padding: '12px 14px',
            background: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-border)',
            borderRadius: 10,
            color: 'var(--color-danger-text)',
            fontSize: 13,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          <span style={{ flex: 1 }}>{toast}</span>
          <button
            onClick={() => setToast('')}
            aria-label="Fechar aviso"
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {screen === 'login' && (
        <LoginScreen
          onLogin={(user) => {
            setIsAdmin(true)
            setLoggedInUser(user.email)
            setScreen('admin-dashboard')
            loadData()
          }}
          onBack={() => setScreen('mural')}
        />
      )}

      {screen === 'mural' && (
        <MuralScreen
          items={items}
          categories={categories}
          onItemClick={(id) => navigate('item-detail', { itemId: id })}
          onAdminClick={() => setScreen('login')}
        />
      )}

      {screen === 'item-detail' && selectedItem && (
        <ItemDetailScreen
          item={selectedItem}
          onBack={() => setScreen('mural')}
          onClaim={() => navigate('item-claim', { itemId: selectedItem.id })}
          today={todayStr}
        />
      )}

      {screen === 'item-claim' && selectedItem && selectedItem.status === 'disponivel' && (
        <ItemClaimScreen
          item={selectedItem}
          onComplete={() => {
            setItems((prev) => prev.map((i) => (i.id === selectedItem.id ? { ...i, status: 'pendente' } : i)))
            setScreen('mural')
            loadData()
          }}
          onCancel={() => navigate('item-detail', { itemId: selectedItem.id })}
          today={todayStr}
        />
      )}

      {(screen === 'admin-dashboard' ||
        screen === 'admin-item-form' ||
        screen === 'admin-retirada' ||
        screen === 'admin-relatorios' ||
        screen === 'admin-categorias' ||
        screen === 'admin-auditoria') &&
        isAdmin && (
          <>
            {screen === 'admin-dashboard' && (
              <AdminDashboard
                items={items}
                onNavigate={(s, opts) => navigate(s, opts)}
                onLogout={doLogout}
                onDelete={handleDeleteItem}
                activeSection={adminSection}
                setActiveSection={(s) => setAdminSection(s)}
              />
            )}
            {screen === 'admin-item-form' && (
              <AdminItemForm
                items={items}
                editingItemId={editingItemId}
                categories={categories}
                onSave={handleSaveItem}
                onCancel={() => {
                  setScreen('admin-dashboard')
                  setEditingItemId(null)
                }}
                onNavigate={(s) => {
                  setEditingItemId(null)
                  navigate(s)
                }}
                onLogout={() => {
                  setEditingItemId(null)
                  doLogout()
                }}
              />
            )}
            {screen === 'admin-retirada' && (
              <AdminRetirada
                items={items}
                selectedItemId={selectedItemId}
                onSubmit={(form) => api.createWithdrawal(form)}
                onConfirm={(itemId) => {
                  setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status: 'retirado' } : i)))
                  setScreen('admin-dashboard')
                  loadData()
                }}
                onCancel={() => setScreen('admin-dashboard')}
                onNavigate={(s, opts) => navigate(s, opts)}
                onLogout={doLogout}
              />
            )}
            {screen === 'admin-relatorios' && (
              <AdminRelatorios
                items={items}
                categories={categories}
                onNavigate={(s, opts) => navigate(s, opts)}
                onLogout={doLogout}
              />
            )}
            {screen === 'admin-categorias' && (
              <AdminCategorias
                categories={categories}
                items={items}
                onAddCategory={handleAddCategory}
                onRenameCategory={handleRenameCategory}
                onDeleteCategory={handleDeleteCategory}
                onNavigate={(s, opts) => navigate(s, opts)}
                onLogout={doLogout}
              />
            )}
            {screen === 'admin-auditoria' && (
              <AdminAuditoria onNavigate={(s, opts) => navigate(s, opts)} onLogout={doLogout} />
            )}
          </>
        )}
    </div>
  )
}
