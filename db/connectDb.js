import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const MONGO_URI = 'mongodb://127.0.0.1:27017'

    const connection = await mongoose.connect(MONGO_URI, {
      dbName: process.env.DB_NAME,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log('Database was successfully connected.')
    return connection
  } catch (error) {
    console.error(error)
  }
}