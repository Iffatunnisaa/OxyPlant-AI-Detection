import diseaseRules from '../data/disease_rules.js'
import type { Recommendation } from '../types/recommendation.js'

function normalizeKey(s: string) {
  return String(s || '')
    .trim()
    .toLowerCase()
}

export function getRecommendationFor(plant: string, disease: string): Recommendation | null {
  const p = normalizeKey(plant)
  const d = normalizeKey(disease)

  const plantRules = (diseaseRules as any)[p]
  if (!plantRules) return null

  const rule = plantRules[d]
  if (!rule) return null

  // ensure arrays and fields exist
  return {
    plant: p,
    disease: d,
    severity: rule.severity || 'low',
    prevention: Array.isArray(rule.prevention) ? rule.prevention : [],
    treatment: Array.isArray(rule.treatment) ? rule.treatment : [],
    monitoring: Array.isArray(rule.monitoring) ? rule.monitoring : [],
    references: Array.isArray(rule.references) ? rule.references : [],
  }
}

export default { getRecommendationFor }
