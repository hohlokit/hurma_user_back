import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'

export default new GraphQLObjectType({
  name: 'Celebration',
  description: 'Celebration user object',
  fields: () => ({
    id: {
      type: GraphQLString,
    },
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
    surname: {
      type: GraphQLString,
    },
    birthday: {
      type: GraphQLFloat,
    },
    daysTillBirthday: {
      type: GraphQLInt,
    },
  }),
})
