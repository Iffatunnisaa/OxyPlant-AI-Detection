import type { HttpContext } from '@adonisjs/core/http'
import Plant from '#models/plant'
import DetectionResult from '#models/detection_result'
import { cuid } from '@adonisjs/core/helpers'
import Application from '@adonisjs/core/services/app'
import env from '#start/env'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import fsp from 'fs/promises'

const allowedImageExtensions = new Set(['jpg', 'jpeg', 'png'])

function getNormalizedExtension(fileName?: string) {
  return fileName?.split('.').pop()?.toLowerCase() || ''
}

function formatJakartaDateTime(date?: Date | string | null) {
  if (!date) return null

  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export default class GardenManagersController {
  async index({ request, response, view }: HttpContext) {
    try {     
      if (!request['user'] || !request['user'].id) {
        return response.unauthorized({ message: 'Invalid user.' })
      }

      const plants = await Plant.find({ user_id: request['user'].id })

      const detections = await DetectionResult.find({
        user_id: request['user'].id,
        plant_id: { $exists: true, $ne: null },
      }).sort({ createdAt: -1 })

      const latestDetectionByPlant = new Map<string, any>()
      for (const detection of detections) {
        const plantId = detection.plant_id ? String(detection.plant_id) : null
        if (!plantId || latestDetectionByPlant.has(plantId)) {
          continue
        }
        latestDetectionByPlant.set(plantId, detection)
      }

      const isHealthyPrediction = (diseaseName?: string) => {
        if (!diseaseName) return false
        const label = diseaseName.toLowerCase()
        return (
          label.includes('healthy') ||
          label.includes('sehat') ||
          label.includes('normal') ||
          label.includes('tidak ada') ||
          label.includes('none')
        )
      }

      const plantCards = plants.map((plant) => {
        const latestDetection = latestDetectionByPlant.get(String(plant._id))
        const hasDetection = Boolean(latestDetection)

        let healthStatus: 'healthy' | 'warning' | 'diseased' = 'healthy'
        if (!hasDetection) {
          healthStatus = 'healthy'
        } else if (latestDetection?.status === 'failed') {
          healthStatus = 'warning'
        } else if (latestDetection?.disease_name && !isHealthyPrediction(latestDetection?.disease_name)) {
          healthStatus = 'diseased'
        } else {
          healthStatus = 'healthy'
        }

        const lastWateringLabel = formatJakartaDateTime(plant.last_watered_at) || 'Belum disiram'

        const confidenceValue = latestDetection?.confidence
          ? Math.max(
              0,
              Math.min(
                100,
                Math.round(
                  Number(latestDetection.confidence) <= 1
                    ? Number(latestDetection.confidence) * 100
                    : Number(latestDetection.confidence)
                )
              )
            )
          : null

        return {
          plant,
          healthStatus,
          latestDetection: latestDetection
            ? {
                diseaseName: latestDetection.disease_name || 'Tidak diketahui',
                confidence: confidenceValue,
                createdAt: latestDetection.createdAt,
                status: latestDetection.status,
              }
            : null,
          lastWateringLabel,
        }
      })

      const healthyPlants = plantCards.filter((card) => card.healthStatus === 'healthy').length
      const needAttention = plantCards.filter((card) => card.healthStatus !== 'healthy').length
      const lastDetectionActivity = detections.length
        ? detections.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
        : null

      const dashboardStats = {
        totalPlants: plants.length,
        healthyPlants,
        needAttention,
        lastDetectionActivity: lastDetectionActivity?.createdAt || null,
      }

      return view.render('pages/garden_manager/index', {
        plants,
        plantCards,
        dashboardStats,
      })
    } catch (err) {
      console.error('JWT Error:', err)
      return response.unauthorized({ message: 'Invalid or expired token.' })
    }
  }

  async add({ view }: HttpContext) {
    return view.render('pages/garden_manager/add')
  }

  async store({ request, response }: HttpContext) {
    const {
      name,
      type,
      plant_date,
      watering_schedule,
      notes,
    } = request.only(['name', 'type', 'plant_date', 'watering_schedule', 'notes'])

    const photo = request.file('photo_path', {
      size: '2mb',
    })

    if (!photo) {
      return response.badRequest({ message: 'Photo file is required.' })
    }

    const photoExtension = getNormalizedExtension(photo.clientName)
    if (!allowedImageExtensions.has(photoExtension)) {
      return response.badRequest({
        message: `Invalid file extension ${photo.extname?.toUpperCase() || ''}. Only jpg, jpeg, png are allowed`,
      })
    }

    const fileName = `${cuid()}.${photoExtension}`

    await photo.move(Application.publicPath('uploads'), {
      name: fileName,
      overwrite: true,
    })

    const file_path = `/uploads/${fileName}`

    try {
      if (!request['user'] || !request['user'].id) {
        return response.unauthorized({ message: 'Invalid user.' })
      }

      const plant = new Plant({
        user_id: request['user'].id,
        name,
        type,
        plant_date,
        watering_schedule,
        photo_path: file_path,
        notes,
      })

      await plant.save()

      return response.redirect().toRoute('garden_manager.index')
    } catch (err) {
      console.error('JWT Error:', err)
      return response.unauthorized({ message: 'Invalid or expired token.' })
    }
  }

  async action({ request, response }: HttpContext) {
    const { plant_id, action } = request.only(['plant_id', 'action'])

    try {
      if (!request['user'] || !request['user'].id) {
        return response.unauthorized({ message: 'Invalid user.' })
      }

      const plant = await Plant.findById(plant_id)

      if (!plant) {
        return response.notFound({ message: 'Plant not found.' })
      }

      if (String(plant.user_id) !== String(request['user'].id)) {
        return response.forbidden({ message: 'You cannot update this plant.' })
      }

      if (action === 'water') {
        plant.set('last_watered_at', new Date())
      } else if (action === 'treat') {
        plant.set('last_treated_at', new Date())
      } else if (action === 'harvest') {
        plant.set('harvested_at', new Date())
      } else {
        return response.badRequest({ message: 'Invalid garden action.' })
      }

      await plant.save()

      return response.redirect().toRoute('garden_manager.index')
    } catch (err) {
      console.error('Error updating garden action:', err)
      return response.internalServerError({ message: 'Failed to update garden action.' })
    }
  }

  async community({ request, response }: HttpContext) {
    const { plant_id, status } = request.only(['plant_id', 'status'])

    try {
      if (!request['user'] || !request['user'].id) {
        return response.unauthorized({ message: 'Invalid user.' })
      }

      const plant = await Plant.findById(plant_id)

      if (!plant) {
        return response.notFound({ message: 'Plant not found.' })
      }

      if (status === 'tumbuh') {
        plant.set('last_watered_at', new Date())
        await plant.save()
      }

      return response.redirect().toRoute('garden_manager.index')
    } catch (err) {
      console.error('Error updating garden action:', err)
      return response.internalServerError({ message: 'Failed to update garden action.' })
    }
  }

  async growth({ view }: HttpContext) {
    return view.render('pages/garden_manager/growth')
  }

  async harvest({ view }: HttpContext) {
    return view.render('pages/garden_manager/harvest')
  }

  async pest({ view }: HttpContext) {
    return view.render('pages/garden_manager/pest')
  }

  async detect({ request, response }: HttpContext) {
    const image = request.file('image', {
      size: '5mb',
    })

    if (!request['user'] || !request['user'].id) {
      return response.unauthorized({ message: 'Invalid user.' })
    }

    if (!image) {
      return response.badRequest({ message: 'Image file is required.' })
    }

    const imageExtension = getNormalizedExtension(image.clientName)
    if (!allowedImageExtensions.has(imageExtension)) {
      return response.badRequest({
        message: `Invalid file extension ${image.extname?.toUpperCase() || ''}. Only jpg, jpeg, png are allowed`,
      })
    }

    if (!image.isValid) {
      return response.badRequest({ message: image.errors.map((error) => error.message).join(', ') })
    }

    const fileName = `${cuid()}.${imageExtension}`
    const uploadDir = Application.publicPath('uploads')
    await fsp.mkdir(uploadDir, { recursive: true })

    await image.move(uploadDir, {
      name: fileName,
      overwrite: true,
    })

    if (!image.filePath) {
      return response.internalServerError({ message: 'Failed to persist uploaded image.' })
    }

    const aiBaseUrl = (env.get('FASTAPI_AI_URL') || 'http://127.0.0.1:8000').replace(/\/$/, '')
    const aiEndpoint = `${aiBaseUrl}/predict-image/`
    const startedAt = Date.now()

    let detectionStatus: 'success' | 'failed' = 'failed'
    let predictionPayload: any = null
    let aiErrorMessage: string | undefined

    try {

      const formData = new FormData()
      formData.append('file', fs.createReadStream(image.filePath))

      let parsedResponse: any = null
      
      try {
        const aiResponse = await axios.post(aiEndpoint, formData, {
        headers: formData.getHeaders(),
      })
        parsedResponse = aiResponse.data
        predictionPayload = parsedResponse
        
        // Validation: Check if prediction is valid and confident
        if (parsedResponse.is_confident && parsedResponse.valid) {
          detectionStatus = 'success'
        } else if (parsedResponse.is_confident) {
          // Valid confidence but invalid plant-disease combination
          detectionStatus = 'success'
          aiErrorMessage = `Prediction confidence is good but "${parsedResponse.disease}" is not typical for ${parsedResponse.plant}. Check alternatives below.`
        } else if (parsedResponse.valid) {
          // Valid combination but low confidence
          detectionStatus = 'success'
          aiErrorMessage = `Prediction has low confidence (${(parsedResponse.confidence * 100).toFixed(1)}%). Consider retaking the photo.`
        } else {
          // Both low confidence and invalid combination
          detectionStatus = 'success'
          aiErrorMessage = `Low confidence and invalid plant-disease combination. Review alternatives below.`
        }
      } catch (error: any) {
        aiErrorMessage = error?.response?.data?.detail || error.message
        parsedResponse = error?.response?.data || null
        predictionPayload = parsedResponse
      }
    } catch (error: any) {
      aiErrorMessage = error?.message || 'Unable to reach AI service'
    }

    const latencyMs = Date.now() - startedAt

    const detectionResult = new DetectionResult({
      user_id: request['user'].id,
      plant_id: request.input('plant_id') || undefined,
      source_image: {
        filename: fileName,
        mime: image.type ? `${image.type}/${image.subtype}` : undefined,
        size: image.size,
      },
      ai_provider: 'fastapi',
      ai_endpoint: aiEndpoint,
      status: detectionStatus,
      plant_name: predictionPayload?.plant,
      disease_name: predictionPayload?.disease || predictionPayload?.disease_name,
      confidence: predictionPayload?.confidence,
      raw_prediction: predictionPayload,
      latency_ms: latencyMs,
      error_message: aiErrorMessage,
    })

    await detectionResult.save()

    if (detectionStatus === 'failed') {
      return response.badGateway({
        message: aiErrorMessage || 'AI detection failed',
        detection_id: detectionResult._id,
        source_image: `/uploads/${fileName}`,
        raw_prediction: predictionPayload,
      })
    }

    return response.ok({
      message: 'Detection success',
      detection_id: detectionResult._id,
      source_image: `/uploads/${fileName}`,
      warning: aiErrorMessage || undefined,
      ...predictionPayload,
    })
  }
}
