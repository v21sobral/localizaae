import { useMemo, useState, useEffect, useRef } from 'react'
import AdminShell from '../components/AdminShell'
import { api, errorMessage } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import UnsavedChangesModal from '../components/UnsavedChangesModal'
import { Package, Check, AlertCircle } from '../components/Icons'
import { isValidCPF, isValidPhone, maskPhone } from '../utils/validators'
const maskCPF = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
export default function AdminRetirada({
  items,
  selectedItemId,
  onSubmit,
  onConfirm,
  onCancel,
  onNavigate,
  onLogout,
}) {
  // Disponíveis e pendentes (pendente = alguém já fez o pedido pelo mural); pendentes primeiro.
  const availableItems = items
    .filter((i) => i.status === 'disponivel' || i.status === 'pendente')
    .sort((a, b) => (a.status === 'pendente' ? 0 : 1) - (b.status === 'pendente' ? 0 : 1))
  const blankForm = (itemId) => ({
    itemId,
    cpf: '',
    nome: '',
    sobrenome: '',
    ddd: '',
    telefone: '',
    tipoUsuario: 'Aluno',
    comprovacao: '',
  })
  const initialForm = useMemo(
    () => blankForm(selectedItemId ?? availableItems[0]?.id ?? ''),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const [form, setForm] = useState(initialForm)
  // Estado de referência para detectar alterações (muda quando preenchemos a partir da solicitação)
  const [baseline, setBaseline] = useState(initialForm)
  const [claimInfo, setClaimInfo] = useState({ state: 'idle' })
  const filledFromClaim = useRef(false)
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pending, setPending] = useState(null)
  const timerRef = useRef(null)
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
  const isDirty = !done && JSON.stringify(form) !== JSON.stringify(baseline)
  const guardedNavigate = (s) => {
    if (isDirty) setPending({ type: 'screen', screen: s })
    else onNavigate(s)
  }
  const guardedLogout = () => {
    if (isDirty) setPending({ type: 'logout' })
    else onLogout()
  }
  const discardAndContinue = () => {
    if (!pending) return
    const dest = pending
    setPending(null)
    if (dest.type === 'logout') onLogout()
    else onNavigate(dest.screen)
  }
  const selectedItem = items.find((i) => i.id === form.itemId)
  const selectedStatus = selectedItem?.status

  // Item pendente: busca a solicitação feita no mural e preenche os dados do solicitante.
  useEffect(() => {
    const clearFilled = () => {
      if (!filledFromClaim.current) return
      filledFromClaim.current = false
      const blank = blankForm(form.itemId)
      setForm(blank)
      setBaseline(blank)
    }
    if (!form.itemId || selectedStatus !== 'pendente') {
      setClaimInfo({ state: 'idle' })
      clearFilled()
      return
    }
    let cancelled = false
    setClaimInfo({ state: 'loading' })
    api
      .getItemClaims(form.itemId)
      .then((claims) => {
        if (cancelled) return
        const c = claims[0] // a mais recente
        if (!c) {
          clearFilled()
          setClaimInfo({ state: 'missing' })
          return
        }
        const filled = {
          itemId: form.itemId,
          cpf: maskCPF(c.cpf),
          nome: c.nome,
          sobrenome: c.sobrenome,
          ddd: c.ddd,
          telefone: maskPhone(c.telefone),
          tipoUsuario: c.tipoUsuario,
          comprovacao: c.comprovacao,
        }
        filledFromClaim.current = true
        setForm(filled)
        setBaseline(filled)
        setErrors({})
        setClaimInfo({ state: 'filled', date: c.createdAt })
      })
      .catch((err) => {
        if (cancelled) return
        clearFilled()
        setClaimInfo({ state: 'error', message: errorMessage(err) })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.itemId, selectedStatus])
  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }))
    setErrors((p) => ({ ...p, [k]: undefined }))
  }
  const validate = () => {
    const e = {}
    if (!form.itemId) e.itemId = 'Selecione um item'
    if (!isValidCPF(form.cpf)) e.cpf = 'CPF inválido'
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.sobrenome.trim()) e.sobrenome = 'Obrigatório'
    if (!isValidPhone(form.ddd, form.telefone)) {
      if (!form.ddd || form.ddd.length < 2) e.ddd = 'DDD inválido (2 dígitos)'
      else e.telefone = 'Telefone inválido'
    }
    if (!form.comprovacao.trim()) e.comprovacao = 'Obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleNext = (e) => {
    e.preventDefault()
    if (validate()) setStep(2)
  }
  const handleConfirm = async () => {
    if (confirming) return
    setConfirming(true)
    setSubmitError('')
    try {
      await onSubmit(form)
      setDone(true)
      timerRef.current = setTimeout(() => onConfirm(form.itemId), 1500)
    } catch (err) {
      setSubmitError(errorMessage(err))
      setConfirming(false)
    }
  }
  const inp = (error) => ({
    width: '100%',
    padding: '7px 10px',
    border: `1px solid ${error ? 'var(--color-invalid)' : 'var(--color-border)'}`,
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box',
  })
  const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text)', marginBottom: 5 }
  const err = { fontSize: 11, color: 'var(--color-danger-text)', marginTop: 3 }
  if (done) {
    return (
      <AdminShell active="admin-retirada" onNavigate={onNavigate} onLogout={onLogout}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
            gap: 14,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--color-status-retrieved-bg)',
              border: '1px solid var(--color-status-retrieved-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)',
            }}
          >
            <Check size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)', marginBottom: 4 }}>
              Retirada registrada
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              O item foi marcado como retirado. Redirecionando…
            </p>
          </div>
        </div>
      </AdminShell>
    )
  }
  return (
    <AdminShell active="admin-retirada" onNavigate={guardedNavigate} onLogout={guardedLogout}>
      <UnsavedChangesModal
        open={pending !== null}
        message="Você tem dados de retirada preenchidos que ainda não foram confirmados. Se sair agora, essas informações serão perdidas."
        onDiscard={discardAndContinue}
        onCancel={() => setPending(null)}
      />
      <div style={{ maxWidth: 640 }}>
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
            Registro de Retirada
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            Preencha os dados de quem está retirando o item presencialmente.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 22 }}>
          {['Dados do solicitante', 'Confirmar'].map((label, i) => {
            const s = i + 1
            const isActive = step === s
            const isDone = step > s
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: isDone
                        ? 'var(--color-success)'
                        : isActive
                          ? 'var(--color-primary)'
                          : 'var(--color-border)',
                      color: isDone || isActive ? 'var(--color-on-primary)' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? <Check size={12} strokeWidth={3} /> : s}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                    }}
                  >
                    {label}
                  </span>
                </div>
                {s < 2 && (
                  <div
                    style={{ width: 32, height: 1, background: 'var(--color-border)', margin: '0 10px' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {step === 1 && (
          <form onSubmit={handleNext}>
            <Section title="Item">
              <div>
                <label htmlFor="ret-item" style={lbl}>
                  Selecionar item (disponível ou pendente)
                </label>
                <select
                  id="ret-item"
                  value={form.itemId}
                  onChange={(e) => set('itemId', e.target.value)}
                  style={{ ...inp(!!errors.itemId), cursor: 'pointer' }}
                >
                  {availableItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.status === 'pendente' ? '[Pendente] ' : ''}
                      {i.name} — {i.locationPublic}
                    </option>
                  ))}
                </select>
                {errors.itemId && <div style={err}>{errors.itemId}</div>}
                {selectedItem && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '8px 10px',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Package size={14} strokeWidth={1.75} color="var(--color-text-muted)" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                      {selectedItem.name}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>—</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      {selectedItem.locationPublic}
                    </span>
                    <div style={{ marginLeft: 'auto' }}>
                      <StatusBadge status={selectedItem.status} size="sm" />
                    </div>
                  </div>
                )}
                {claimInfo.state !== 'idle' && (
                  <div
                    role="status"
                    style={{
                      marginTop: 8,
                      padding: '8px 10px',
                      fontSize: 12,
                      borderRadius: 6,
                      background: claimInfo.state === 'error' ? 'var(--color-danger-bg)' : 'var(--color-bg)',
                      border: `1px solid ${
                        claimInfo.state === 'error' ? 'var(--color-danger-border)' : 'var(--color-border)'
                      }`,
                      color: claimInfo.state === 'error' ? 'var(--color-danger-text)' : 'var(--color-text-muted)',
                    }}
                  >
                    {claimInfo.state === 'loading' && 'Carregando a solicitação feita no mural…'}
                    {claimInfo.state === 'filled' &&
                      `Dados preenchidos a partir da solicitação feita no mural em ${new Date(
                        claimInfo.date,
                      ).toLocaleDateString('pt-BR')}. Confira o documento do solicitante antes de continuar.`}
                    {claimInfo.state === 'missing' &&
                      'Este item está pendente, mas não há solicitação registrada. Preencha os dados manualmente.'}
                    {claimInfo.state === 'error' && claimInfo.message}
                  </div>
                )}
              </div>
            </Section>

            <Section title="Dados do solicitante">
              <div className="admin-form-grid">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="ret-cpf" style={lbl}>
                    CPF
                  </label>
                  <input
                    id="ret-cpf"
                    value={form.cpf}
                    onChange={(e) => set('cpf', maskCPF(e.target.value))}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    aria-invalid={!!errors.cpf}
                    aria-describedby={errors.cpf ? 'ret-cpf-err' : undefined}
                    style={inp(!!errors.cpf)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.cpf ? 'var(--color-invalid)' : 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.cpf && (
                    <div id="ret-cpf-err" style={err}>
                      {errors.cpf}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="ret-nome" style={lbl}>
                    Nome
                  </label>
                  <input
                    id="ret-nome"
                    value={form.nome}
                    onChange={(e) => set('nome', e.target.value)}
                    placeholder="Maria"
                    aria-invalid={!!errors.nome}
                    style={inp(!!errors.nome)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.nome
                        ? 'var(--color-invalid)'
                        : 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.nome && <div style={err}>{errors.nome}</div>}
                </div>
                <div>
                  <label htmlFor="ret-sobrenome" style={lbl}>
                    Sobrenome
                  </label>
                  <input
                    id="ret-sobrenome"
                    value={form.sobrenome}
                    onChange={(e) => set('sobrenome', e.target.value)}
                    placeholder="Silva"
                    aria-invalid={!!errors.sobrenome}
                    style={inp(!!errors.sobrenome)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.sobrenome
                        ? 'var(--color-invalid)'
                        : 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.sobrenome && <div style={err}>{errors.sobrenome}</div>}
                </div>
                <div>
                  <label htmlFor="ret-ddd" style={lbl}>
                    DDD
                  </label>
                  <input
                    id="ret-ddd"
                    value={form.ddd}
                    onChange={(e) => set('ddd', e.target.value.replace(/\D/g, '').slice(0, 2))}
                    placeholder="11"
                    maxLength={2}
                    aria-invalid={!!errors.ddd}
                    style={inp(!!errors.ddd)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.ddd ? 'var(--color-invalid)' : 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.ddd && <div style={err}>{errors.ddd}</div>}
                </div>
                <div>
                  <label htmlFor="ret-tel" style={lbl}>
                    Telefone
                  </label>
                  <input
                    id="ret-tel"
                    value={form.telefone}
                    onChange={(e) => set('telefone', maskPhone(e.target.value))}
                    placeholder="98765-4321"
                    aria-invalid={!!errors.telefone}
                    style={inp(!!errors.telefone)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-primary)'
                      e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.telefone
                        ? 'var(--color-invalid)'
                        : 'var(--color-border)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  {errors.telefone && <div style={err}>{errors.telefone}</div>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="ret-tipo" style={lbl}>
                    Tipo de usuário
                  </label>
                  <select
                    id="ret-tipo"
                    value={form.tipoUsuario}
                    onChange={(e) => set('tipoUsuario', e.target.value)}
                    style={{ ...inp(false), cursor: 'pointer' }}
                  >
                    {['Aluno', 'Professor', 'Funcionário', 'Visitante', 'Outro'].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Comprovação de posse">
              <label htmlFor="ret-comprov" style={lbl}>
                Descrição ou comprovante
              </label>
              <textarea
                id="ret-comprov"
                value={form.comprovacao}
                onChange={(e) => set('comprovacao', e.target.value)}
                placeholder="Descreva características do item que comprovem ser o proprietário…"
                rows={3}
                aria-invalid={!!errors.comprovacao}
                style={{ ...inp(!!errors.comprovacao), resize: 'vertical' }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)'
                  e.target.style.boxShadow = '0 0 0 3px var(--color-ring)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.comprovacao
                    ? 'var(--color-invalid)'
                    : 'var(--color-border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {errors.comprovacao && <div style={err}>{errors.comprovacao}</div>}
            </Section>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
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
                }}
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
                }}
              >
                Avançar
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div>
            <Section title="Confirme os dados">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  ['Item', selectedItem?.name ?? ''],
                  ['Local', selectedItem?.locationPublic ?? ''],
                  ['Solicitante', `${form.nome} ${form.sobrenome}`],
                  ['CPF', form.cpf],
                  ['Telefone', `(${form.ddd}) ${form.telefone}`],
                  ['Tipo', form.tipoUsuario],
                  ['Comprovação', form.comprovacao],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      gap: 0,
                      padding: '9px 0',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'var(--color-text-muted)',
                        minWidth: 110,
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{value}</span>
                  </div>
                ))}
              </div>
            </Section>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '10px 12px',
                background: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 12,
                color: 'var(--color-warning-text)',
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1, display: 'flex' }}>
                <AlertCircle size={14} strokeWidth={2} />
              </span>
              <span>
                Ao confirmar, o status do item será alterado para <strong>Retirado</strong>. Esta ação não
                pode ser desfeita.
              </span>
            </div>

            {submitError && (
              <div
                role="alert"
                style={{
                  padding: '10px 12px',
                  background: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  borderRadius: 6,
                  marginBottom: 14,
                  fontSize: 12,
                  color: 'var(--color-danger-text)',
                }}
              >
                {submitError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '7px 16px',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  borderRadius: 6,
                  fontSize: 13,
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Voltar
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirming}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 18px',
                  background: confirming ? 'var(--color-primary-disabled)' : 'var(--color-success)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: confirming ? 'not-allowed' : 'pointer',
                  opacity: confirming ? 0.7 : 1,
                }}
              >
                <Check size={14} strokeWidth={2.5} /> {confirming ? 'Registrando…' : 'Confirmar retirada'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
function Section({ title, children }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 7,
        padding: '16px 18px',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--color-text)',
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}
