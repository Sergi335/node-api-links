import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll, getMetadata } from 'firebase/storage'
import { initializeApp } from 'firebase/app'
import { desktopModel } from '../../models/desktopModel.js'
import { columnModel } from '../../models/columnModel.js'
import { linkModel } from '../../models/linkModel.js'
import { userModel } from '../../models/userModel.js'
import escritorio from '../../models/schemas/desktopSchema.js'
import columna from '../../models/schemas/columnSchema.js'
import link from '../../models/schemas/linkSchema.js'

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_ID,
  appId: process.env.FB_APP_ID
}

const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

export class storageController {
  static async getBackgroundsMiniatures (req, res) {
    // const user = req.user.name
    try {
      const fileRef = ref(storage, 'miniatures')
      const list = await listAll(fileRef)
      const { items } = list

      const backgroundsPromises = items.map(async (back) => ({
        url: await getDownloadURL(back),
        nombre: (await getMetadata(back)).name
      }))

      const backgrounds = await Promise.all(backgroundsPromises)
      res.send({ backgrounds })
    } catch (err) {
      console.error('Error al leer la carpeta:', err)
      res.send(err)
    }
  }

  // Validar?
  static async uploadImage (req, res) {
    const file = req.file
    const user = req.user.name
    const linkId = req.body.linkId
    // Si no hay imagen error
    if (!req.file) {
      res.send({ error: 'No hemos recibido imagen' })
      return
    }
    try {
      // El lugar donde quieres guardar el archivo
      const imagesRef = ref(storage, `${user}/images/linkImages`)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const extension = file.originalname.split('.').pop()
      // El lugar y el nombre donde se guardará el archivo
      const imageRef = ref(imagesRef, `${uniqueSuffix}.${extension}`)
      const snapshot = await uploadBytes(imageRef, file.buffer)
      const downloadURL = await getDownloadURL(snapshot.ref)
      try {
        const resultadoDb = await linkModel.setImagesInDb(downloadURL, user, linkId)
        res.send(resultadoDb)
      } catch (error) {
        res.send(error)
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error)
      res.status(500).send({ error: 'Error al subir el archivo' })
    }
  }

  static async deleteImage (req, res) {
    const user = req.user.name
    const linkId = req.body.id
    const imageUrl = req.body.image

    if (!imageUrl) {
      res.send({ error: 'No se encontró la imagen para eliminar' })
      return
    }
    try {
      // Construye la referencia a la imagen en Storage
      const imageRef = ref(storage, imageUrl)
      // Borra el archivo
      await deleteObject(imageRef)
      try {
        // Borrar la referencia de la imagen en base de datos
        await linkModel.deleteImageOnDb(imageUrl, user, linkId)
        res.send({ message: 'Imagen eliminada exitosamente' })
      } catch (error) {
        res.send(error)
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error)
      if (error.code === 'storage/invalid-url' || error.code === 'storage/object-not-found') {
        await linkModel.deleteImageOnDb(imageUrl, user, linkId)
      }
      res.status(500).send({ error: error.code })
    }
  }

  static async uploadIcon (req, res) {
    const file = req.file
    const user = req.user.name
    const linkId = req.body.linkId
    // Si no hay imagen ha elegido una de muestra
    if (!file) {
      try {
        const filePath = req.body.filePath
        const resultadoDb = await linkModel.setLinkImgInDb(filePath, user, linkId)
        res.send(resultadoDb)
      } catch (error) {
        res.send(error)
      }
      return
    }
    // Limitar tamaño en el cliente validar aqui
    try {
      const imagesRef = ref(storage, `${user}/images/icons`)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const extension = file.originalname.split('.').pop()
      const imageRef = ref(imagesRef, `${uniqueSuffix}.${extension}`)
      const snapshot = await uploadBytes(imageRef, file.buffer)
      const downloadURL = await getDownloadURL(snapshot.ref)
      try {
        await linkModel.setLinkImgInDb(downloadURL, user, linkId)
        res.send({ message: '¡Archivo o blob subido!', url: downloadURL })
      } catch (error) {
        res.send(error)
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error)
      res.status(500).send({ error: 'Error al subir el archivo' })
    }
  }

  static async deleteIcon (req, res) {
    const user = req.user.name
    if (user) {
      const imageUrl = req.body.image
      try {
        // Construye la referencia a la imagen en Storage
        const imageRef = ref(storage, imageUrl)
        // Borra el archivo
        await deleteObject(imageRef)
        res.send({ message: 'Imagen eliminada exitosamente' })
      } catch (error) {
        res.status(500).send({ error: error.code })
      }
    } else {
      res.status(401).send('Error usuario no proporcionado')
    }
  }

  static async getLinkIcons (req, res) {
    // const user = req.user.name
    try {
      const fileRef = ref(storage, 'SergioSR/images/icons')
      const list = await listAll(fileRef)
      const { items } = list

      const iconsPromises = items.map(async (back) => ({
        url: await getDownloadURL(back),
        nombre: (await getMetadata(back)).name
      }))

      const icons = await Promise.all(iconsPromises)
      res.send(icons)
    } catch (err) {
      console.error('Error al leer la carpeta:', err)
      res.send(err)
    }
  }

  static async getBackgroundUrl (req, res) {
    // const user = req.user.name
    const nombre = req.query.nombre
    try {
      const fileRef = ref(storage, `/backgrounds/${nombre}`)
      const downloadUrl = await getDownloadURL(fileRef)
      console.log('Me han llamado')
      res.send(downloadUrl)
    } catch (error) {
      res.send(error)
    }
  }

  static async getUserBackup (req, res) {
    const user = req.user.name
    const fileName = `${user}dataBackup.json`
    const fileRef = ref(storage, `${user}/backups/${fileName}`)
    const downloadUrl = await getDownloadURL(fileRef)
    console.log(downloadUrl)

    res.send({ downloadUrl })
  }

  static async createUserBackup (req, res) {
    const user = req.user.name
    try {
    // Obtener la ruta completa del directorio de backups
      const fileName = `${user}dataBackup.json`
      const fileRef = ref(storage, `${user}/backups/${fileName}`)

      const data1 = await desktopModel.getAllDesktops({ user })
      const data2 = await columnModel.getAllColumns({ user })
      const data3 = await linkModel.getAllLinks({ user })

      const backupData = {
        escritorios: data1,
        columnas: data2,
        links: data3
      }
      const jsonString = JSON.stringify(backupData)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const stream = await blob.arrayBuffer()
      const snapshot = await uploadBytes(fileRef, stream)

      const downloadUrl = await getDownloadURL(snapshot.ref)
      console.log('🚀 ~ file: storage.js:177 ~ backup ~ downloadUrl:', downloadUrl)
      // Almacenar url en base de datos -> lastUserBackup
      try {
        const resultadoDb = await userModel.editUser({ email: user, user: { lastBackupUrl: downloadUrl } })
        res.send({ status: 'success', resultadoDb })
      } catch (error) {
        res.send(error)
      }
    } catch (error) {
      const mensaje = 'Error al crear la copia de seguridad'
      console.error('Error al crear la copia de seguridad:', error)
      res.send({ mensaje })
    }
  }

  static async restoreUserBackup (req, res) {
    // read uploaded json file
    const user = req.user.name
    const file = req.file
    if (!file) {
      res.send({ error: 'No hemos recibido archivo' })
    }
    console.log(file)
    try {
      // req.file.buffer es un Buffer que contiene los datos del archivo subido
      const buffer = req.file.buffer
      // Convertir el Buffer a una cadena
      const str = buffer.toString()
      // Parsear la cadena como JSON
      const data = JSON.parse(str)
      // Ahora puedes usar los datos JSON
      console.log(data)

      const { escritorios, columnas, links } = data

      // Borrar los documentos existentes en las colecciones
      await escritorio.deleteMany({ user })
      await columna.deleteMany({ user })
      await link.deleteMany({ user })

      // Insertar los documentos de la copia de seguridad en las colecciones
      for (const desk of escritorios) {
        const { _id, ...rest } = desk
        await escritorio.create({ ...rest, user })
      }
      for (const col of columnas) {
        const { _id, ...rest } = col
        await columna.create({ ...rest, user })
      }
      const data2 = await columnModel.getAllColumns({ user })
      // No funciona cuando hay columnas con el mismo nombre
      for (const enlace of links) {
        const column = data2.find(col => col.name === enlace.panel)
        // console.log(id._id, enlace.name)
        if (column) {
          const { _id, ...rest } = enlace
          await link.create({ ...rest, idpanel: column._id.toString(), user })
          // console.log({ ...rest, idpanel: column._id.toString(), user })
        }
      }
      const mensaje = 'Copia de seguridad restaurada correctamente.'

      console.log('Copia de seguridad restaurada correctamente.')
      res.send({ mensaje })
    } catch (error) {
      const mensaje = 'Error al restaurar la copia de seguridad'
      console.error('Error al restaurar la copia de seguridad:', error)
      res.send({ mensaje })
    }
  }

  static async uploadProfileImage (req, res) {
    if (!req.file) {
      res.status(400).send({ error: 'No se proporcionó ningún archivo' })
      return
    }

    const file = req.file
    const user = req.user.name

    try {
      const imagesRef = ref(storage, `${user}/images/profile`)
      const list = await listAll(imagesRef)
      const { items } = list
      if (items.length > 0) {
        items.forEach(async (item) => {
          await deleteObject(item)
        })
      }
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      const extension = file.originalname.split('.').pop()
      const imageRef = ref(imagesRef, `${uniqueSuffix}.${extension}`)
      const snapshot = await uploadBytes(imageRef, file.buffer)
      // si el usuario ya tiene una habrá que borrar la antigua
      const downloadURL = await getDownloadURL(snapshot.ref)
      try {
        await userModel.updateProfileImage(downloadURL, user)
        res.send({ message: '¡Archivo o blob subido!', url: downloadURL })
      } catch (error) {
        res.send(error)
      }
    } catch (error) {
      console.error('Error al subir el archivo:', error)
      res.status(500).send({ error: 'Error al subir el archivo' })
    }
  }
}
