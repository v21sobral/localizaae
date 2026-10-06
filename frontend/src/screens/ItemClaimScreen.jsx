import { useState } from 'react'
import { ArrowLeft, Shield, AlertCircle, Check } from '../components/Icons'
import { isValidCPF, isValidPhone, maskPhone } from '../utils/validators'
import { formatDate } from '../utils/date'
import { api, errorMessage } from '../services/api'
const maskCPF = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
export default function ItemClaimScreen({ item, onComplete, onCancel, today }) {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({
    comprovacao: '',
    cpf: '',
    nome: '',
    sobrenome: '',
    ddd: '',
    telefone: '',
    tipoUsuario: 'Aluno',
  })
  const [errors, setErrors] = useState({})
  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }))
    setErrors((p) => ({ ...p, [k]: undefined }))
  }
  const validateStep1 = () => {
    const e = {}
    if (!form.comprovacao.trim()) e.comprovacao = 'Descreva como comprova ser o proprietário'
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const validateStep2 = () => {
    const e = {}
    if (!isValidCPF(form.cpf)) e.cpf = 'CPF inválido'
    if (!form.nome.trim()) e.nome = 'Obrigatório'
    if (!form.sobrenome.trim()) e.sobrenome = 'Obrigatório'
    if (!isValidPhone(form.ddd, form.telefone)) {
      if (!form.ddd || form.ddd.length < 2) e.ddd = 'DDD inválido'
      else e.telefone = 'Telefone inválido'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }
  const handleConfirm = async () => {
    if (submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.createClaim(item.id, form)
      setDone(true)
      setTimeout(onComplete, 1500)
    } catch (err) {
      setSubmitError(errorMessage(err))
      setSubmitting(false)
    }
  }
  const inp = (error) => ({
    width: '100%',
    padding: '8px 10px',
    border: `1px solid ${error ? 'var(--color-invalid)' : 'var(--color-border)'}`,
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxSizing: 'border-box',
  })
  const lbl = { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text)', marginBottom: 5 }
  const errStyle = { fontSize: 11, color: 'var(--color-danger-text)', marginTop: 3 }
  const formattedDate = formatDate(item.date, { day: '2-digit', month: 'long', year: 'numeric' })
  if (done) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--color-status-pending-bg)',
            border: '1px solid var(--color-status-pending-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
          }}
        >
          <Check size={22} strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text)', marginBottom: 4 }}>
            Solicitação enviada
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            O item foi marcado como pendente. A equipe entrará em contato.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '0 24px',
            height: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-text-muted)',
              fontSize: 13,
              padding: '4px 8px',
              borderRadius: 7,
            }}
            onMouseEnter={(e) => {
              const b = e.currentTarget
              b.style.color = 'var(--color-text)'
              b.style.background = 'var(--color-bg)'
            }}
            onMouseLeave={(e) => {
              const b = e.currentTarget
              b.style.color = 'var(--color-text-muted)'
              b.style.background = 'none'
            }}
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Voltar
          </button>
          <span style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>/</span>
          <span style={{ fontSize: 13, color: 'var(--color-text)', fontWeight: 500 }}>Reconhecer item</span>
        </div>
      </header>

      <main style={{ maxWidth: 520, margin: '0 auto', padding: '28px 24px' }}>
        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontWeight: 600,
              fontSize: 18,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              marginBottom: 2,
            }}
          >
            Reconhecer este item
          </h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            {item.name} — {item.locationPublic}
          </p>
        </div>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 22 }}>
          {['Comprovação', 'Seus dados', 'Confirmar'].map((label, i) => {
            const s = i + 1
            const isActive = step === s
            const isDone = step > s
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
                      fontSize: 12,
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {label}
                  </span>
                </div>
                {s < 3 && (
                  <div style={{ width: 24, height: 1, background: 'var(--color-border)', margin: '0 8px' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Step 1: Comprovação de posse */}
        {step === 1 && (
          <div>
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
                Comprovação de posse
              </div>
              <label htmlFor="claim-comprovacao" style={lbl}>
                Descreva como comprova ser o proprietário
              </label>
              <textarea
                id="claim-comprovacao"
                value={form.comprovacao}
                onChange={(e) => set('comprovacao', e.target.value)}
                placeholder="Ex: a mochila tem um adesivo de dinossauro azul na alça esquerda e meu nome dentro…"
                rows={4}
                aria-invalid={!!errors.comprovacao}
                aria-describedby={errors.comprovacao ? 'claim-comprovacao-err' : undefined}
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
              {errors.comprovacao && (
                <div id="claim-comprovacao-err" style={errStyle}>
                  {errors.comprovacao}
                </div>
              )}
            </div>
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
                type="button"
                onClick={() => {
                  if (validateStep1()) setStep(2)
                }}
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
          </div>
        )}

        {/* Step 2: Dados mínimos */}
        {step === 2 && (
          <div>
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
                Seus dados
              </div>

              {/* Privacy notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '8px 10px',
                  background: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 6,
                  marginBottom: 14,
                  fontSize: 12,
                  color: 'var(--color-warning-text)',
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1, display: 'flex' }}>
                  <Shield size={13} strokeWidth={2} />
                </span>
                <span>
                  Estes dados são coletados <strong>apenas nesta etapa</strong> para confirmação da
                  identidade. Não serão compartilhados.
                </span>
              </div>

              <div className="admin-form-grid">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="claim-cpf" style={lbl}>
                    CPF
                  </label>
                  <input
                    id="claim-cpf"
                    value={form.cpf}
                    onChange={(e) => set('cpf', maskCPF(e.target.value))}
                    maxLength={14}
                    placeholder="000.000.000-00"
                    aria-invalid={!!errors.cpf}
                    aria-describedby={errors.cpf ? 'claim-cpf-err' : undefined}
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
                    <div id="claim-cpf-err" style={errStyle}>
                      {errors.cpf}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="claim-nome" style={lbl}>
                    Nome
                  </label>
                  <input
                    id="claim-nome"
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
                  {errors.nome && <div style={errStyle}>{errors.nome}</div>}
                </div>
                <div>
                  <label htmlFor="claim-sobrenome" style={lbl}>
                    Sobrenome
                  </label>
                  <input
                    id="claim-sobrenome"
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
                  {errors.sobrenome && <div style={errStyle}>{errors.sobrenome}</div>}
                </div>
                <div>
                  <label htmlFor="claim-ddd" style={lbl}>
                    DDD
                  </label>
                  <input
                    id="claim-ddd"
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
                  {errors.ddd && <div style={errStyle}>{errors.ddd}</div>}
                </div>
                <div>
                  <label htmlFor="claim-tel" style={lbl}>
                    Telefone
                  </label>
                  <input
                    id="claim-tel"
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
                  {errors.telefone && <div style={errStyle}>{errors.telefone}</div>}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="claim-tipo" style={lbl}>
                    Tipo de usuário
                  </label>
                  <select
                    id="claim-tipo"
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
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
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
                type="button"
                onClick={() => {
                  if (validateStep2()) setStep(3)
                }}
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
          </div>
        )}

        {/* Step 3: Confirmação */}
        {step === 3 && (
          <div>
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
                Confirme sua solicitação
              </div>
              {[
                ['Item', item.name],
                ['Local', item.locationPublic],
                ['Encontrado em', formattedDate],
                ['Solicitante', `${form.nome} ${form.sobrenome}`],
                ['CPF', form.cpf],
                ['Telefone', `(${form.ddd}) ${form.telefone}`],
                ['Tipo', form.tipoUsuario],
                [
                  'Data da solicitação',
                  formatDate(today, { day: '2-digit', month: 'long', year: 'numeric' }),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    gap: 0,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--color-text-muted)',
                      minWidth: 140,
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '10px 12px',
                background: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 6,
                marginBottom: 14,
                fontSize: 12,
                color: 'var(--color-warning-text)',
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 1, display: 'flex' }}>
                <AlertCircle size={13} strokeWidth={2} />
              </span>
              <span>
                Ao confirmar, o item será marcado como <strong>Pendente</strong>. A equipe analisará sua
                solicitação e entrará em contato.
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
                type="button"
                onClick={() => setStep(2)}
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
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
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
                <Check size={14} strokeWidth={2.5} /> {submitting ? 'Enviando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
