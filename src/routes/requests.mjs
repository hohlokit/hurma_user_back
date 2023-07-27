import express from 'express'

import {
  getRequests,
  createRequest,
  declineRequest,
} from '../controllers/requests.mjs'
import { verifyToken } from '../mw/verify-token.mjs'
import route404 from '../mw/route-404.mjs'

const router = express.Router()

router.post('/', verifyToken, createRequest)
router.get('/', verifyToken, getRequests)
router.patch('/:requestId', verifyToken, declineRequest)

router.get('*', route404)

export default router
