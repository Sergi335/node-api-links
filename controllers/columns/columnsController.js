import { columnModel } from '../../models/columnModel.js'
import { validateColumn, validatePartialColumn } from '../../validation/columnsZodSchema.js'

export class columnsController {
  static async getAllColumns (req, res) {
    const user = req.user.name
    try {
      const data = await columnModel.getAllColumns({ user })
      return res.status(200).json({ status: 'success', data })
    } catch (error) {
      return res.status(500).send({ status: 'fail', error })
    }
  }

  // No se usa
  static async getColumnByDesktop (req, res) {
    const user = req.user.name
    console.log('🚀 ~ file: columnsController.js:17 ~ columnsController ~ getColumnByDesktop ~ user:', user)
    console.log(req.params.desktop)
    try {
      const data = await columnModel.getColumnByDesktop({ user, escritorio: req.params.desktop })
      return res.status(200).json({ status: 'success', data })
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  // No se usa
  static async getColumnCount (req, res) {
    const user = req.user.name
    try {
      const columnsCount = await columnModel.getColumnCount({ user })
      return res.status(200).json(columnsCount)
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async createColumn (req, res) {
    const user = req.user.name
    // const { nombre, escritorio, orden } = req.body
    // comprobar que hay suficientes datos al menos el usuario
    req.body.user = user
    const validatedCol = validateColumn(req.body)
    // console.log(validatedCol.error.errors.path)
    // Crear mensaje de error
    if (validatedCol.success === false) {
      const errorsMessageArray = validatedCol.error?.errors.map((error) => {
        return error.message
      })
      return res.status(400).json({ status: 'fail', message: errorsMessageArray })
    }
    const cleanData = validatedCol.data
    try {
      const column = await columnModel.createColumn({ user, cleanData })
      return res.status(201).json({ status: 'success', column })
    } catch (error) {
      return res.status(500).send({ status: 'fail', error })
    }
  }

  static async updateColumn (req, res) {
    // El id no se valida, los columnsids tampoco
    const user = req.user.name
    const { fields, id } = req.body
    let elements
    if (req.body.columnsIds) {
      elements = req.body.columnsIds
    }
    const validatedCol = validatePartialColumn(fields)

    // Crear mensaje de error
    if (validatedCol.success === false) {
      const errorsMessageArray = validatedCol.error?.errors.map((error) => {
        return error.message
      })
      return res.status(400).json({ status: 'fail', message: errorsMessageArray })
    }
    const cleanData = validatedCol.data

    try {
      const column = await columnModel.updateColumn({ user, id, cleanData, elements })
      return res.status(201).json({ status: 'success', column }) // No siempre es success esto solo peta con errores gordos
    } catch (error) {
      return res.status(500).send({ status: 'fail', error })
    }
  }

  static async deleteColumn (req, res) {
    const user = req.user.name
    const id = req.body.id
    try {
      const column = await columnModel.deleteColumn({ id, user })
      res.status(200).json({ status: 'success', column })
    } catch (error) {
      res.status(500).send({ status: 'fail', error })
    }
  }
}
