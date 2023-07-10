import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

import { connectDB } from './src/db/connectDb.mjs'
import schema from './src/gql/index.mjs'
import { verifyToken } from './src/mw/verifyToken.mjs'
import updateBalance from './src/cron/update-balance.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const PORT = process.env.PORT || 8000
const app = express()

app.listen(PORT)

connectDB()
updateBalance()

app.use('/public', express.static('uploads'))

app.use('/api', verifyToken)

app.use(
  '/api',
  graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: { user: req.user },
  }))
)

app.use(express.static('client/build'))

app.use('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

console.log(`Running a GraphQL API server at http://localhost:${PORT}/api`)
