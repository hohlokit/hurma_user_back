import createHttpError from 'http-errors'
import { Events } from '../db/models/events.mjs'
import moment from 'moment'
import { ObjectId } from 'mongodb'

export const createEvent = async (req, res, next) => {
  try {
    const { startDate, endDate, name, description } = req.body

    if (!startDate || !endDate)
      throw createHttpError('Provide both of start and end dates')
    if (moment(startDate).isAfter(endDate))
      throw createHttpError(400, 'Start date should be before end')
    if (moment(startDate).isBefore(moment))
      throw createHttpError(400, 'Start date should be in future')

    const event = await Events.create({
      name,
      description,
      startDate,
      endDate,
    })
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
      .populate('members', '-_id id email firstName lastName surname')
      .populate('creators', '-_id id email firstName lastName surname')

    return res.status(200).json(event)
  } catch (error) {
    next(error)
  }
}

export const getEvents = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, userEvents = 0 } = req.query

    let query = {}

    if (userEvents != 1) {
      query = {}
    } else {
      query = {
        $or: [{ members: req.user._id }, { creators: req.user._id }],
      }
    }

    const requests = await Events.find(query)
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
