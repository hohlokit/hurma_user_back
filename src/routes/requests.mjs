import express from 'express'

import {
  getRequests,
  createRequest,
} from '../controllers/requests.mjs'
import { verifyToken } from '../mw/verifyToken.mjs'

const router = express.Router()

router.post('/', verifyToken, createRequest)
router.get('/:requestId', verifyToken, getRequests)


router.get('*', route404)

export default router
