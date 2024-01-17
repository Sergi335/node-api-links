// import mongoose from 'mongoose'
import usuarios from './schemas/userSchema.js'
export class userModel {
  static async createUser ({ user }) {
    // Buscar email en la base de datos y si existe devolver error
    const isNewUser = await usuarios.findOne({ email: user.email })
    if (isNewUser) return { error: 'El usuario ya existe' }
    const data = await usuarios.create(user)
    return data
  }

  static async getUser ({ email }) {
    const data = await usuarios.findOne({ email })
    if (data) {
      return data
    } else {
      return { error: 'El usuario no existe' }
    }
  }

  static async editUser ({ email, user }) {
    const data = await usuarios.findOneAndUpdate({ email }, user, { new: true })
    return data // la data puede ser un error
  }

  static async deleteUser ({ email }) {
    const data = await usuarios.deleteOne({ email })
    return data // la data puede ser un error
  }

  static async updateProfileImage (url, user) {
    const imagePath = url
    const update = await usuarios.findOneAndUpdate(
      { email: user },
      { profileImage: imagePath },
      { new: true }
    )
    if (update._id) {
      console.log('🚀 ~ file: userModel.js:39 ~ userModel ~ updateProfileImage ~ update:', update)
      // Usuario encontrado y actualizado correctamente
      console.log('Usuario encontrado y actualizado:', user)
      return { message: 'Usuario encontrado y actualizado' }
    } else {
    // No se encontró el usuario
      console.log('Usuario no encontrado')
      return { error: 'Usuario no encontrado' }
    // Maneja el caso de usuario no encontrado de alguna manera apropiada
    }
  }
}
