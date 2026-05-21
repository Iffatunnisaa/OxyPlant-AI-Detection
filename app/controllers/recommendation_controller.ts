import type { HttpContext } from '@adonisjs/core/http'
import RecommendationService from '#services/recommendation_service'
import type { RecommendationResponse } from '../types/recommendation.js'

export default class RecommendationController {
  async index({ request, response }: HttpContext) {
    const plant = String(request.input('plant') || '').trim()
    const disease = String(request.input('disease') || '').trim()
    const confidenceRaw = request.input('confidence')

    if (!plant || !disease) {
      return response.badRequest({ message: 'plant and disease are required' })
    }

    const rec = RecommendationService.getRecommendationFor(plant, disease)

    const prediction = { plant, disease, confidence: confidenceRaw ? Number(confidenceRaw) : undefined }

    if (!rec) {
      // Return a neutral empty recommendation payload (200) so clients can handle gracefully
      const emptyPayload: RecommendationResponse = {
        prediction,
        severity: 'low',
        recommendation: {
          prevention: [],
          treatment: [],
          monitoring: [],
        },
        references: [],
      }
      return response.ok(emptyPayload)
    }

    const payload: RecommendationResponse = {
      prediction,
      severity: rec.severity,
      recommendation: {
        prevention: rec.prevention,
        treatment: rec.treatment,
        monitoring: rec.monitoring,
      },
      references: rec.references,
    }

    return response.ok(payload)
  }
}
