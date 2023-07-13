import express from 'express'

import {
  createEvent,
  joinEvent,
  getEvent,
  getEvents,
} from '../controllers/events.mjs'
import { verifyToken } from '../mw/verifyToken.mjs'

const router = express.Router()

router.post('/create', verifyToken, createEvent)

router.patch('/:eventId', verifyToken, joinEvent)

router.get('/', verifyToken, getEvents)
router.get('/:eventId', verifyToken, getEvent)

router.get('*', route404)

export default router
