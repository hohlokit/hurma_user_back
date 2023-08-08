import mongoose from 'mongoose'
import { generateId } from '../../utils/index.js'
import userStatuses from '../../enums/user-statuses.js'
import userRoles from '../../enums/user-roles.js'

const user = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: generateId,
    },
    avatar: {
      type: String,
    },
    phone: {
      unique: true,
      type: String,
    },
    gender: { type: String },
    email: {
      lowercase: true,
      unique: true,
      required: true,
      type: String,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    surname: {
      type: String,
    },
    role: {
      type: String,
      default: userRoles.USER,
    },
    phone: String,
    birthday: {
      type: Date,
    },
    loginCode: {
      type: String,
      default: null,
    },
    balance: {
      vacation: { type: Number, default: 0 },
      sick_leave: { type: Number, default: 0 },
      overtime: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: Object.values(userStatuses),
      default: userStatuses.ACTIVE,
    },
  },
  { timestamps: true }
)

user.pre('save', async function (next) {
  const { email } = this

  const same = await Users.findOne({
    email,
  })

  if (same) {
    throw new Error('User with provided email already exists.')
  }
  next()
})

export const Users = mongoose.model('Users', user)
