import { GraphQLInt, GraphQLList, GraphQLString } from 'graphql'

import RequestType from './type.mjs'
import { getRequests } from './services.mjs'

export default {
  getRequests: {
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
      type: {
        name: 'type',
        type: GraphQLString,
      },
    },
    resolve: getRequests,
  },
}
