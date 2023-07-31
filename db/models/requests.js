import mongoose from 'mongoose'

import { requestTypes, requestStatuses } from '../../enums/index.js'
import { generateId } from '../../utils/index.js'
import { ObjectId } from 'mongodb'

const request = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: generateId,
    },
    user: {
      type: ObjectId,
      ref: 'Users',
    },
    type: {
      enum: Object.values(requestTypes),
      default: requestTypes.UNKNOWN,
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(requestStatuses),
      default: requestStatuses.ON_REVIEW,
    },
    attachments: {
      type: String,
    },
    comment: {
      type: String,
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
)

export const Requests = mongoose.model('Requests', request)
