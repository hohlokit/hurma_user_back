import express from 'express'
const router = express.Router()

import userRouter from './users.js'
import requestRouter from './requests.js'
import authRouter from './auth.js'
import eventRouter from './events.js'

router.use('/events', eventRouter)
router.use('/users', userRouter)
router.use('/requests', requestRouter)
router.use('/auth', authRouter)

export default router
