import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

import { userRoles, userStatuses } from '../enums/index.js'

export const verifyToken = (req, _, next) => {
  try {
    const authorization = req.headers.authorization
    if (!authorization) throw createHttpError(401, 'Unauthorized')

    const splitedToken = authorization?.split(' ')
    const bearer = splitedToken[0]
    if (!bearer) throw createHttpError(401, 'Invalid token')

    const token = splitedToken[1]
    const secret = process.env.SECRET

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        console.log(err)
        throw createHttpError(401, 'Invalid token')
      }
      if (user.status === userStatuses.INACTIVE)
        throw createHttpError(401, 'User disabled')
      if (req.baseUrl.includes('/admin-api') && user.role !== userRoles.ADMIN)
        throw createHttpError(403, 'User is not admin')

      req.user = user

      next()
    })
  } catch (error) {
    next(error)
  }
}
