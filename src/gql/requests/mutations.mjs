import { GraphQLFloat, GraphQLString } from 'graphql'

import {  create } from './services.mjs'
import RequestType from './type.mjs'

export default {
  create: {
    type: RequestType,
    args: {
      startDate: {
        name: 'startDate',
        type: GraphQLFloat,
      },
      endDate: {
        name: 'endDate',
        type: GraphQLFloat,
      },
      type: {
        name: 'type',
        type: GraphQLString,
      },
      comment: {
        name: 'comment',
        type: GraphQLString,
      },
    },
    resolve: create,
  }
}
