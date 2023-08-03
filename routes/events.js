import express from 'express'

import {
  createEvent,
  joinEvent,
  getEvent,
  getEvents,
  skipEvent,
} from '../controllers/events.js'
import { verifyToken } from '../mw/verify-token.js'
import route404 from '../mw/route-404.js'

const router = express.Router()

router.post('/create', verifyToken, createEvent)

router.patch('/join/:eventId', verifyToken, joinEvent)
router.patch('/skip/:eventId', verifyToken, skipEvent)

router.get('/', verifyToken, getEvents)
router.get('/:eventId', verifyToken, getEvent)

router.get('*', route404)

export default router
