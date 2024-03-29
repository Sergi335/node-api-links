import cookieParser from 'cookie-parser'
import 'dotenv/config'
import Express from 'express'
import { dbConnect } from './config/mongodb.js'
import { checkUserSession } from './controllers/auth/authController.js'
import { searchController } from './controllers/search/searchController.js'
import { cors } from './middlewares/cors.js'
import { attachCsrfToken } from './middlewares/session.js'
import { authRouter } from './routes/auth/auth.js'
import { columnsRouter } from './routes/columns/columns.js'
import { desktopsRouter } from './routes/desktops/desktops.js'
import { linksRouter } from './routes/links/links.js'
import { storageRouter } from './routes/storage/storage.js'

export const app = Express()
const PORT = process.env.PORT || 3000
const env = process.env.NODE_ENV

app.use('*', cors)
app.get('/', attachCsrfToken('/', 'csrfToken', (Math.random() * 100000000000000000).toString()), (req, res) => {
  // res.send('Hello World')
})
app.use(Express.json())
app.use(cookieParser())
if (env === 'test') {
  app.use('/auth', authRouter)
  app.use('/links', linksRouter)
  app.use('/columns', columnsRouter)
  app.use('/desktops', desktopsRouter)
  app.use('/storage', storageRouter)
  app.get('/search', searchController.searchLinks)
} else {
  app.use('/auth', authRouter)
  app.use('/links', checkUserSession, linksRouter)
  app.use('/columns', checkUserSession, columnsRouter)
  app.use('/desktops', checkUserSession, desktopsRouter)
  app.use('/storage', checkUserSession, storageRouter)
  app.get('/search', checkUserSession, searchController.searchLinks)
}

dbConnect()

export const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
