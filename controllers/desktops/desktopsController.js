import { desktopModel } from '../../models/desktopModel.js'
import { validateDesktop, validatePartialDesktop } from '../../validation/desktopsZodSchema.js'

export class DesktopController {
  constructor ({ user }) {
    this.user = user
  }

  getAllDesktops = async (req, res) => {
    const user = req.user?.name ?? this.user
    const data = await desktopModel.getAllDesktops({ user })
    if (!data.error) {
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send({ status: 'fail', error: data.error })
    }
  }

  editDesktop = async (req, res) => {
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

  createDesktop = async (req, res) => {
    const user = req.user?.name ?? this.user
    const { name, displayName, orden } = req.body
    const validatedDesk = validateDesktop({ name, displayName, orden, user })
    if (validatedDesk.success === false) {
      const errorsMessageArray = validatedDesk.error?.errors.map((error) => {
        return error.message
      })
      return res.status(400).json({ status: 'fail', message: errorsMessageArray })
    }
    const data = await desktopModel.createDesktop({ user, name, displayName, orden })
    if (!data.error) {
      return res.status(201).json({ status: 'success', data })
    } else {
      return res.status(500).json({ status: 'fail', data })
    }
  }

  deleteDesktop = async (req, res) => {
    const user = req.user?.name ?? this.user
    const name = req.body.name
    const data = await desktopModel.deleteDesktop({ user, name })
    if (data) {
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send('Error')
    }
  }

  setDesktopsOrder = async (req, res) => {
    const user = req.user.name
    const elementos = req.body.names
    const data = await desktopModel.setDesktopsOrder({ user, elementos })
    if (data) {
      return res.status(200).json({ status: 'success', data })
    } else {
      return res.status(500).send('Error')
    }
  }

  fixProperties = async (req, res) => {
    const newUser = req.body.newUser
    const user = req.body.user
    const data = await desktopModel.fixProperties({ user, newUser })
    res.send(data)
  }

  testDummyData = async (req, res) => {
    // const newUser = req.body.newUser
    const user = req.body.user
    const data = await desktopModel.createDummyContent({ user })
    res.send(data)
  }
}
