import columna from './schemas/columnSchema.js'
import link from './schemas/linkSchema.js'
import mongoose from 'mongoose'

export class columnModel {
  static async getAllColumns ({ user }) {
    const data = await columna.find({ user }).sort({ order: 1 })
    return data
  }

  static async getColumnByDesktop ({ user, escritorio }) {
    console.log(user, escritorio)
    const data = await columna.find({ user, escritorio }).sort({ order: 1 })
    // console.log(data)
    if (data) {
      return data
    } else {
      return { error: 'La columna no existe' }
    }
  }

  static async getColumnCount ({ user }) {
    const data = await columna.find({ user }).countDocuments()
    if (data.length > 0) {
      return data
    } else {
      return { error: 'No se encuentran columnas para este usuario' }
    }
  }

  static async createColumn ({ user, cleanData }) {
    const data = await columna.create({ user, ...cleanData })
    return [data]
  }

  static async updateColumn ({ user, id, cleanData, elements }) {
    console.log(id, cleanData)
    // if name - if escritorio -> if order
    // Si el campo elementos está presente es una ordenación
    if (elements !== undefined) {
      const res = await this.setColumnsOrder({ user, elementos: elements, escritorio: cleanData.escritorio })
      // Es una ordenación terminamos aqui
      return res
    }
    // Si se ha movido a otro escritorio el campo escritorio está presente
    // tomamos el campo orden midiendo la longitud del array de columnas del escritorio destino
    if (cleanData.escritorio !== undefined) {
      const order = await columna.find({ escritorio: cleanData.escritorio, user })
      cleanData.order = order.length
    }
    const session = await mongoose.startSession()
    try {
      session.startTransaction()
      // Actualizamos la columna
      const data = await columna.findOneAndUpdate({ _id: id, user }, { $set: { ...cleanData } }, { new: true }).session(session)
      // Actualizamos los Links
      const filtro = { idpanel: id, user } // Filtrar documentos
      // Si se ha cambiado el nombre de la columna actualizamos el nombre del panel
      // Si se ha cambiado el escritorio actualizamos el escritorio de los links
      // No se pueden cambiar los dos a la vez
      const actualizacion = cleanData.name ? { $set: { panel: cleanData.name } } : { $set: { escritorio: cleanData.escritorio } } // Actualizar

      await link.updateMany(filtro, actualizacion).session(session) // esto puede fallar si no hay links?
      await session.commitTransaction()
      session.endSession()
      if (data) {
        return data
      } else {
        return { error: 'La columna no existe' }
      }
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      return ({ error: error.message })
    }
  }

  static async deleteColumn ({ user, id }) {
    const session = await mongoose.startSession()

    try {
      session.startTransaction()
      // Buscamos la columna que nos pasan por el body
      const column = await columna.findOne({ _id: id, user }).session(session)
      // Borramos los links asociados a la columna
      await link.deleteMany({ idpanel: id, user }).session(session)
      // Borramos la columna
      await columna.deleteOne({ _id: id, user }).session(session)
      await session.commitTransaction()
      session.endSession()

      console.log(column.escritorio)

      // find by user y escritorio y pasar a ordenar
      const columnsLeft = await columna.find({ escritorio: column.escritorio, user }).sort({ order: 1 })
      const columsLeftIds = columnsLeft.map(col => (
        col._id
      ))
      this.setColumnsOrder({ user, elementos: columsLeftIds, escritorio: column.escritorio })
      return column
    } catch (error) {
      await session.abortTransaction()
      session.endSession()
      return ({ error: error.message })
    }
  }

  static async setColumnsOrder ({ user, elementos, escritorio }) {
    try {
      if (!escritorio) {
        return { message: 'Falta el parámetro "escritorio"' }
      }

      // Creamos un mapa para almacenar el orden actual de los elementos
      const ordenActual = new Map()
      let orden = 0
      elementos.forEach((elemento) => {
        ordenActual.set(elemento, orden)
        orden++
      })

      // Actualizamos el campo "orden" de cada elemento en la base de datos
      const updates = elementos.map(async (elemento) => {
        const orden = ordenActual.get(elemento)
        console.log(elemento)
        try {
          const updatedElement = await columna.findOneAndUpdate(
            { _id: elemento, user, escritorio },
            { order: orden },
            { new: true }
          )

          if (!updatedElement) {
            console.warn(`No se encontró el elemento con _id=${elemento} y escritorio=${escritorio}`)
          }
        } catch (error) {
          console.error(`Error al actualizar el elemento con _id=${elemento} y escritorio=${escritorio}: ${error}`)
        }
      })
      await Promise.all(updates)

      // Enviamos la respuesta
      return { message: 'Elementos actualizados correctamente' } // no estas enviando si se actualizo o no
    } catch (error) {
      console.error(error)
      return { message: 'Error al actualizar los elementos' }
    }
  }

  // No se usa
  static async moveColumn ({ user, id, deskDestino, order }) {
    const data = await columna.find({ escritorio: deskDestino, user })

    await columna.findOneAndUpdate(
      { _id: id }, // El filtro para buscar el documento
      { $set: { escritorio: deskDestino, order } }, // Las propiedades a actualizar
      { new: true } // Opciones adicionales (en este caso, devuelve el documento actualizado)
    )
    // Actualizamos los Links
    const filtroL = { user, idpanel: id } // Filtrar documentos
    const actualizacionL = { $set: { escritorio: deskDestino } } // Actualizar

    await link.updateMany(filtroL, actualizacionL)

    const response = {}
    response.length = data.length
    response.message = 'Movido correctamente'

    return ({ response })
  }
}
