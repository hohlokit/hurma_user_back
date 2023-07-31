import express from 'express'

import {
  getRequests,
  createRequest,
  declineRequest,
} from '../controllers/requests.js'
import { verifyToken } from '../mw/verify-token.js'
import route404 from '../mw/route-404.js'

const router = express.Router()

router.post('/', verifyToken, createRequest)
router.get('/', verifyToken, getRequests)
router.patch('/decline/:requestId', verifyToken, declineRequest)

router.get('*', route404)

export default router
