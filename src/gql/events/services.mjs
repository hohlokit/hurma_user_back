import { Events } from '../../db/models/events.mjs'

export const create = async (
  _,
  { startDate, endDate, name, description },
  { user }
) => {
  if (!user || user?.status !== 'active')
    throw new Error('Authentication required')
  if (!startDate || !endDate)
    throw new Error('Provide both of start and end dates')

  const request = await Events.create({
    name,
    description,
    startDate,
    endDate,
  })

  return request
}

export const joinEvent = async (_, { eventId }, { user }) => {
  if (!user || user?.status !== 'active')
    throw new Error('Authentication required')

  const event = await Events.findOne({ id: eventId })
  if (!event) throw new Error('Cannot find event with provided id')

  const upd = await event.updateOne({
    $push: {
      members: user._id,
    },
  })
  return upd
}

export const getEvent = async (_, { eventId }, { user }) => {
  if (!user || user?.status !== 'active')
    throw new Error('Authentication required')

  const requests = await Events.findOne({ id: eventId })
    .populate('members', '-_id id email firstName lastName')
    .populate('creators', '-_id id email firstName lastName')

  return requests
}

export const getEvents = async (_, { limit = 10, offset = 0 }, { user }) => {
  if (!user || user?.status !== 'active')
    throw new Error('Authentication required')

  const requests = await Events.find({})
    .sort({ createdAt: -1 })
    .skip(limit * offset)
    .limit(limit)
    .populate('members', '-_id id email firstName lastName')
    .populate('creators', '-_id id email firstName lastName')

  return requests
}
