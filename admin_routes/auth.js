import express from 'express'

import { loginViaPassowrd } from '../controllers/auth.js'

const router = express.Router()

router.post('/login', loginViaPassowrd)

export default router
