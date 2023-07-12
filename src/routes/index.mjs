import express from 'express'
const router = express.Router()

import userRouter from './users.mjs'
import requestRouter from './requests.mjs'
import authRouter from './auth.mjs'
import eventRouter from './events.mjs'

router.use('/events', eventRouter)
router.use('/users', userRouter)
router.use('/requests', requestRouter)
router.use('/auth', authRouter)

export default router
