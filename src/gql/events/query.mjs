import { GraphQLInt, GraphQLList, GraphQLString } from 'graphql'

import RequestType from './type.mjs'
import { getEvents, getEvent } from './services.mjs'

export default {
  getEvent: {
    type: RequestType,
    args: {
      eventId: {
        name: 'eventId',
        type: GraphQLString,
      },
    },
    resolve: getEvent
  },
  getEvents: {
    type: GraphQLList(RequestType),
    args: {
      limit: {
        name: 'limit',
        type: GraphQLInt,
      },
      offset: {
        name: 'offset',
        type: GraphQLInt,
      },
    },
    resolve: getEvents,
  },
}
