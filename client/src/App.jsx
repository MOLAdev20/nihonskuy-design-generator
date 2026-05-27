import { useMemo, useState } from 'react'

const API_ENDPOINT = 'http://localhost:8080/api/generate-poster'
const DEFAULT_SYARAT = ['']
const DEFAULT_BENEFIT = ['']

function App() {
  const [lokasi, setLokasi] = useState('')
  const [gaji, setGaji] = useState('')
  const [posisi, setPosisi] = useState('')
  const [syarat, setSyarat] = useState(DEFAULT_SYARAT)
  const [benefit, setBenefit] = useState(DEFAULT_BENEFIT)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isFormInvalid = useMemo(() => {
    return !lokasi.trim() || !gaji.trim() || !posisi.trim()
  }, [lokasi, gaji, posisi])

  const updateArrayItem = (setter, source, index, value) => {
    const next = [...source]
    next[index] = value
    setter(next)
  }

  const appendItem = (setter, source) => {
    setter([...source, ''])
  }

  const removeItem = (setter, source, index) => {
    if (source.length === 1) return
    setter(source.filter((_, itemIndex) => itemIndex !== index))
  }

  const sanitizeDynamicValues = (items) => {
    return items.map((item) => item.trim()).filter(Boolean)
  }

  const triggerDownload = (blob, filename) => {
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (isFormInvalid) {
      setErrorMessage('Lengkapi lokasi, range gaji, dan posisi pekerjaan.')
      return
    }

    const payload = {
      lokasi: lokasi.trim(),
      gaji: gaji.trim(),
      posisi: posisi.trim(),
      syarat: sanitizeDynamicValues(syarat),
      benefit: sanitizeDynamicValues(benefit),
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Backend mengembalikan respons gagal.')
      }

      const imageBlob = await response.blob()
      if (!imageBlob || imageBlob.size === 0) {
        throw new Error('Respons gambar kosong.')
      }

      triggerDownload(imageBlob, 'poster-loker-nihonskuy.jpg')
      setSuccessMessage('Poster berhasil dibuat dan download sudah dipicu.')
    } catch {
      setErrorMessage('Gagal membuat poster. Coba lagi beberapa saat.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-cyan-500/30 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-cyan-300/50 bg-slate-900 shadow-[0_0_24px_rgba(34,211,238,0.22)]">
            <span className="font-mono text-sm font-semibold tracking-wide text-cyan-200">NS</span>
          </div>
          <p className="font-mono text-lg font-semibold tracking-[0.02em] text-cyan-100">Nihonskuy</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-cyan-300/35 bg-slate-900/50 p-5 shadow-[0_18px_60px_rgba(6,182,212,0.12)] sm:p-7">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-300">Lokasi</span>
                <input
                  type="text"
                  value={lokasi}
                  onChange={(event) => setLokasi(event.target.value)}
                  placeholder="SAITAMA - MISATO"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Range Gaji</span>
                <input
                  type="text"
                  value={gaji}
                  onChange={(event) => setGaji(event.target.value)}
                  placeholder="¥272,200 - ¥302,200"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-300">Posisi Pekerjaan</span>
                <input
                  type="text"
                  value={posisi}
                  onChange={(event) => setPosisi(event.target.value)}
                  placeholder="RESTORAN (HOTEL)"
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </label>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-cyan-200">Syarat</h2>
                  <button
                    type="button"
                    onClick={() => appendItem(setSyarat, syarat)}
                    className="rounded-md border border-cyan-400/40 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300 hover:bg-cyan-500/10"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {syarat.map((item, index) => (
                    <div key={`syarat-${index}`} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(event) => updateArrayItem(setSyarat, syarat, index, event.target.value)}
                        placeholder={`Syarat ${index + 1}`}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(setSyarat, syarat, index)}
                        className="rounded-md border border-rose-400/35 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={syarat.length === 1}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-fuchsia-200">Benefit</h2>
                  <button
                    type="button"
                    onClick={() => appendItem(setBenefit, benefit)}
                    className="rounded-md border border-fuchsia-400/40 px-3 py-1.5 text-xs font-semibold text-fuchsia-200 transition hover:border-fuchsia-300 hover:bg-fuchsia-500/10"
                  >
                    + Tambah
                  </button>
                </div>
                <div className="space-y-2">
                  {benefit.map((item, index) => (
                    <div key={`benefit-${index}`} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(event) => updateArrayItem(setBenefit, benefit, index, event.target.value)}
                        placeholder={`Benefit ${index + 1}`}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(setBenefit, benefit, index)}
                        className="rounded-md border border-rose-400/35 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={benefit.length === 1}
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md border border-cyan-300/60 bg-cyan-500/15 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Memproses Poster...' : 'Generate & Download Poster'}
              </button>

              {errorMessage ? (
                <p className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                  {errorMessage}
                </p>
              ) : null}
              {successMessage ? (
                <p className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                  {successMessage}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
