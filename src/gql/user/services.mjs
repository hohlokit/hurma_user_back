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
  console.log(1)
  if (!validateEmail(email)) throw new Error('Provided invalid email')
  console.log(2)

  const user = await Users.findOne({ email })
  console.log(3)
  if (!user || user?.status !== 'active')
    throw new Error('Cannot find user with provided email.')
  console.log(4)

  if (user) {
    console.log(5)
    const loginCode = Math.floor(100000 + Math.random() * 900000)
    console.log(6)
    await Users.updateOne({ email }, { loginCode })
    console.log(7)
    const result = await sendMail({
      to: [email],
      subject: 'Your login code',
      templateId: 'login',
      templateProps: {
        loginCode,
      },
    })
    console.log(result)
    console.log(8)
    return `Email with code was sent to ${email}.`
  }

  console.log(9)
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
    .skip(limit * offset)
    .limit(limit)
    .populate('user')

  return approvedRequests.map(({ type, user }) => {
    const { firstName, lastName, id } = user

    return { type, firstName, lastName, id }
  })
}
