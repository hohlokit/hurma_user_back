import { GraphQLFloat, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql'
import { GraphQLJSONObject } from 'graphql-compose'

export default new GraphQLObjectType({
  name: 'Event',
  description: 'Event object',
  fields: () => ({
    id: {
      type: GraphQLString,
    },
    creators: {
      type: GraphQLList(GraphQLJSONObject),
    },
    members: {
      type: GraphQLList(GraphQLJSONObject),
    },
    name: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
    startDate: {
      type: GraphQLFloat,
    },
    endDate: {
      type: GraphQLFloat,
    },
  }),
})
