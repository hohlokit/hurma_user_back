import express from 'express'

import {
  getById,
  getAbsentByDate,
  getCelebrations,
  updateUser,
  getSelf,
  getTimeline,
} from '../controllers/users.js'
import { verifyToken } from '../mw/verify-token.js'
import route404 from '../mw/route-404.js'

const router = express.Router()

router.get('/', verifyToken, getSelf)
router.get('/absent-by-date', verifyToken, getAbsentByDate)
router.get('/celebrations', verifyToken, getCelebrations)
router.get('/timeline', verifyToken, getTimeline)
router.get('/:userId', verifyToken, getById)

router.patch('/:userId', verifyToken, updateUser)

router.get('*', route404)

export default router
