import moment from 'moment'
import { Requests } from '../../db/models/requests.mjs'
import { Users } from '../../db/models/users.mjs'
import requestTypes from '../../enums/request-types.mjs'

export const create = async (
  _,
  { files, startDate, endDate, comment, type },
  { user }
) => {
  if (!user || user?.status !== 'active') throw new Error('Authentication required')
  if (!startDate || !endDate)
    throw new Error('Provide both of start and end dates')
  if (!type || !Object.values(requestTypes).includes(type))
    throw new Error(
      `Status should be one of [${Object.values(requestTypes).join(', ')}]`
    )

  if (moment(startDate).isAfter(endDate))
    throw new Error('Start date should be before end')

  const _startDate = moment(startDate).utcOffset(false).startOf('day').valueOf()
  const _endDate = moment(endDate).utcOffset(false).endOf('day').valueOf()

  const client = await Users.findOne({ id: user.id })
  const client_balance = client?.balance[type]

  const countDays = moment(startDate).diff(endDate, 'days')

  if (client_balance + countDays < 0 || client_balance < 1)
    throw new Error('Insufficient balance')

  if (type !== requestTypes.OVERTIME)
    await client.updateOne({
      [`balance.${type}`]: (client_balance + countDays).toFixed(2),
    })

  const request = await Requests.create({
    user: client._id,
    startDate: _startDate,
    endDate: _endDate,
    type,
    comment,
  })

  return request
}

export const getRequests = async (
  _,
  { userId, limit = 10, offset = 0 },
  { user }
) => {
  if (!user || user?.status !== 'active') throw new Error('Authentication required')

  const client = await Users.findOne({ id: userId })
  if (!client) throw new Error('Cannot find user with provided id')

  const requests = await Requests.find({ user: client._id })
    .skip(limit * offset)
    .limit(limit)
    .populate('user')

  return requests
}
