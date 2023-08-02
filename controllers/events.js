import createHttpError from 'http-errors'
import moment from 'moment'

import { Events } from '../db/models/events.js'
import { saveFile } from '../utils/index.js'
import { populateUser } from '../db/constants/index.js'

export const createEvent = async (req, res, next) => {
  try {
    const { startDate, endDate, name, description } = req.body

    if (!name) throw createHttpError(400, 'Event name is missing')
    if (!startDate || !endDate)
      throw createHttpError('Provide both of start and end dates')
    if (moment(startDate).isAfter(endDate))
      throw createHttpError(400, 'Start date should be before end')
    if (moment(startDate).isBefore(moment))
      throw createHttpError(400, 'Start date should be in future')

    const create = { name, description, startDate, endDate }

    let event = await Events.create(create)

    let eventBanner
    if (req.files) {
      const { banner } = req.files

      eventBanner = banner
      if (eventBanner) {
        const { filename } = await saveFile({
          file: banner,
          savePath: `/banners`,
          newFilename: event.id,
        })

        event = await Events.findOneAndUpdate(
          { id: event.id },
          { banner: `/public/banners/${filename}` },
          { returnDocument: 'after' }
        )
      }
    }

    return res.status(200).json(event)
  } catch (error) {
    next(error)
  }
}

export const joinEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const event = await Events.findOne({ id: eventId })
    if (!event) throw createHttpError(400, 'Cannot find event with provided id')

    if (
      event.creators.includes(req.user._id) ||
      event.members.includes(req.user._id)
    )
      throw createHttpError(400, 'You already participicate this event')

    const upd = await Events.findOneAndUpdate(
      { id: eventId },
      {
        $push: {
          members: req.user._id,
        },
      },
      {
        returnDocument: 'after',
      }
    )

    return res.status(200).json(upd)
  } catch (error) {
    next(error)
  }
}

export const getEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params

    if (!eventId) throw createHttpError(400, 'Event id was not provided')

    const event = await Events.findOne({ id: eventId })
      .populate('members', populateUser)
      .populate('creators', populateUser)
      .populate('skip', populateUser)

    return res.status(200).json(event)
  } catch (error) {
    next(error)
  }
}

export const getEvents = async (req, res, next) => {
  try {
    const {
      limit = 10,
      offset = 0,
      self = 0,
      name,
      startDate,
      endDate,
    } = req.query

    const query = {}

    if (Number(self) === 1)
      query.$or = [{ members: req.user._id }, { creators: req.user._id }]
    if (name) query.name = { $regex: name, $options: 'i' }
    if (startDate) query.startDate = { $gte: startDate }
    if (endDate) query.endDate = { $lte: endDate }

    const count = await Events.countDocuments(query)

    const events = await Events.find(query)
      .sort({ createdAt: -1 })
      .skip(limit * offset)
      .limit(limit)
      .populate('members', populateUser)
      .populate('creators', populateUser)
      .populate('skip', populateUser)

    return res.status(200).json({ count, events })
  } catch (error) {
    next(error)
  }
}

export const updateEvent = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate } = req.body
    const { eventId } = req.params

    if (!name) throw createHttpError(400, 'Event name is missing')
    if (moment(startDate).isAfter(moment(endDate)))
      throw createHttpError(400, 'Start date should not be after end date')
    const upd = { name, description, startDate, endDate }
    let eventBanner
    if (req.files) {
      const { banner } = req.files

      eventBanner = banner
      if (eventBanner === false) {
        eventBanner = null

        upd['banner'] = null
      } else if (eventBanner) {
        const { filename } = await saveFile({
          file: banner,
          savePath: `/banners`,
          newFilename: eventId,
        })

        upd['banner'] = `/public/banners/${filename}`
      }
    }

    const event = await Events.findOneAndUpdate({ id: eventId }, upd, {
      returnDocument: 'after',
    })

    return res.status(200).json(event)
  } catch (error) {
    next(error)
  }
}
