import createHttpError from 'http-errors'
import { Events } from '../db/models/events.mjs'

export const createEvent = async (req, res, next) => {
  try {
    const { startDate, endDate, name, description } = req.body

    if (!startDate || !endDate)
      throw createHttpError('Provide both of start and end dates')

    const request = await Events.create({
      name,
      description,
      startDate,
      endDate,
    })
    return res.status(200).json({ request })
  } catch (error) {
    next(error)
  }
}

export const joinEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params
    const event = await Events.findOne({ id: eventId })
    if (!event) throw createHttpError(400, 'Cannot find event with provided id')

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
      .populate('members', '-_id id email firstName lastName surname')
      .populate('creatros', '-_id id email firstName lastName surname')

    return res.status(200).json(event)
  } catch (error) {
    next(error)
  }
}

export const getEvents = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query

    const requests = await Events.find({})
      .sort({ createdAt: -1 })
      .skip(limit * offset)
      .limit(limit)
      .populate('members', '-_id id email firstName lastName')
      .populate('creators', '-_id id email firstName lastName')

    return res.status(200).json(requests)
  } catch (error) {
    next(error)
  }
}
