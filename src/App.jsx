import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageCircle, Inbox, Rocket, Settings, ArrowRight, RefreshCw } from 'lucide-react'
import Spline from '@splinetool/react-spline'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white overflow-x-hidden">
      <header className="relative">
        <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-[radial-gradient(closest-side,_rgba(99,102,241,0.25),_transparent)] blur-3xl" />
        </div>
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
          <Link to="/" className="group inline-flex items-center gap-3">
            <div className="size-8 rounded-md bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 grid place-items-center">
              <Rocket className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">Ping</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/dashboard" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition">Dashboard</Link>
            <a href="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode" target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 transition">3D</a>
          </div>
        </nav>
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[76vh]">
          <Spline scene="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center max-w-3xl px-6">
              <AnimatePresence>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95]">
                  A playful way to route incoming messages
                </motion.h1>
              </AnimatePresence>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="mt-5 text-white/70">
                Each public handle gets a page. Visitors send a note. Our tiny engine decides: email, sms or inbox. All mocked, blazing fast.
              </motion.p>
              <div className="pointer-events-auto flex items-center justify-center gap-3 mt-8">
                <Link to="/u/davit" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-medium hover:scale-[1.02] active:scale-[0.98] transition">
                  Try with @davit <ArrowRight className="size-4" />
                </Link>
                <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/15 transition">
                  Open dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="px-6 md:px-10 py-10 text-sm text-white/60">Everything resets on restart • No external services</footer>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/60">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

function useFetch(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetch(url)
      .then(r => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(j => mounted && setData(j))
      .catch(e => mounted && setError(String(e)))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [url])
  return { data, loading, error, setData }
}

function HandlePage() {
  const { handle } = useParams()
  const navigate = useNavigate()
  const { data: user, loading } = useFetch(`${API_BASE}/api/users/${handle}`)
  const [form, setForm] = useState({ subject: '', message: '', contact: '', priority: 'normal' })
  const [submitted, setSubmitted] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ handle, ...form })
    })
    if (!res.ok) return alert('Failed to send')
    const j = await res.json()
    setSubmitted(j)
  }

  if (loading) return <div className="px-6 md:px-10 py-10">Loading…</div>
  if (!user) return <div className="px-6 md:px-10 py-10">Not found</div>

  if (submitted) {
    return (
      <div className="px-6 md:px-10 py-14">
        <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold">Message sent</h2>
          <p className="text-white/70 mt-2">Routed to: <span className="font-semibold">{submitted.decided_channel}</span></p>
          <div className="mt-6 grid gap-3">
            {submitted.deliveries.map((d, i) => (
              <div key={i} className="text-sm bg-black/30 border border-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  {d.channel === 'email' && <Mail className="size-4" />}
                  {d.channel === 'sms' && <MessageCircle className="size-4" />}
                  {d.channel === 'inbox' && <Inbox className="size-4" />}
                  <span className="font-medium">{d.channel}</span>
                </div>
                <div className="text-white/70 mt-2 whitespace-pre-wrap">{d.debug}{d.auto_reply ? `\nAuto-reply: ${d.auto_reply}` : ''}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setSubmitted(null)} className="px-4 py-2 rounded-full bg-white text-black">Send another</button>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-full bg-white/10">View dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 md:px-10 py-14">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
        <div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-black">@{user.handle}</div>
            <div className="text-white/70 mt-2">{user.name}</div>
            <p className="mt-5 leading-relaxed text-white/80">{user.bio}</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold">Send a message</h2>
          <div className="mt-6 grid gap-5">
            <Field label="Subject">
              <input required value={form.subject} onChange={e => setForm(s => ({ ...s, subject: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-white/20" placeholder="Subject" />
            </Field>
            <Field label="Message">
              <textarea required rows={5} value={form.message} onChange={e => setForm(s => ({ ...s, message: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-white/20" placeholder="Write something nice…" />
            </Field>
            <Field label="Your contact (email or phone)">
              <input required value={form.contact} onChange={e => setForm(s => ({ ...s, contact: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-white/20" placeholder="you@example.com or +123…" />
            </Field>
            <Field label="Priority">
              <div className="flex gap-3">
                {['normal','urgent'].map(p => (
                  <button type="button" key={p} onClick={() => setForm(s => ({ ...s, priority: p }))} className={`px-4 py-2 rounded-full border ${form.priority===p? 'bg-white text-black border-white' : 'bg-white/5 border-white/10'}`}>{p}</button>
                ))}
              </div>
            </Field>
            <div className="flex justify-end">
              <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black font-medium hover:scale-[1.01] active:scale-[0.99] transition">
                Send <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

function Dashboard() {
  const { data: messages, loading, setData } = useFetch(`${API_BASE}/api/messages`)
  const { data: rules, setData: setRules } = useFetch(`${API_BASE}/api/rules`)

  const refresh = async () => {
    const r = await fetch(`${API_BASE}/api/messages`)
    setData(await r.json())
  }

  const saveRules = async () => {
    try {
      const parsed = JSON.parse(rulesText)
      const res = await fetch(`${API_BASE}/api/rules`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed) })
      if (res.ok) setRules(await (await fetch(`${API_BASE}/api/rules`)).json())
    } catch (e) { alert('Invalid JSON') }
  }

  const [rulesText, setRulesText] = useState('')
  useEffect(() => { if (rules) setRulesText(JSON.stringify(rules, null, 2)) }, [rules])

  return (
    <div className="px-6 md:px-10 py-14">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">All messages</h2>
            <div className="flex gap-2">
              <button onClick={refresh} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 flex items-center gap-2 text-sm"><RefreshCw className="size-4" /> Refresh</button>
              <button onClick={async () => { await fetch(`${API_BASE}/api/messages`, { method: 'DELETE' }); refresh() }} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-sm">Clear</button>
            </div>
          </div>
          {loading && <div>Loading…</div>}
          <div className="grid gap-3">
            {messages && messages.length === 0 && <div className="text-white/60">No messages yet. Try sending from a handle page.</div>}
            {messages && messages.map(m => (
              <div key={m.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-2 py-0.5 rounded-full bg-white/10">@{m.handle}</span>
                  <span className="text-white/60">{new Date(m.created_at).toLocaleString()}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-black">{m.decided_channel}</span>
                  <span className="text-white/80 font-medium">{m.subject}</span>
                </div>
                <div className="mt-3 text-white/70 text-sm">{m.message}</div>
                <div className="mt-3 grid gap-2">
                  {m.deliveries.map((d, i) => (
                    <div key={i} className="text-xs bg-black/30 border border-white/10 rounded-lg p-2">
                      <div className="flex items-center gap-1">
                        {d.channel === 'email' && <Mail className="size-3" />}
                        {d.channel === 'sms' && <MessageCircle className="size-3" />}
                        {d.channel === 'inbox' && <Inbox className="size-3" />}
                        <span className="font-medium">{d.channel}</span>
                      </div>
                      <div className="text-white/70 mt-1 whitespace-pre-wrap">{d.debug}{d.auto_reply ? `\nAuto-reply: ${d.auto_reply}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full lg:w-[460px]">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Routing rules</h3>
              <Settings className="size-4" />
            </div>
            <p className="text-white/60 text-sm mt-1">Edit the JSON rules that decide which channel is used.</p>
            <textarea value={rulesText} onChange={e => setRulesText(e.target.value)} rows={20} className="mt-3 w-full bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-sm outline-none focus:ring-2 ring-white/20" />
            <div className="mt-3 flex gap-2">
              <button onClick={saveRules} className="px-3 py-1.5 rounded-full bg-white text-black text-sm">Save</button>
              <button onClick={async () => { const r = await fetch(`${API_BASE}/api/rules`); setRules(await r.json()); }} className="px-3 py-1.5 rounded-full bg-white/10 text-sm">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RouterApp() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<div className="px-6 md:px-10 py-20 grid md:grid-cols-3 gap-6">
            {[{h:'davit',n:'Davit'},{h:'alex',n:'Alex'},{h:'kai',n:'Kai'}].map(u => (
              <Link key={u.h} to={`/u/${u.h}`} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
                <div className="text-2xl font-black">@{u.h}</div>
                <div className="text-white/70">{u.n}</div>
                <div className="mt-6 inline-flex items-center gap-2 text-sm opacity-80 group-hover:opacity-100">Open page <ArrowRight className="size-4" /></div>
              </Link>
            ))}
          </div>} />
          <Route path="/u/:handle" element={<HandlePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<div className="px-6 md:px-10 py-16">Not found</div>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  )
}

export default RouterApp
