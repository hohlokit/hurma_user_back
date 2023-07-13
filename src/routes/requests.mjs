import express from 'express'

import { getRequests, createRequest } from '../controllers/requests.mjs'
import { verifyToken } from '../mw/verifyToken.mjs'
import route404 from '../mw/route-404.mjs'

const router = express.Router()

router.post('/', verifyToken, createRequest)
router.get('/', verifyToken, getRequests)

router.get('*', route404)

export default router
