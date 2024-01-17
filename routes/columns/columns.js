import Express from 'express'
import { columnsController } from '../../controllers/columns/columnsController.js'

const columnsRouter = Express.Router()

columnsRouter.get('/', columnsController.getAllColumns)
columnsRouter.get('/getbydesk/:desktop', columnsController.getColumnByDesktop)
columnsRouter.get('/count', columnsController.getColumnCount)

columnsRouter.post('/', columnsController.createColumn)
columnsRouter.patch('/', columnsController.updateColumn)
columnsRouter.delete('/', columnsController.deleteColumn)

export { columnsRouter }
