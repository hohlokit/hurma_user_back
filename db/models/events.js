import mongoose from 'mongoose'

import { generateId } from '../../utils/index.js'
import { ObjectId } from 'mongodb'

const event = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: generateId,
    },
    banner: {
      type: String,
    },
    name: {
      type: String,
    },
    description: {
      type: {},
    },
    creators: {
      type: [ObjectId],
      ref: 'Users',
      default: [],
    },
    members: {
      type: [ObjectId],
      ref: 'Users',
      default: [],
    },
    skip: {
      type: [ObjectId],
      ref: 'Users',
      default: [],
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
)

export const Events = mongoose.model('Events', event)
