import jwt from 'jsonwebtoken'

export const verifyToken = async (req, _, next) => {
  const authorization = req.headers.authorization
  const splitedToken = authorization?.split(' ')
  if (!splitedToken) {
    req.user = null
    return next()
  }
  const token = splitedToken[1]
  const secret = process.env.SECRET

  jwt.verify(token, secret, async (_, user) => {
    req.user = user
    next()
  })
}
