import { GraphQLInt, GraphQLList, GraphQLString } from 'graphql'
import { GraphQLDate } from 'graphql-compose'

import UserType from './type.mjs'
import { getById, getAbsentByDate, getCelebrations } from './services.mjs'
import AbsentType from './absent-type.mjs'
import CelebrationType from './celebration-type.mjs'

export default {
  getAbsentByDate: {
    type: GraphQLList(AbsentType),
    args: {
      limit: {
        name: 'limit',
        type: GraphQLInt,
      },
      offset: {
        name: 'offset',
        type: GraphQLInt,
      },
      date: {
        type: GraphQLDate,
      },
    },
    resolve: getAbsentByDate,
  },
  user: {
    type: UserType,
    args: {
      id: {
        type: GraphQLString,
      },
    },
    resolve: getById,
  },
  celebrations: {
    type: GraphQLList(CelebrationType),
    args: {},
    resolve: getCelebrations,
  },
}
