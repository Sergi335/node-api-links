import { linkModel } from '../../models/linkModel.js'
import { getLinkNameByUrlLocal, getLinkStatusLocal } from '../../utils/linksUtils.js'
import { validateLink, validatePartialLink } from '../../validation/linksZodSchema.js'

export class linksController {
  static async getAllLinks (req, res) {
    try {
      const user = req.user?.name ?? 'SergioSR'
      const links = await linkModel.getAllLinks({ user })
      return res.status(200).json({ status: 'success', links })
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async getLinkById (req, res) {
    const user = req.user.name
    console.log(req.params)
    console.log('Entramos en by id')
    try {
      const link = await linkModel.getLinkById({ user, id: req.params.id })
      return res.status(200).json(link)
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async getLinksByDesktop (req, res) {
    console.log(req.user)
    const user = req.user.name
    console.log('Entramos en by desktop')
    console.log(req.query)
    try {
      const links = await linkModel.getLinksByDesktop({ user, escritorio: req.query.desk })
      return res.status(200).json({ status: 'success', links })
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async getLinksCount (req, res) {
    const user = req.user.name
    try {
      const linksCount = await linkModel.getLinksCount({ user, column: req.query.column })
      return res.status(200).json(linksCount)
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async createLink (req, res) {
    const user = req.user.name
    const [item] = req.body.data // Esto peta si no es iterable
    item.user = user
    const validatedLink = validateLink(item)
    console.log(validatedLink)
    // Crear mensaje de error
    if (validatedLink.success === false) {
      const errorsMessageArray = validatedLink.error?.errors.map((error) => {
        return error.message
      })
      return res.status(400).json({ status: 'fail', message: errorsMessageArray })
    }
    const cleanData = validatedLink.data
    try {
      const link = await linkModel.createLink({ cleanData })
      return res.status(201).json({ status: 'success', link })
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async updateLink (req, res) {
    const user = req.user.name
    console.log(req.body)
    const item = req.body.fields
    const { idpanelOrigen, destinyIds } = req.body
    console.log('🚀 ~ file: linksController.js:77 ~ linksController ~ updateLink ~ idpanelOrigen:', idpanelOrigen)
    item.user = user
    console.log(req.body.idpanelOrigen)
    const validatedLink = validatePartialLink(item)
    console.log(validatedLink)
    const id = req.body.id
    if (validatedLink.success === false) {
      const errorsMessageArray = validatedLink.error?.errors.map((error) => {
        return error.message
      })
      return res.status(400).json({ status: 'fail', message: errorsMessageArray })
    }
    const cleanData = validatedLink.data
    try {
      const link = await linkModel.updateLink({ id, idpanelOrigen, cleanData, destinyIds })
      return res.status(200).json({ status: 'success', link })
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async deleteLink (req, res) {
    console.log(req.body.linkId)
    try {
      const user = req.user.name
      const { linkId } = req.body
      const link = await linkModel.deleteLink({ user, linkId })
      if (link) {
        return res.status(200).send({ status: 'success', link })
      }
      return res.status(404).send({ status: 'fail', message: 'El link no existe' })
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async bulkMoveLinks (req, res) {
    const user = req.user.name
    const { source, destiny, panel, links, escritorio } = req.body
    try {
      const link = await linkModel.bulkMoveLinks({ user, source, destiny, panel, links, escritorio })
      return res.status(200).send({ status: 'success', link })
    } catch (error) {
      return res.status(500).send(error)
    }
  }

  static async getLinkNameByUrl (req, res) {
    const url = req.query.url
    const data = await getLinkNameByUrlLocal({ url })
    res.send(data)
  }

  static async getLinkStatus (req, res) {
    const url = req.query.url
    const data = await getLinkStatusLocal({ url })
    res.send(data)
  }

  static async findDuplicateLinks (req, res) {
    const user = req.user.name
    const data = await linkModel.findDuplicateLinks({ user })
    res.send(data)
  }
}
