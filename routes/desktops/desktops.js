import express from 'express'
import { desktopController } from '../../controllers/desktops/desktopsController.js'

export const desktopsRouter = express.Router()

desktopsRouter.get('/', desktopController.getAllDesktops)
desktopsRouter.get('/fix/ok', desktopController.testDummyData)

desktopsRouter.post('/', desktopController.createDesktop)
desktopsRouter.patch('/', desktopController.editDesktop)
desktopsRouter.patch('/setorder', desktopController.setDesktopsOrder)
desktopsRouter.delete('/', desktopController.deleteDesktop)
