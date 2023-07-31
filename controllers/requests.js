import moment from 'moment'
import business from 'moment-business'
import createHttpError from 'http-errors'

import { Users } from '../db/models/users.js'
import { Requests } from '../db/models/requests.js'
import { requestStatuses, requestTypes } from '../enums/index.js'

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
    const isAdmin = req.baseUrl.includes('/admin-api')
    const {
      limit = isAdmin ? 999999 : 10,
      offset = 0,
      type,
      status,
      email = '',
      firstName,
      lastName,
      surname,
    } = req.query

    const user = await Users.findOne({ id: req.user.id })
    if (!user) throw createHttpError(400, 'Cannot find user with provided id')
    if (status && !Object.values(requestStatuses).includes(status))
      throw createHttpError(
        400,
        `Status should be one of [${Object.values(requestStatuses).join(', ')}]`
      )
    if (type && !Object.values(requestTypes).includes(type))
      throw createHttpError(
        400,
        `Type should be one of [${Object.values(requestTypes).join(', ')}]`
      )

    const query = { user: user._id }
    if (isAdmin) {
      const findUsers = {}
      if (email) findUsers.email = { $regex: email, $options: 'i' }
      if (firstName) findUsers.firstName = { $regex: firstName, $options: 'i' }
      if (lastName) findUsers.lastName = { $regex: lastName, $options: 'i' }
      if (surname) findUsers.surname = { $regex: surname, $options: 'i' }

      const users = await Users.find(findUsers)
      const usersIds = users.map(({ _id }) => _id)

      query.user = { $in: usersIds }
    }
    if (type) query.type = type
    if (status) query.status = status

    const requests = await Requests.find(query)
      .sort({ _id: -1 })
      .skip(limit * offset)
      .limit(limit)
      .populate('user', 'id email firstName lastName surname avatar')

    const count = await Requests.countDocuments(query)
    return res.status(200).json({ count, requests })
  } catch (error) {
    next(error)
  }
}

export const getRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params

    const request = await Requests.findOne({ id: requestId }).populate(
      'user',
      'id email firstName lastName surname avatar'
    )

    return res.status(200).json(request)
  } catch (error) {
    next(error)
  }
}

export const updateRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params
    const { status } = req.body

    if (!Object.values(requestStatuses).includes(status))
      throw createHttpError(
        400,
        `Status should be one of [${Object.values(requestStatuses).join(', ')}]`
      )

    const request = await Requests.findOne({ id: requestId })
    if (!request)
      throw createHttpError(400, 'Cannot find request with provided id')
    if (request.status !== requestStatuses.ON_REVIEW)
      throw createHttpError(
        400,
        `This request already reviewed. Current status: ${request.status}`
      )

    const updated = await Requests.findOneAndUpdate(
      { id: requestId },
      { status },
      { returnDocument: 'after' }
    ).populate('user', 'id email firstName lastName surname avatar')
    return res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}
