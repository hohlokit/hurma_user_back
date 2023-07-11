import { GraphQLObjectType, GraphQLSchema } from 'graphql'

import userQueries from './user/query.mjs'
import requestQueries from './requests/query.mjs'
import eventQueries from './events/query.mjs'

import userMutations from './user/mutations.mjs'
import requestMutations from './requests/mutations.mjs'
import eventMutations from './events/mutations.mjs'

const RootQuery = new GraphQLObjectType({
  name: 'Query',
  description: 'Realize Root Query',
  fields: () => ({
    user: userQueries.user,
    requests: requestQueries.getRequests,
    absentByDate: userQueries.getAbsentByDate,
    events: eventQueries.getEvents,
    event: eventQueries.getEvent,
    celebrations: userQueries.celebrations,
  }),
})

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Realize Root Mutations',
  fields: () => ({
    requestCode: userMutations.requestCode,
    login: userMutations.login,
    createRequest: requestMutations.create,
    createEvent: eventMutations.create,
    joinEvent: eventMutations.joinEvent,
    updateUser: userMutations.updateUser
  }),
})

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
})

export default schema
