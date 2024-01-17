import express from 'express'
import { storageController } from '../../controllers/storage/storageController.js'
import multer from 'multer'
const upload = multer()

export const storageRouter = express.Router()

storageRouter.get('/backgrounds', storageController.getBackgroundsMiniatures)
storageRouter.get('/backgroundurl', storageController.getBackgroundUrl)
storageRouter.get('/icons', storageController.getLinkIcons)
storageRouter.get('/backup', storageController.getUserBackup)

storageRouter.post('/backup', storageController.createUserBackup)
storageRouter.post('/restorebackup', upload.single('backup'), storageController.restoreUserBackup)
storageRouter.post('/image', upload.single('images'), storageController.uploadImage)
storageRouter.post('/icon', upload.single('linkImg'), storageController.uploadIcon)
storageRouter.post('/profilepic', upload.single('file'), storageController.uploadProfileImage)
storageRouter.delete('/image', storageController.deleteImage)
storageRouter.delete('/icon', storageController.deleteIcon)
