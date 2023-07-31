import express from 'express'

import { loginViaCode, requestCode } from '../controllers/auth.js'
import route404 from '../mw/route-404.js'

const router = express.Router()

router.post('/request-code', requestCode)
router.post('/login', loginViaCode)

router.get('*', route404)

export default router
