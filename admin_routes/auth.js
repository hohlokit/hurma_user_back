import express from 'express'

import { loginViaPassowrd } from '../controllers/auth.js'
import { verifyToken } from '../mw/verify-token.js'

const router = express.Router()

router.post('/login', verifyToken, loginViaPassowrd)

export default router
