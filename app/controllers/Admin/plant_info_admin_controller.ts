import { HttpContext } from '@adonisjs/core/http'
import PlantInfo from '../../models/plant_info.js'
import { cuid } from '@adonisjs/core/helpers'
import Application from '@adonisjs/core/services/app'

const allowedImageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp'])

function getNormalizedExtension(fileName?: string) {
  return fileName?.split('.').pop()?.toLowerCase() || ''
}

export default class PlantInfoAdminController {
  /**
   * Display all plant info records
   */
  async index({ view }: HttpContext) {
    try {
      const plants = await PlantInfo.find().sort({ createdAt: -1 })
      return view.render('admin/plant_info/index', { plants })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return view.render('admin/plant_info/index', { 
        plants: [],
        error: `Failed to load plants: ${errorMessage}`
      })
    }
  }

  /**
   * Show the form for creating a new plant info
   */
  async create({ view }: HttpContext) {
    return view.render('admin/plant_info/form', {
      plant: null,
      careItems: [],
      diseaseItems: [],
    })
  }

  /**
   * Store a newly created plant info in storage
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['name', 'shortName', 'category', 'description'])
      
      // Validate required fields
      if (!data.name?.trim() || !data.category?.trim() || !data.description?.trim()) {
        return response.status(400).json({ 
          success: false, 
          message: 'Name, category, and description are required' 
        })
      }

      // Parse care and diseases arrays from request
      const care = this.parseCareItems(request)
      const diseases = this.parseDiseaseItems(request)

      if (diseases.length === 0) {
        return response.status(400).json({ 
          success: false, 
          message: 'At least one disease must be added' 
        })
      }

      const imagePath = await this.persistImageUpload(request)

      const plant = new PlantInfo({
        name: data.name.trim(),
        shortName: data.shortName?.trim() || '',
        category: data.category.trim(),
        description: data.description.trim(),
        image: imagePath,
        care,
        diseases,
      })

      await plant.save()
      return response.json({ 
        success: true, 
        message: 'Plant info created successfully',
        id: plant._id
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const statusCode = this.isUploadValidationError(errorMessage) ? 400 : 500
      return response.status(statusCode).json({ 
        success: false, 
        message: 'Failed to create plant info',
        error: errorMessage
      })
    }
  }

  /**
   * Show the form for editing a plant info
   */
  async edit({ params, view, response }: HttpContext) {
    try {
      const plant = await PlantInfo.findById(params.id)
      if (!plant) {
        return response.status(404).json({ message: 'Plant info not found' })
      }
      return view.render('admin/plant_info/form', {
        plant,
        careItems: plant.care || [],
        diseaseItems: plant.diseases || [],
      })
    } catch (error) {
      return response.status(404).json({ message: 'Plant info not found' })
    }
  }

  /**
   * Update the specified plant info in storage
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const plant = await PlantInfo.findById(params.id)
      if (!plant) {
        return response.status(404).json({ 
          success: false, 
          message: 'Plant info not found' 
        })
      }

      const data = request.only(['name', 'shortName', 'category', 'description'])

      // Validate required fields
      if (!data.name?.trim() || !data.category?.trim() || !data.description?.trim()) {
        return response.status(400).json({ 
          success: false, 
          message: 'Name, category, and description are required' 
        })
      }

      // Parse care and diseases arrays
      const care = this.parseCareItems(request)
      const diseases = this.parseDiseaseItems(request)

      if (diseases.length === 0) {
        return response.status(400).json({ 
          success: false, 
          message: 'At least one disease must be added' 
        })
      }

      const imagePath = await this.persistImageUpload(request)

      // Update plant info
      plant.name = data.name.trim()
      plant.shortName = data.shortName?.trim() || ''
      plant.category = data.category.trim()
      plant.description = data.description.trim()
      if (imagePath) {
        plant.image = imagePath
      }
      plant.care = care as any
      plant.diseases = diseases as any

      await plant.save()
      return response.json({ 
        success: true, 
        message: 'Plant info updated successfully' 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      const statusCode = this.isUploadValidationError(errorMessage) ? 400 : 500
      return response.status(statusCode).json({ 
        success: false, 
        message: 'Failed to update plant info',
        error: errorMessage
      })
    }
  }

  /**
   * Remove the specified plant info from storage
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const plant = await PlantInfo.findByIdAndDelete(params.id)
      if (!plant) {
        return response.status(404).json({ 
          success: false, 
          message: 'Plant info not found' 
        })
      }
      return response.json({ 
        success: true, 
        message: 'Plant info deleted successfully' 
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      return response.status(500).json({ 
        success: false, 
        message: 'Failed to delete plant info',
        error: errorMessage
      })
    }
  }

  /**
   * Parse care items from request
   */
  private parseCareItems(request: any): Array<{ label: string; value: string }> {
    const labels = this.readArrayInput(request, 'care_label')
    const values = this.readArrayInput(request, 'care_value')
    const care: Array<{ label: string; value: string }> = []

    for (let i = 0; i < labels.length; i++) {
      if (labels[i]?.trim() && values[i]?.trim()) {
        care.push({
          label: labels[i].trim(),
          value: values[i].trim(),
        })
      }
    }

    return care
  }

  /**
   * Parse disease items from request
   */
  private parseDiseaseItems(request: any): Array<{ name: string; gejala: string }> {
    const names = this.readArrayInput(request, 'disease_name')
    const gejalaList = this.readArrayInput(request, 'disease_gejala')
    const diseases: Array<{ name: string; gejala: string }> = []

    for (let i = 0; i < names.length; i++) {
      if (names[i]?.trim() && gejalaList[i]?.trim()) {
        diseases.push({
          name: names[i].trim(),
          gejala: gejalaList[i].trim(),
        })
      }
    }

    return diseases
  }

  private readArrayInput(request: any, fieldName: string) {
    const value = request.input(`${fieldName}[]`) ?? request.input(fieldName) ?? []
    return Array.isArray(value) ? value : [value]
  }

  private async persistImageUpload(request: HttpContext['request']) {
    const image = request.file('image', {
      size: '2mb',
    })

    if (!image) {
      return ''
    }

    const imageExtension = getNormalizedExtension(image.clientName)
    if (!allowedImageExtensions.has(imageExtension)) {
      throw new Error('Invalid image file. Only JPG, JPEG, PNG, and WEBP are allowed.')
    }

    if (!image.isValid) {
      throw new Error(image.errors.map((error) => error.message).join(', '))
    }

    const fileName = `${cuid()}.${imageExtension}`
    await image.move(Application.publicPath('uploads'), {
      name: fileName,
      overwrite: true,
    })

    return `/uploads/${fileName}`
  }

  private isUploadValidationError(message: string) {
    return (
      message.includes('Invalid image file') ||
      message.toLowerCase().includes('file size') ||
      message.toLowerCase().includes('allowed')
    )
  }
}
