import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'

import sendMail from '../services/send-mail.mjs'
import { userStatuses } from '../enums/index.mjs'
import { Users } from '../db/models/users.mjs'
import validateEmail from '../utils/validate-email.mjs'

export const requestCode = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!validateEmail(email))
      throw createHttpError(400, 'Provided invalid email')

    const user = await Users.findOne({ email })
    if (!user || user?.status !== 'active')
      throw createHttpError(400, 'Cannot find user with provided email.')

    if (user) {
      const loginCode = Math.floor(100000 + Math.random() * 900000)
      await Users.updateOne({ email }, { loginCode })
      await sendMail({
        to: [email],
        subject: 'Your login code',
        templateId: 'login',
        templateProps: {
          loginCode,
        },
      })
      return res
        .status(200)
        .json({ result: `Email with code was sent to ${email}.` })
    }
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, loginCode } = req.body
    if (!loginCode) throw createHttpError(400, 'Login code is missing')

    const user = await Users.findOne({ email, loginCode }, '-__v -loginCode')
    if (!user)
      throw createHttpError(
        403,
        "Can't find user with this combination of email&code"
      )
    if (user.status === userStatuses.INACTIVE)
      throw createHttpError(403, 'User disabled. Contact admin for more info')

    if (user) {
      await Users.findOneAndUpdate(
        { email, loginCode },
        { loginCode: null },
        {
          returnDocument: 'after',
          projection: {
            __v: 0,
            _id: 0,
            loginCode: 0,
            password: 0,
          },
        }
      )

      const accessToken = jwt.sign(
        {
          status: user.status,
          email: user.email,
          id: user.id,
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          time: moment.utc().valueOf(),
        },
        process.env.SECRET
      )

      return res.status(200).json({
        accessToken,
        user,
      })
    }
  } catch (error) {
    next(error)
  }
}
