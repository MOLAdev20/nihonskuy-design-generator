import { useState } from 'react'

const API_ENDPOINT_MANUAL = 'http://localhost:8080/api/generate-poster'
const API_ENDPOINT_PDF_SUGGESTION = 'http://localhost:8080/api/suggest-from-pdf'

function App() {
  const [lokasi, setLokasi] = useState('')
  const [gaji, setGaji] = useState('')
  const [posisi, setPosisi] = useState('')
  const [syarat, setSyarat] = useState([''])
  const [benefit, setBenefit] = useState([''])
  const [analysisExplanation, setAnalysisExplanation] = useState('')
  const [pdfFile, setPdfFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [dragState, setDragState] = useState(null)

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

  const reorderItems = (items, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return items

    const next = [...items]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    return next
  }

  const handleDragStart = (listType, index) => {
    setDragState({ listType, index })
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const handleDrop = (setter, items, listType, dropIndex) => {
    if (!dragState || dragState.listType !== listType) return

    setter(reorderItems(items, dragState.index, dropIndex))
    setDragState(null)
  }

  const handleDragEnd = () => {
    setDragState(null)
  }

  const sanitizeDynamicValues = (items) => {
    return items.map((item) => item.trim()).filter(Boolean)
  }

  const normalizeArrayForForm = (items) => {
    const cleaned = Array.isArray(items)
      ? items.map((item) => String(item || '').trim()).filter(Boolean)
      : []
    return cleaned.length > 0 ? cleaned : ['']
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

  const handleAnalyzePdf = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!pdfFile) {
      setErrorMessage('Upload file PDF Kyujin dulu.')
      return
    }

    try {
      setIsAnalyzingPdf(true)
      const formData = new FormData()
      formData.append('filePdf', pdfFile)

      const response = await fetch(API_ENDPOINT_PDF_SUGGESTION, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Gagal menganalisa PDF Kyujin.')
      }

      const result = await response.json()
      if (!result?.success || !result?.data) {
        throw new Error('Respons AI tidak valid.')
      }

      setLokasi(String(result.data.lokasi || ''))
      setGaji(String(result.data.gaji || ''))
      setPosisi(String(result.data.posisi || ''))
      setSyarat(normalizeArrayForForm(result.data.syarat))
      setBenefit(normalizeArrayForForm(result.data.benefit))
      setAnalysisExplanation(String(result.data.penjelasan || ''))
      setSuccessMessage('Saran dari AI sudah diisikan ke form. Silakan review dan edit jika perlu.')
    } catch (error) {
      setErrorMessage(error.message || 'Gagal menganalisa PDF Kyujin.')
    } finally {
      setIsAnalyzingPdf(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!lokasi.trim() || !gaji.trim() || !posisi.trim()) {
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
      const response = await fetch(API_ENDPOINT_MANUAL, {
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
    } catch (error) {
      setErrorMessage(error.message || 'Gagal membuat poster. Coba lagi beberapa saat.')
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-lg border border-cyan-300/35 bg-slate-900/50 p-5 shadow-[0_18px_60px_rgba(6,182,212,0.12)] sm:p-7">
            <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-cyan-200">Upload PDF Kyujin (AI Suggestion)</h2>
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <label className="block flex-1 space-y-2">
                  <span className="text-sm font-medium text-slate-300">File PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                    className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-500/25 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-cyan-100 hover:file:bg-cyan-500/35"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAnalyzePdf}
                  disabled={isAnalyzingPdf}
                  className="rounded-md border border-cyan-300/60 bg-cyan-500/15 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAnalyzingPdf ? 'Menganalisa PDF...' : 'Analisa PDF & Isi Otomatis'}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                AI hanya mengisi draft awal. Pastikan user review dan edit detail sebelum generate poster.
              </p>
            </section>

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
                    <div
                      key={`syarat-${index}`}
                      draggable
                      onDragStart={() => handleDragStart('syarat', index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(setSyarat, syarat, 'syarat', index)}
                      onDragEnd={handleDragEnd}
                      className={`flex gap-2 rounded-md border border-transparent p-1 transition ${dragState?.listType === 'syarat' && dragState.index === index ? 'opacity-50' : ''} ${dragState?.listType === 'syarat' ? 'hover:border-cyan-400/30' : ''}`}
                    >
                      <button
                        type="button"
                        aria-label={`Geser urutan syarat ${index + 1}`}
                        className="cursor-grab rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-slate-400 active:cursor-grabbing"
                      >
                        ::
                      </button>
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
                    <div
                      key={`benefit-${index}`}
                      draggable
                      onDragStart={() => handleDragStart('benefit', index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(setBenefit, benefit, 'benefit', index)}
                      onDragEnd={handleDragEnd}
                      className={`flex gap-2 rounded-md border border-transparent p-1 transition ${dragState?.listType === 'benefit' && dragState.index === index ? 'opacity-50' : ''} ${dragState?.listType === 'benefit' ? 'hover:border-fuchsia-400/30' : ''}`}
                    >
                      <button
                        type="button"
                        aria-label={`Geser urutan benefit ${index + 1}`}
                        className="cursor-grab rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-slate-400 active:cursor-grabbing"
                      >
                        ::
                      </button>
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
                disabled={isSubmitting || isAnalyzingPdf}
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

          <aside className="rounded-lg border border-fuchsia-300/30 bg-slate-900/55 p-5 shadow-[0_18px_60px_rgba(217,70,239,0.1)] sm:p-6 xl:sticky xl:top-24 xl:self-start">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-200">Penjelasan AI</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-100">Analisa Kyujin</h2>
              </div>

              {analysisExplanation ? (
                <div className="max-h-[70vh] overflow-y-auto rounded-md border border-slate-800 bg-slate-950/70 p-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                    {analysisExplanation}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-sm leading-7 text-slate-500">
                    Setelah PDF Kyujin dianalisa, panel ini akan menampilkan penjabaran lengkap dari AI agar user bisa memahami konteks lowongan sebelum mengedit form.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default App
