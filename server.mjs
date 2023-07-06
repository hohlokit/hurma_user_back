import express from 'express'
import { graphqlHTTP } from 'express-graphql'
import dotenv from 'dotenv'

import { connectDB } from './src/db/connectDb.mjs'
import schema from './src/gql/index.mjs'
import { verifyToken } from './src/mw/verifyToken.mjs'
import updateBalance from './src/cron/update-balance.mjs'

dotenv.config()

const PORT = process.env.PORT || 8000
const app = express()

app.listen(PORT)

connectDB()
updateBalance()

app.use('/api', verifyToken)

app.use(
  '/api',
  graphqlHTTP((req) => ({
    schema,
    graphiql: true,
    context: { user: req.user },
  }))
)

console.log(`Running a GraphQL API server at http://localhost:${PORT}/api`)
