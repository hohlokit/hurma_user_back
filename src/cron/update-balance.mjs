import cron from 'node-cron'
import { Users } from '../db/models/users.mjs'

export default () => {
  cron.schedule(
    '0 0 0 1 1 *',
    async () => {
      await Users.updateMany({}, [
        {
          $set: {
            'balance.sick_leave': {
              $round: [{ $add: ['$balance.sick_leave', 5] }, 2],
            },
          },
        },
      ])
    },
    {
      timezone: 'Europe/Moscow',
    }
  )
  cron.schedule(
    '0 0 0 1 * *',
    async () => {
      await Users.updateMany({}, [
        {
          $set: {
            'balance.vacation': {
              $round: [{ $add: ['$balance.vacation', 1.66] }, 2],
            },
          },
        },
      ])
    },
    {
      timezone: 'Europe/Moscow',
    }
  )
}
