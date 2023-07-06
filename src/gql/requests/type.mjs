import { GraphQLFloat, GraphQLObjectType, GraphQLString } from 'graphql'

import UserType from '../user/type.mjs'

export default new GraphQLObjectType({
  name: 'Request',
  description: 'Request object',
  fields: () => ({
    id: {
      type: GraphQLString,
    },
    user: {
      type: UserType,
    },
    type: {
      type: GraphQLString,
    },
    startDate: {
      type: GraphQLFloat,
    },
    endDate: {
      type: GraphQLFloat,
    },
    comment: {
      type: GraphQLString,
    },
    status: {
      type: GraphQLString,
    },
  }),
})
