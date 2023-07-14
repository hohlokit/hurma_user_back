import express from 'express'

import {
  getById,
  getAbsentByDate,
  getCelebrations,
  updateUser,
  getSelf,
} from '../controllers/users.mjs'
import { verifyToken } from '../mw/verify-token.mjs'
import route404 from '../mw/route-404.mjs'

const router = express.Router()

router.get('/', verifyToken, getSelf)
router.get('/absent-by-date', verifyToken, getAbsentByDate)
router.get('/celebrations', verifyToken, getCelebrations)
router.get('/:userId', verifyToken, getById)

router.patch('/:userId', verifyToken, updateUser)

router.get('*', route404)

export default router
