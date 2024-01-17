import { Schema, model } from 'mongoose'

const DesktopSchema = new Schema({
  name: {
    type: String
  },
  displayName: {
    type: String
  },
  user: {
    type: String
  },
  orden: {
    type: Number
  },
  hidden: {
    type: Boolean
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('escritorio', DesktopSchema)
