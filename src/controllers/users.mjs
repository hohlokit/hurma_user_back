import { Requests } from '../db/models/requests.mjs'
import { Users } from '../db/models/users.mjs'
import requestStatuses from '../enums/request-statuses.mjs'
import { saveFile } from '../utils/index.mjs'
import moment from 'moment'

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
