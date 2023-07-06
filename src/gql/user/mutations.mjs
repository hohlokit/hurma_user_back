import { GraphQLString } from 'graphql'
import { GraphQLJSONObject } from 'graphql-compose'

import { requestCode, login } from './services.mjs'

export default {
  requestCode: {
    type: GraphQLString,
    args: {
      email: {
        name: 'email',
        type: GraphQLString,
      },
    },
    resolve: requestCode,
  },
  login: {
    type: GraphQLJSONObject,
    args: {
      email: {
        name: 'email',
        type: GraphQLString,
      },
      loginCode: {
        name: 'loginCode',
        type: GraphQLString,
      },
    },
    resolve: login,
  },
}
