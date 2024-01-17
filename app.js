import Express from 'express'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth/auth.js'
import { linksRouter } from './routes/links/links.js'
import { columnsRouter } from './routes/columns/columns.js'
import { desktopsRouter } from './routes/desktops/desktops.js'
import { storageRouter } from './routes/storage/storage.js'
import { attachCsrfToken } from './middlewares/session.js'
import { cors } from './middlewares/cors.js'
import { checkUserSession } from './controllers/auth/authController.js'
import { dbConnect } from './config/mongodb.js'
import { searchController } from './controllers/search/searchController.js'

const app = Express()
const PORT = process.env.PORT || 3000

app.use('*', cors)
app.get('/', attachCsrfToken('/', 'csrfToken', (Math.random() * 100000000000000000).toString()), (req, res) => {
  // res.send('Hello World')
})
app.use(Express.json())
app.use(cookieParser())
app.use('/auth', authRouter)
app.use('/links', checkUserSession, linksRouter)
app.use('/columns', checkUserSession, columnsRouter)
app.use('/desktops', checkUserSession, desktopsRouter)
app.use('/storage', checkUserSession, storageRouter)
app.get('/search', checkUserSession, searchController.searchLinks)

dbConnect()

console.log(process.env.NODE_ENV)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
