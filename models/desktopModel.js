import escritorio from '../models/schemas/desktopSchema.js'
import columna from '../models/schemas/columnSchema.js'
import link from '../models/schemas/linkSchema.js'
import { userModel } from './userModel.js'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const dummyData = require('../utils/dummyData.json')

export class desktopModel {
  static async getAllDesktops ({ user }) {
    const data = await escritorio.find({ user }).sort({ orden: 1 })
    if (data) {
      return data
    } else {
      return { error: 'Error al leer la base de datos' } // puede no tener escritorios no pasa nada
    }
  }

  static async editDesktop ({ user, name, newName, oldName, hidden }) {
    const seek = await escritorio.find({ name, user })
    const err = { error: 'El escritorio ya existe' }
    if (seek.length > 0 && hidden === undefined) { // si se cumple es un cambio de nombre
      return err
    } else {
      try {
        const filtroInicial = hidden === undefined ? { name: oldName, user } : { name, user }
        await escritorio.findOneAndUpdate(
          filtroInicial, // El filtro para buscar el documento
          { $set: { name, displayName: newName, hidden } }, // La propiedad a actualizar
          { new: true } // Opciones adicionales (en este caso, devuelve el documento actualizado)
        )
        // Actualizamos las columnas
        const filtro = { escritorio: oldName, user } // Filtrar documentos
        console.log(filtro)
        const actualizacion = { $set: { escritorio: name } } // Actualizar
        console.log(actualizacion)

        await columna.updateMany(filtro, actualizacion)

        // Actualizamos los Links
        const filtroL = { escritorio: oldName, user } // Filtrar documentos
        const actualizacionL = { $set: { escritorio: name } } // Actualizar

        await link.updateMany(filtroL, actualizacionL)

        const list = await escritorio.find({ user }).sort({ orden: 1 })
        return list
      } catch (error) {
        console.log(error) // Manejo de errores
        return { error }
      }
    }
  }

  static async createDesktop ({ user, name, displayName, orden }) {
    const seek = await escritorio.find({ name, user })
    const err = { error: 'El escritorio ya existe' }
    if (seek.length > 0) {
      return err
    } else {
      await escritorio.create({ user, name, displayName, orden })
      // const lista = await escritorio.find({ user, hidden: false || undefined }).sort({ orden: 1 })
      const lista = await escritorio.find({ user }).sort({ orden: 1 })
      return lista
    }
  }

  static async deleteDesktop ({ user, name }) { // ordenar los escritorios
    const linksinDesk = await link.deleteMany({ escritorio: name, user })
    const panelsinDesk = await columna.deleteMany({ escritorio: name, user })
    const data = await escritorio.deleteOne({ name, user })
    // const lista = await escritorio.find({ user, hidden: false }).sort({ orden: 1 })
    const lista = await escritorio.find({ user }).sort({ orden: 1 })
    console.log(data)
    console.log(linksinDesk)
    console.log(panelsinDesk)
    return lista
  }

  static async setDesktopsOrder ({ user, elementos }) {
    try {
      // Creamos un mapa para almacenar el orden actual de los elementos
      const ordenActual = new Map()
      let orden = 0
      elementos.forEach((elemento) => {
        ordenActual.set(elemento, orden)
        orden++
      })
      console.log('🚀 ~ file: escritorios.js:196 ~ ordenaDesks ~ ordenActual:', ordenActual)

      // Actualizamos el campo "orden" de cada elemento en la base de datos
      const updates = elementos.map(async (elemento) => {
        const orden = ordenActual.get(elemento)
        await escritorio.findOneAndUpdate(
          { displayName: elemento, user },
          { orden },
          { new: true }
        )
      })
      await Promise.all(updates)

      const data = await escritorio.find({ user }).sort({ orden: 1 })
      // Enviamos la respuesta
      // res.status(200).json({ message: 'Elementos actualizados correctamente' });
      return data
    } catch (error) {
      console.error(error)
      return error
    }
  }

  static async createDummyContent ({ user }) {
    console.log(dummyData.columnas)
    try {
      // Borrar los documentos existentes en las colecciones
      await escritorio.deleteMany({ user })
      await columna.deleteMany({ user })
      await link.deleteMany({ user })

      // Insertar los documentos de la copia de seguridad en las colecciones
      for (const desk of dummyData.escritorios) {
        const { _id, ...rest } = desk
        await escritorio.create({ ...rest, user })
      }
      for (const col of dummyData.columnas) {
        const { _id, ...rest } = col
        await columna.create({ ...rest, user })
      }
      const data = await columna.find({ user })
      for (const enlace of dummyData.links) {
        const column = data.find(col => col.name === enlace.panel)
        // console.log(id._id, enlace.name)
        if (column) {
          const { _id, ...rest } = enlace
          await link.create({ ...rest, idpanel: column._id.toString(), user })
          // console.log({ ...rest, idpanel: column._id.toString(), user })
        }
      }
      const mensaje = 'Copia de seguridad restaurada correctamente.'

      console.log('Copia de seguridad restaurada correctamente.')
      return ({ mensaje })
    } catch (error) {
      const mensaje = 'Error al restaurar la copia de seguridad'
      console.error('Error al restaurar la copia de seguridad:', error)
      return ({ mensaje })
    }
  }

  static async deleteUserData ({ user }) {
    try {
      // Borrar los documentos existentes en las colecciones
      await escritorio.deleteMany({ user })
      await columna.deleteMany({ user })
      await link.deleteMany({ user })
      await userModel.deleteUser({ email: user })
      const mensaje = 'Datos de usuario borrados correctamente.'
      console.log('Datos de usuario borrados correctamente.')
      return ({ mensaje })
    } catch (error) {
      const mensaje = 'Error al borrar los datos de usuario'
      console.error('Error al borrar los datos de usuario:', error)
      return ({ mensaje })
    }
  }

  static async fixProperties ({ user, newUser }) {
    try {
      const escritorios = await escritorio.find({ user })
      const escritoriosActualizados = escritorios.map(async (escritorio) => {
        const escritorioActualizado = await escritorio.updateOne({ user: newUser })
        return escritorioActualizado
      })
      await Promise.all(escritoriosActualizados)
      const columnas = await columna.find({ user })
      const columnasActualizadas = columnas.map(async (columna) => {
        const columnaActualizada = await columna.updateOne({ user: newUser })
        return columnaActualizada
      })
      await Promise.all(columnasActualizadas)
      const links = await link.find({ user })
      const linksActualizados = links.map(async (link) => {
        const linkActualizado = await link.updateOne({ user: newUser })
        return linkActualizado
      })
      await Promise.all(linksActualizados)
      return { message: 'Propiedades actualizadas correctamente' }
    } catch (error) {
      console.error(error)
      return error
    }
  }
}
