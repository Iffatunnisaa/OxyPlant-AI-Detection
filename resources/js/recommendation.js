function getSeverityClasses(severity) {
  switch ((severity || '').toLowerCase()) {
    case 'low':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'high':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function buildRecommendationHtml(data) {
  const p = data.prediction || {}
  const severity = data.severity || 'low'
  const rec = data.recommendation || { prevention: [], treatment: [], monitoring: [] }
  const refs = data.references || []

  const severityClass = getSeverityClasses(severity)

  const esc = (s) => String(s || '')

  const listToHtml = (items) => (items && items.length)
    ? `<ul class="mt-2 list-disc list-inside text-sm text-gray-600">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`
    : `<p class="mt-2 text-sm text-gray-500">No guidance.</p>`

  return `
    <div class="rounded-xl border p-5 shadow-sm bg-white">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Recommendation</h3>
          <p class="text-sm text-gray-600">${esc(p.plant)} — ${esc(p.disease)} ${p.confidence !== undefined ? `(${Math.round(p.confidence * 100)}%)` : ''}</p>
        </div>
        <span class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${severityClass}">${severity.toUpperCase()}</span>
      </div>

      <div class="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <h4 class="text-sm font-semibold text-gray-700">Prevention</h4>
          ${listToHtml(rec.prevention)}
        </div>
        <div>
          <h4 class="text-sm font-semibold text-gray-700">Treatment</h4>
          ${listToHtml(rec.treatment)}
        </div>
        <div>
          <h4 class="text-sm font-semibold text-gray-700">Monitoring</h4>
          ${listToHtml(rec.monitoring)}
        </div>
      </div>

      <div class="mt-4">
        <h4 class="text-sm font-semibold text-gray-700">References</h4>
        ${refs && refs.length ? `<ul class="mt-2 text-sm text-gray-600 list-disc list-inside">${refs.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` : `<p class="mt-2 text-sm text-gray-500">No references provided.</p>`}
      </div>
    </div>
  `
}

// auto-init widgets with data attributes: data-plant, data-disease, optional data-confidence
export function initRecommendationWidgets(selector = '[data-recommendation-widget]') {
  const nodes = document.querySelectorAll(selector)
  nodes.forEach(async (node) => {
    const plant = node.getAttribute('data-plant') || ''
    const disease = node.getAttribute('data-disease') || ''
    const confidence = node.getAttribute('data-confidence')
    const params = new URLSearchParams({ plant, disease })
    if (confidence) params.set('confidence', confidence)

    const compactMode = node.getAttribute('data-compact')

    node.innerHTML = '<div class="p-4">Loading recommendation…</div>'

    try {
      const res = await fetch(`/recommendation?${params.toString()}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        node.innerHTML = `<div class="p-4 text-red-600">Error: ${body.message || res.statusText}</div>`
        return
      }
      const json = await res.json()

      // Compact CTA mode: show short prevention summary and link to details
      if (compactMode === 'cta') {
        const prevention = (json.recommendation && json.recommendation.prevention) || []
        const first = prevention[0]
        const plantId = node.getAttribute('data-plant-id') || ''
        const plantName = json.prediction?.plant || node.getAttribute('data-plant') || ''
        const diseaseName = json.prediction?.disease || node.getAttribute('data-disease') || ''

        const esc = (s) => String(s || '')

        let html = '<div class="flex items-center justify-between gap-3">'
        if (first) {
          html += `<p class="text-sm text-orange-900">${esc(first)}</p>`
        } else {
          html += `<p class="text-sm text-orange-900">Tidak ada rekomendasi pencegahan spesifik.</p>`
        }

        const query = new URLSearchParams({ plant: plantName, disease: diseaseName }).toString()
        const detailsHref = plantId ? `/plant_info/?plant=${encodeURIComponent(plantId)}&disease=${encodeURIComponent(diseaseName)}` : `/plant_info/?${query}`

        html += `<a href="${detailsHref}" class="inline-flex items-center gap-2 rounded-md bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">Lihat selengkapnya →</a>`
        html += '</div>'

        node.innerHTML = html
        return
      }

      // default: full card
      node.innerHTML = buildRecommendationHtml(json)
    } catch (err) {
      node.innerHTML = `<div class="p-4 text-red-600">Error: ${err.message || 'Failed to fetch'}</div>`
    }
  })
}

// Auto-init on DOMContentLoaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => initRecommendationWidgets())
}
