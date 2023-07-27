import moment from 'moment'
import business from 'moment-business'
import createHttpError from 'http-errors'

import { Users } from '../db/models/users.mjs'
import { Requests } from '../db/models/requests.mjs'
import { requestTypes, requestStatuses } from '../enums/index.mjs'

export const createRequest = async (req, res, next) => {
  try {
    const { startDate, endDate, type, comment } = req.body

    if (!startDate || !endDate)
      throw createHttpError(400, 'Provide both of start and end dates')
    if (!type || !Object.values(requestTypes).includes(type))
      throw createHttpError(
        400,
        `Status should be one of [${Object.values(requestTypes).join(', ')}]`
      )

    if (moment(startDate).isAfter(endDate))
      throw createHttpError(400, 'Start date should be before end')

    const _startDate = moment(startDate)
      .utcOffset(false)
      .startOf('day')
      .valueOf()
    const _endDate = moment(endDate).utcOffset(false).endOf('day').valueOf()

    const user = await Users.findOne({ id: req.user.id })
    const user_balance = user?.balance[type]

    const countDays = business.weekDays(moment(startDate), moment(endDate))
    if (user_balance - countDays < 0 || user_balance < 1)
      throw createHttpError(400, 'Insufficient balance')

    if (type !== requestTypes.OVERTIME)
      await user.updateOne({
        [`balance.${type}`]: (user_balance - countDays).toFixed(2),
      })

    const request = await Requests.create({
      user: user._id,
      startDate: _startDate,
      endDate: _endDate,
      type,
      comment,
    })

    return res.status(200).json(request)
  } catch (error) {
    next(error)
  }
}

export const getRequests = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, type } = req.query

    const user = await Users.findOne({ id: req.user.id })
    if (!user) throw createHttpError(400, 'Cannot find user with provided id')

    const query = { user: user._id }
    if (type) query.type = type

    const requests = await Requests.find(query)
      .sort({ _id: -1 })
      .skip(limit * offset)
      .limit(limit)
      .populate('user')

    const count = await Requests.countDocuments(query)
    return res.status(200).json({ count, requests })
  } catch (error) {
    next(error)
  }
}

export const declineRequest = async (req, res, next) => {
  try {
    const requestId = req.params.requestId
    const query = { id: requestId }
    const updatedRequest = await Requests.findOneAndUpdate(
      query,
      { status: requestStatuses.DECLINED },
      {
        returnDocument: 'after',
      }
    )
    return res.status(200).json(updatedRequest)
  } catch (error) {
    next(error)
  }
}
