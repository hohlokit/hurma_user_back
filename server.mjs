import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'
import cors from 'cors'
import formData from 'express-form-data'

import { connectDB } from './src/db/connectDb.mjs'
import updateBalance from './src/cron/update-balance.mjs'
import errorHandler from './src/mw/errorHandler.mjs'

import routes from './src/routes/index.mjs'

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

app.use(cors({}))

app.use('/api', routes)
app.use(errorHandler)

app.use(express.static('client/build'))

app.use('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

console.log(`Running a GraphQL API server at http://localhost:${PORT}/api`)
