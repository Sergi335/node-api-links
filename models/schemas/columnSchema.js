import { Schema, model } from 'mongoose'

const ColumnSchema = new Schema({
  name: {
    type: String
  },
  escritorio: {
    type: String
  },
  vacio: {
    type: Boolean
  },
  order: {
    type: Number
  },
  user: {
    type: String
  },
  slug: {
    type: String,
    unique: true
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('columna', ColumnSchema)
