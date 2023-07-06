import { GraphQLInt, GraphQLList } from 'graphql'

import RequestType from './type.mjs'
import { getEvents } from './services.mjs'

export default {
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
