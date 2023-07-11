import { GraphQLFloat, GraphQLObjectType, GraphQLString } from 'graphql'
import { GraphQLJSONObject } from 'graphql-compose'

export default new GraphQLObjectType({
  name: 'User',
  description: 'User object',
  fields: () => ({
    id: {
      type: GraphQLString,
    },
    avatar: {
      type: GraphQLString,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    phone: {
      type: GraphQLString,
    },
    birthday: {
      type: GraphQLFloat,
    },
    balance: {
      type: GraphQLJSONObject,
    },
  }),
})
