import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import cors from 'cors'
import formData from 'express-form-data'
import serveStatic from 'serve-static'

import { connectDB } from './db/connectDb.js'
import updateBalance from './cron/update-balance.js'
import errorHandler from './mw/error-handler.js'

import routes from './routes/index.js'
import adminRoutes from './admin_routes/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const PORT = process.env.PORT || 8000
const app = express()

app.listen(PORT)

connectDB()
updateBalance()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(formData.parse())

app.use('/public', express.static('uploads'))

app.use(cors())

app.use('/admin-api', adminRoutes)
app.use('/api', routes)
app.use(errorHandler)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('builds/client'))
  app.use(serveStatic('builds/admin'))

  app.use('/admin*', (_, res) => {
    res.sendFile(path.resolve(__dirname, 'builds', 'admin', 'index.html'))
  })

  app.use('/*', (_, res) => {
    res.sendFile(path.resolve(__dirname, 'builds', 'client', 'index.html'))
  })
}

console.log(
  `Server is running. \n Port: ${PORT}\n Api: /api\n Admin api: /admin-api`
)
