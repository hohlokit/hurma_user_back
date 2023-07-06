import { GraphQLFloat, GraphQLString } from 'graphql'
import { GraphQLJSONObject } from 'graphql-compose'

import { create, joinEvent } from './services.mjs'
import EventType from './type.mjs'

export default {
  create: {
    type: GraphQLJSONObject,
    args: {
      startDate: {
        name: 'startDate',
        type: GraphQLFloat,
      },
      endDate: {
        name: 'endDate',
        type: GraphQLFloat,
      },
      name: {
        name: 'name',
        type: GraphQLString,
      },
      description: {
        name: 'description',
        type: GraphQLString,
      },
    },
    resolve: create,
  },
  joinEvent: {
    type: EventType,
    args: {
      eventId: {
        name: 'eventId',
        type: GraphQLString,
      },
    },
    resolve: joinEvent,
  },
}
