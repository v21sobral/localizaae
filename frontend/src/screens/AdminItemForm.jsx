import { useMemo, useState } from 'react'
import AdminShell from '../components/AdminShell'
import UnsavedChangesModal from '../components/UnsavedChangesModal'
import { Upload } from '../components/Icons'
import { todayLocalISO } from '../utils/date'
export default function AdminItemForm({
  items,
  editingItemId,
  onSave,
  onCancel,
  onNavigate,
  onLogout,
  categories,
}) {
  const existing = editingItemId ? items.find((i) => i.id === editingItemId) : null
  const isEdit = !!existing
  const initialForm = useMemo(
    () => ({
      name: existing?.name ?? '',
      description: existing?.description ?? '',
      category: existing?.category ?? categories[0] ?? '',
      locationPublic: existing?.locationPublic ?? '',
      locationDetail: existing?.locationDetail ?? '',
      date: existing?.date ?? todayLocalISO(),
      status: existing?.status ?? 'disponivel',
      imageUrl: existing?.imageUrl ?? '',
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [],
  )
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [imgError, setImgError] = useState(false)
  const [pending, setPending] = useState(null)
  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm)
  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (field === 'imageUrl') setImgError(false)
  }
  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Campo obrigatório'
    if (!form.description.trim()) e.description = 'Campo obrigatório'
    if (!form.locationPublic.trim()) e.locationPublic = 'Campo obrigatório'
    if (!form.locationDetail.trim()) e.locationDetail = 'Campo obrigatório'
    if (!form.date) e.date = 'Campo obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const buildItem = () => ({ ...form, id: existing?.id ?? Date.now().toString() })
  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) onSave(buildItem())
  }
  const guardedNavigate = (s) => {
    if (isDirty) setPending({ type: 'screen', screen: s })
    else onNavigate(s)
  }
  const guardedLogout = () => {
    if (isDirty) setPending({ type: 'logout' })
    else onLogout()
  }
  const goToPending = (dest) => {
    if (dest.type === 'logout') onLogout()
    else onNavigate(dest.screen)
  }
  const discardAndContinue = () => {
    if (!pending) return
    const dest = pending
    setPending(null)
    goToPending(dest)
  }
  const saveAndContinue = async () => {
    if (!pending) return
    if (!validate()) {
      setPending(null)
      return
    }
    const dest = pending
    setPending(null)
    const saved = await onSave(buildItem())
    if (saved !== false) goToPending(dest)
  }
  const hasImagePreview = !!form.imageUrl && !imgError
  return (
    <AdminShell active="admin-item-form" onNavigate={guardedNavigate} onLogout={guardedLogout}>
      <UnsavedChangesModal
        open={pending !== null}
        message="Você tem alterações não salvas neste item. Deseja salvá-las antes de sair desta tela?"
        onSaveAndContinue={saveAndContinue}
        onDiscard={discardAndContinue}
        onCancel={() => setPending(null)}
      />
      <div style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontWeight: 600,
              fontSize: 18,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              marginBottom: 2,
            }}
          >
            {isEdit ? 'Editar item' : 'Cadastrar item'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {isEdit ? 'Atualize as informações do item encontrado.' : 'Preencha os dados do item encontrado.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <FormSection title="Informações do item">
            <div className="admin-form-grid">
              <FormField label="Nome do item" error={errors.name} colSpan fieldId="ifrm-name">
                <Input
                  id="ifrm-name"
                  value={form.name}
                  onChange={(v) => set('name', v)}
                  placeholder="Ex: Óculos de grau"
                  error={!!errors.name}
                  errId="ifrm-name-err"
                />
              </FormField>

              <FormField label="Descrição" error={errors.description} colSpan fieldId="ifrm-desc">
                <textarea
                  id="ifrm-desc"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Descreva o item com detalhes relevantes para identificação…"
                  rows={3}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? 'ifrm-desc-err' : undefined}
                  style={{ ...inputBase(!!errors.description), resize: 'vertical' }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-primary)'
                    e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.description
                      ? 'var(--color-invalid)'
                      : 'var(--color-border)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                {errors.description && (
                  <div
                    id="ifrm-desc-err"
                    style={{ fontSize: 11, color: 'var(--color-danger-text)', marginTop: 4 }}
                  >
                    {errors.description}
                  </div>
                )}
              </FormField>

              <FormField label="Categoria" error={errors.category} fieldId="ifrm-cat">
                <select
                  id="ifrm-cat"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  style={{ ...inputBase(false), cursor: 'pointer' }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Status" fieldId="ifrm-status">
                <select
                  id="ifrm-status"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  style={{ ...inputBase(false), cursor: 'pointer' }}
                >
                  <option value="disponivel">Disponível</option>
                  <option value="pendente">Pendente</option>
                  <option value="retirado">Retirado</option>
                </select>
              </FormField>

              <FormField label="Local público" error={errors.locationPublic} fieldId="ifrm-locpub">
                <Input
                  id="ifrm-locpub"
                  value={form.locationPublic}
                  onChange={(v) => set('locationPublic', v)}
                  placeholder="Ex: Bloco A – Corredor Principal"
                  error={!!errors.locationPublic}
                  errId="ifrm-locpub-err"
                />
              </FormField>

              <FormField label="Local detalhado" error={errors.locationDetail} fieldId="ifrm-locdet">
                <Input
                  id="ifrm-locdet"
                  value={form.locationDetail}
                  onChange={(v) => set('locationDetail', v)}
                  placeholder="Ex: Próximo ao bebedouro, 2º andar"
                  error={!!errors.locationDetail}
                  errId="ifrm-locdet-err"
                />
              </FormField>

              <FormField label="Data em que foi encontrado" error={errors.date} fieldId="ifrm-date">
                <Input
                  id="ifrm-date"
                  type="date"
                  value={form.date}
                  onChange={(v) => set('date', v)}
                  error={!!errors.date}
                  errId="ifrm-date-err"
                />
              </FormField>
            </div>
          </FormSection>

          <FormSection
            title="Foto do item"
            subtitle="Opcional — adicione uma URL de imagem para exibição no mural."
          >
            <Input
              id="ifrm-img"
              value={form.imageUrl ?? ''}
              onChange={(v) => set('imageUrl', v)}
              placeholder="https://…"
              error={false}
            />
            <div
              style={{
                marginTop: 10,
                height: 120,
                borderRadius: 6,
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {hasImagePreview ? (
                <img
                  src={form.imageUrl}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--color-text-subtle)',
                  }}
                >
                  <Upload size={20} strokeWidth={1.5} />
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Prévia da imagem</span>
                </div>
              )}
            </div>
          </FormSection>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '7px 16px',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                borderRadius: 6,
                fontSize: 13,
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '7px 18px',
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-primary-dark)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-primary)')}
            >
              {isEdit ? 'Salvar alterações' : 'Cadastrar item'}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  )
}
const inputBase = (error) => ({
  width: '100%',
  padding: '7px 10px',
  border: `1px solid ${error ? 'var(--color-invalid)' : 'var(--color-border)'}`,
  borderRadius: 6,
  fontSize: 13,
  outline: 'none',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  boxSizing: 'border-box',
  lineHeight: 1.4,
})
function Input({ id, value, onChange, placeholder, error, type = 'text', errId }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={error || undefined}
      aria-describedby={error && errId ? errId : undefined}
      style={inputBase(error)}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--color-primary)'
        e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = error ? 'var(--color-invalid)' : 'var(--color-border)'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}
function FormSection({ title, subtitle, children }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 7,
        padding: '18px 20px',
        marginBottom: 12,
      }}
    >
      <div style={{ marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)' }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  )
}
function FormField({ label, error, children, colSpan, fieldId }) {
  return (
    <div style={colSpan ? { gridColumn: '1 / -1' } : {}}>
      <label
        htmlFor={fieldId}
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--color-text)',
          marginBottom: 5,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <div
          id={fieldId ? `${fieldId}-err` : undefined}
          style={{ fontSize: 11, color: 'var(--color-danger-text)', marginTop: 4 }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
