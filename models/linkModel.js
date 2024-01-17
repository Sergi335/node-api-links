import link from './schemas/linkSchema.js'
export class linkModel {
  // Quitar try catch lanzar errores con throw y gestionar errores en el controlador
  static async getAllLinks ({ user }) {
    const data = await link.find({ user }).sort({ orden: 1 })
    return data
  }

  static async getLinkById ({ user, id }) {
    const data = await link.findOne({ user, _id: id })
    if (data) {
      return data
    } else {
      return { error: 'El link no existe' }
    }
  }

  static async getLinksByDesktop ({ user, escritorio }) {
    const data = await link.find({ user, escritorio })
    if (data) {
      return data
    } else {
      return { error: 'El link no existe' }
    }
  }

  static async getLinksCount ({ user, column }) {
    let data
    if (column) data = await link.countDocuments({ user, idpanel: column })
    else data = await link.countDocuments({ user })
    return data
  }

  static async createLink ({ cleanData }) {
    console.log(cleanData)
    // gestionar errores aqui --- ver node midu
    const data = await link.create({ ...cleanData })
    return data
  }

  static async updateLink ({ id, idpanelOrigen, cleanData, destinyIds }) {
    console.log('🚀 ~ file: linkModel.js:41 ~ linkModel ~ updateLink ~ cleanData:', cleanData)
    console.log('🚀 ~ file: linkModel.js:41 ~ linkModel ~ updateLink ~ destinyIds:', destinyIds)
    const data = await link.findOneAndUpdate({ _id: id, user: cleanData.user }, { $set: { ...cleanData } }, { new: true })
    if (idpanelOrigen !== undefined) {
      await linkModel.sortLinks({ idpanelOrigen })
    }
    if (idpanelOrigen !== undefined && destinyIds !== undefined) {
      await linkModel.sortLinks({ idpanelOrigen: cleanData.idpanel, elementos: destinyIds })
    }
    return data // la data puede ser un error
  }

  static async bulkMoveLinks ({ user, source, destiny, panel, links, escritorio }) {
    const data = await link.updateMany({ _id: { $in: links }, user }, { $set: { idpanel: destiny, panel, escritorio } })
    // if (data) {
    //   await linkModel.sortLinks({ idpanelOrigen })
    // }
    return data // la data puede ser un error
  }

  static async deleteLink ({ user, linkId }) {
    if (Array.isArray(linkId)) {
      const data = await link.deleteMany({ _id: { $in: linkId }, user })
      // if (data) {
      //   await linkModel.sortLinks({ idpanelOrigen: data[0].idpanel }) -> Ordenar links que quedan en el panel
      // }
      return data // la data puede ser un error
    } else {
      const data = await link.findOneAndDelete({ _id: linkId, user })
      if (data) {
        await linkModel.sortLinks({ idpanelOrigen: data.idpanel })
      }
      return data // la data puede ser un error
    }
  }

  static async findDuplicateLinks ({ user }) {
    try {
      const duplicados = await link.aggregate([
        { $match: { user } }, // Filtrar por el usuario específico
        { $group: { _id: '$URL', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } }
      ])
      const search = await Promise.all(
        duplicados.map(async (item) => {
          try {
            const objeto = await link.find({ URL: item._id, user })
            return objeto
          } catch (error) {
            console.error('Error en la búsqueda:', error)
          }
        })
      )
      const flattenedData = search.flatMap(group => group)
      return flattenedData
    } catch (error) {
      console.error('Error en la consulta:', error)
      return ({ error })
    }
  }

  static async setImagesInDb (url, user, linkId) {
    if (url) {
      const data = await link.findOneAndUpdate(
        { _id: linkId, user },
        { $push: { images: url } },
        { new: true }
      )
      return data
    } else {
      return { error: 'No hay url' }
    }
  }

  static async deleteImageOnDb (url, user, linkId) {
    try {
      const updatedArticle = await link.findOneAndUpdate(
        { _id: linkId, user },
        { $pull: { images: { $in: [url] } } },
        { new: true }
      )

      if (updatedArticle) {
        console.log('Artículo actualizado:', updatedArticle)

        return updatedArticle
      } else {
        console.log('No se encontró ningún artículo que cumpla los criterios de búsqueda.')
        return { error: 'No encontrado' }
      }
    } catch (error) {
      console.error('Error al actualizar el artículo:', error)
      return { error: 'Error al borrar' }
    }
  }

  static async setLinkImgInDb (url, user, linkId) {
    const urlObj = new URL(url)
    const dominio = 'firebasestorage.googleapis.com'
    const dominio2 = 't1.gstatic.com'

    const imagePath = (urlObj.hostname === dominio || urlObj.hostname === dominio2) ? url : urlObj.pathname

    try {
      await link.findOneAndUpdate({ _id: linkId, user }, { $set: { imgURL: imagePath } })
      return { message: 'imagen de link cambiada' }
    } catch (error) {
      return ({ error })
    }
  }

  static async searchLinks ({ user, query }) {
    const data = await link.find({
      $or: [
        { name: query, user },
        { URL: query, user },
        { notes: query, user }
      ]
    })
    return data
  }

  // Elementos son los ids de los elementos hacia o desde el panel al que se mueve el link
  static async sortLinks ({ idpanelOrigen, elementos }) {
    let dataToSort
    if (elementos === undefined) {
      const links = await link.find({ idpanel: idpanelOrigen }).sort({ orden: 1 }).select('_id')
      const stringIds = links.map(link => link._id.toString())
      dataToSort = stringIds
    } else {
      dataToSort = elementos
    }
    try {
      // Creamos un mapa para almacenar el orden actual de los elementos
      const ordenActual = new Map()
      let orden = 0
      dataToSort.forEach((elemento) => {
        ordenActual.set(elemento, orden)
        orden++
      })
      console.log(ordenActual)
      // Actualizamos el campo "orden" de cada elemento en la base de datos
      const updates = dataToSort.map(async (elemento) => {
        const orden = ordenActual.get(elemento)
        await link.findOneAndUpdate(
          { _id: elemento, idpanel: idpanelOrigen },
          { orden },
          { new: true }
        )
      })
      await Promise.all(updates)
      return { message: 'success' }
    } catch (error) {
      return { error }
    }
  }
}
