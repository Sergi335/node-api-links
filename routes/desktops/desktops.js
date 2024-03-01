import express from 'express'
import { DesktopController } from '../../controllers/desktops/desktopsController.js'

const desktopControllerInstance = new DesktopController({ user: process.env.TEST_USER })
export const desktopsRouter = express.Router()

desktopsRouter.get('/', desktopControllerInstance.getAllDesktops)
desktopsRouter.get('/fix/ok', desktopControllerInstance.testDummyData)

desktopsRouter.post('/', desktopControllerInstance.createDesktop)
desktopsRouter.patch('/', desktopControllerInstance.editDesktop)
desktopsRouter.patch('/setorder', desktopControllerInstance.setDesktopsOrder)
desktopsRouter.delete('/', desktopControllerInstance.deleteDesktop)
