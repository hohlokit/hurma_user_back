import { Requests } from '../db/models/requests.mjs'
import { Events } from '../db/models/events.mjs'
import { Users } from '../db/models/users.mjs'
import requestStatuses from '../enums/request-statuses.mjs'
import { saveFile } from '../utils/index.mjs'
import moment from 'moment'
import { ObjectId } from 'mongodb'

export const getById = async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await Users.findOne(
      { id },
      {
        _id: 0,
        __v: 0,
        loginCode: 0,
        password: 0,
      }
    )

    return res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const getAbsentByDate = async (req, res, next) => {
  try {
    const { date = moment().valueOf(), limit = 10, offset = 0 } = req.body

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

    const absents = approvedRequests.map(({ type, user }) => {
      const { firstName, lastName, id } = user

      return { type, firstName, lastName, id }
    })

    return res.status(200).json(absents)
  } catch (error) {
    next(error)
  }
}

export const getCelebrations = async (req, res, next) => {
  try {
    const today = new Date()
    const pipe1 = {
      $project: {
        _id: 0,
        id: 1,
        firstName: 1,
        lastName: 1,
        surname: 1,
        avatar: 1,
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
        avatar: 1,
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

    return res.status(200).json(celebrations)
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { firstName, lastName, surname, email, phone, birthday } = req.body
    const user = await Users.findOne({ id: userId })
    if (!user) throw createHttpError(400, 'Cannot find user with provided id')

    const upd = { email, firstName, lastName, surname, phone, birthday }
    let avatarData
    if (req.files) {
      const { avatar } = req.files

      avatarData = avatar
      if (avatarData === false) avatarData = deleteAvatar
      else if (avatarData) {
        const { filename } = await saveFile({
          file: avatar,
          savePath: `/avatars`,
          newFilename: req.user.id,
        })

        upd['avatar'] = `/public/avatars/${filename}`
      }
    }

    const updated = await Users.findOneAndUpdate({ id: userId }, upd, {
      returnDocument: 'after',
    })
    return res.status(200).json(updated)
  } catch (error) {
    next(error)
  }
}

export const getSelf = async (req, res, next) => {
  try {
    const user = await Users.findOne(
      { id: req?.user?.id },
      {
        _id: 0,
        __v: 0,
        loginCode: 0,
        password: 0,
      }
    )

    return res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const getTimeline = async (req, res, next) => {
  try {
    let result = []

    const user = await Users.findOne(
      { id: req?.user?.id },
      {
        _id: 1,
        __v: 0,
        loginCode: 0,
        password: 0,
      }
    )
    const userId = new ObjectId(user._id)

    const requests = await Requests.find({ user: userId })

    const newRequests = requests.reduce((result, request) => {
      const newObj = {
        type: request.type,
        status: request.status,
        startDate: request.startDate,
        endDate: request.endDate,
        id: request.id,
        comment: request.comment,
      }
      const startDateTime = moment(newObj.startDate)
      const endDateTime = moment(newObj.endDate)
      if (!startDateTime.isSame(endDateTime, 'day')) {
        const startDateObject = { ...newObj }
        startDateObject.elementType = 'request (startDate)'
        startDateObject.date = startDateObject.startDate
        result.push(startDateObject)
        const endDateObject = { ...newObj }
        endDateObject.elementType = 'request (endDate)'
        endDateObject.date = endDateObject.endDate
        result.push(endDateObject)
      } else {
        const copiedObject = { ...newObj }
        newObj.elementType = 'request'
        copiedObject.date = copiedObject.endDate
        result.push(copiedObject)
      }
      return result
    }, [])

    const events = await Events.find({
      $or: [{ members: userId }, { creators: userId }],
    })

    const newEvents = events.reduce((result, event) => {
      const newObj = {
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        id: event.id,
      }
      const startDateTime = moment(newObj.startDate)
      const endDateTime = moment(newObj.endDate)
      if (!startDateTime.isSame(endDateTime, 'day')) {
        const startDateObject = { ...newObj }
        startDateObject.elementType = 'event (startDate)'
        startDateObject.date = startDateObject.startDate
        result.push(startDateObject)
        const endDateObject = { ...newObj }
        endDateObject.elementType = 'event (endDate)'
        endDateObject.date = endDateObject.endDate
        result.push(endDateObject)
      } else {
        const copiedObject = { ...newObj }
        newObj.elementType = 'event'
        copiedObject.date = copiedObject.endDate
        result.push(copiedObject)
      }
      return result
    }, [])

    result = newEvents.concat(newRequests)

    result.forEach((element) => {
      delete element.endDate
      delete element.startDate
    })

    result.sort((a, b) => {
      const dateA = moment(a.date)
      const dateB = moment(b.date)
      return dateB - dateA
    })

    return res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
