import { desktopModel } from '../../models/desktopModel.js'
import { validateDesktop, validatePartialDesktop } from '../../validation/desktopsZodSchema.js'

export class desktopController {
  static async getAllDesktops (req, res) {
    const user = req.user.name
    const data = await desktopModel.getAllDesktops({ user })
    if (!data.error) {
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send({ status: 'fail', error: data.error })
    }
  }

  static async editDesktop (req, res) {
    const user = req.user.name
    const name = req.body.name
    const newName = req.body.newName
    const oldName = req.body.oldName
    const hidden = req.body.hidden
    const validatedDesk = validatePartialDesktop({ name, displayName: newName, user, hidden })
    if (validatedDesk.success === false) {
      const errorsMessageArray = validatedDesk.error?.errors.map((error) => {
        return error.message
      })
      return res.status(400).json({ status: 'fail', message: errorsMessageArray })
    }
    const data = await desktopModel.editDesktop({ user, name, newName, oldName, hidden })
    if (!data.error) {
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send('Error')
    }
  }

  static async createDesktop (req, res) {
    const user = req.user.name
    const { name, displayName, orden } = req.body
    const validatedDesk = validateDesktop({ name, displayName, orden, user })
    if (validatedDesk.success === false) {
      const errorsMessageArray = validatedDesk.error?.errors.map((error) => {
        return error.message
      })
      return res.status(400).json({ status: 'fail', message: errorsMessageArray })
    }
    const data = await desktopModel.createDesktop({ user, name, displayName, orden })
    if (data) { // if no hay error
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send('Error')
    }
  }

  static async deleteDesktop (req, res) {
    const user = req.user.name
    const name = req.body.name
    const data = await desktopModel.deleteDesktop({ user, name })
    if (data) {
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send('Error')
    }
  }

  static async setDesktopsOrder (req, res) {
    const user = req.user.name
    const elementos = req.body.names
    const data = await desktopModel.setDesktopsOrder({ user, elementos })
    if (data) {
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send('Error')
    }
  }

  static async fixProperties (req, res) {
    const newUser = req.body.newUser
    const user = req.body.user
    const data = await desktopModel.fixProperties({ user, newUser })
    res.send(data)
  }

  static async testDummyData (req, res) {
    // const newUser = req.body.newUser
    const user = req.body.user
    const data = await desktopModel.createDummyContent({ user })
    res.send(data)
  }
}
