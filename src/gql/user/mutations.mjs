import { GraphQLString } from 'graphql'
import { GraphQLJSONObject } from 'graphql-compose'

import UserType from './type.mjs'
import { requestCode, login, updateUser } from './services.mjs'

export default {
  updateUser: {
    type: UserType,
    args: {
      id: {
        name: 'id',
        type: GraphQLString,
      },
      firstName: {
        name: 'firstName',
        type: GraphQLString,
      },
      lastName: {
        name: 'lastName',
        type: GraphQLString,
      },
      surname: {
        name: 'surname',
        type: GraphQLString,
      },
      email: {
        name: 'email',
        type: GraphQLString,
      },
      phone: {
        name: 'phone',
        type: GraphQLString,
      },
      avatar: {
        name: 'avatar',
        type: GraphQLJSONObject,
      },
    },
    resolve: updateUser,
  },
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
