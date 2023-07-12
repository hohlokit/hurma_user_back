import express from 'express'

import {
  getById,
  getAbsentByDate,
  getCelebrations,
  updateUser
} from '../controllers/users.mjs'
import { verifyToken } from '../mw/verifyToken.mjs'

const router = express.Router()

router.get('/:userId', verifyToken, getById)
router.get('/absent-by-date', verifyToken, getAbsentByDate)
router.get('/celebrations', verifyToken, getCelebrations)

router.patch('/:userId', verifyToken, updateUser)

export default router
