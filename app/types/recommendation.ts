export interface Recommendation {
  plant: string
  disease: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  prevention: string[]
  treatment: string[]
  monitoring: string[]
  references: string[]
}

export interface RecommendationResponse {
  prediction: {
    plant: string
    disease: string
    confidence?: number
  }
  severity: Recommendation['severity']
  recommendation: {
    prevention: string[]
    treatment: string[]
    monitoring: string[]
  }
  references: string[]
}
