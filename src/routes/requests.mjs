import express from 'express'

import { getRequests, createRequest,updateRequests } from '../controllers/requests.mjs'
import { verifyToken } from '../mw/verify-token.mjs'
import route404 from '../mw/route-404.mjs'

const router = express.Router()

router.post('/', verifyToken, createRequest)
router.get('/', verifyToken, getRequests)
router.get('/:requestId', verifyToken, updateRequests)

router.get('*', route404)

export default router
