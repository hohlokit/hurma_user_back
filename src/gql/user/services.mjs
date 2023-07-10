import jwt from 'jsonwebtoken'
import moment from 'moment'

import { Users } from '../../db/models/users.mjs'
import sendMail from '../../services/send-mail.mjs'
import validateEmail from '../../utils/validate-email.mjs'
import { Requests } from '../../db/models/requests.mjs'
import requestStatuses from '../../enums/request-statuses.mjs'
import userStatuses from '../../enums/user-statuses.mjs'

export const signUp = async (_, { email, firstName, lastName, birthday }) => {
  if (!validateEmail(email)) throw new Error('Provided invalid email')

  const user = await Users.create({
    email,
    firstName,
    lastName,
    birthday: moment(birthday).utcOffset(0, true).valueOf(),
    status: userStatuses.ACTIVE,
  })
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

  return { user, accessToken }
}
export const requestCode = async (_, { email }) => {
  if (!validateEmail(email)) throw new Error('Provided invalid email')

  const user = await Users.findOne({ email })
  if (!user || user?.status !== 'active')
    throw new Error('Cannot find user with provided email.')

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
    return `Email with code was sent to ${email}.`
  }

  throw new Error('Unknown error')
}
export const login = async (_, { email, loginCode }) => {
  if (!loginCode) throw new Error('Code is missing')

  const client = await Users.findOne({ email, loginCode }, '-__v -loginCode')
  if (!client)
    throw new Error("Can't find user with this combination of email&code")

  if (client) {
    await Users.updateOne({ email, loginCode }, { loginCode: null })

    const accessToken = jwt.sign(
      {
        status: client.status,
        email: client.email,
        id: client.id,
        _id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        time: moment.utc().valueOf(),
      },
      process.env.SECRET
    )

    return {
      accessToken,
      client,
    }
  }

  throw new Error('Unknown error')
}
export const getById = async (_, { id }, { user }) => {
  if (!user || user?.status !== 'active')
    throw new Error('Authentication required')
  if (!id) id = user.id

  return await Users.findOne({ id })
}

export const getAbsentByDate = async (
  _,
  { date = moment().valueOf(), limit = 10, offset = 0 },
  { user }
) => {
  if (!user || user?.status !== 'active')
    throw new Error('Authentication required')

  const approvedRequests = await Requests.find({
    status: requestStatuses.APPROVED,
    startDate: {
      $lte: date,
    },
    endDate: {
      $gte: date,
    },
  })
    .sort({ _id: -1 })
    .skip(limit * offset)
    .limit(limit)
    .populate('user')

  return approvedRequests.map(({ type, user }) => {
    const { firstName, lastName, id } = user

    return { type, firstName, lastName, id }
  })
}

export const getCelebrations = async (_, {}, { user }) => {
  if (!user) throw new Error('Authentication required')

  const today = new Date()
  const pipe1 = {
    $project: {
      _id: 0,
      id: 1,
      firstName: 1,
      lastName: 1,
      surname: 1,
      birthday: 1,
      todayDayOfYear: { $dayOfYear: today },
      dayOfYear: { $dayOfYear: '$birthday' },
    },
  }
  const pipe2 = {
    $project: {
      id: 1,
      firstName: 1,
      lastName: 1,
      surname: 1,
      birthday: 1,
      daysTillBirthday: {
        $subtract: [
          {
            $add: [
              '$dayOfYear',
              { $cond: [{ $lt: ['$dayOfYear', '$todayDayOfYear'] }, 365, 0] },
            ],
          },
          '$todayDayOfYear',
        ],
      },
    },
  }

  const sort = { $sort: { daysTillBirthday: 1 } }
  const limit = { $limit: 5 }
  const celebrations = await Users.aggregate([pipe1, pipe2, sort, limit])

  return celebrations
}
