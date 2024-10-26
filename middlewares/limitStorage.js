import { userModel } from '../models/userModel.js'

export default async function limitStorage (req, res, next) {
  // Test user quota
  if (!req.file) {
    next()
    return
  }
  const file = req.file
  const user = req.user.name
  if (user === process.env.ADMIN_EMAIL) {
    console.log('Es admin, no se limita el espacio de almacenamiento')
    next()
  } else {
    const { quota } = await userModel.getUser({ email: user })
    const uploadedImageSize = file.buffer?.length
    const newQuota = quota + uploadedImageSize
    console.log('🚀 ~ limitStorageMiddleware ~ uploadedImageSize:', uploadedImageSize)
    console.log('🚀 ~ limitStorageMiddleware ~ newQuota:', newQuota)
    if (newQuota > Number(process.env.MAX_USER_QUOTA)) {
      res.send({ error: 'No tienes espacio suficiente' })
      return
    }
    await userModel.editUser({ email: user, user: { quota: newQuota } })
    next()
  }
}
