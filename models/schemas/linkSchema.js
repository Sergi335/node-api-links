import { Schema, model } from 'mongoose'

const LinkSchema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String,
    default: 'Description'
  },
  URL: {
    type: String
  },
  imgURL: {
    type: String
  },
  escritorio: {
    type: String
  },
  panel: {
    type: String
  },
  idpanel: {
    type: String
  },
  orden: {
    type: Number
  },
  user: {
    type: String
  },
  notes: {
    type: String
  },
  images: {
    type: Array
  },
  bookmark: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
})

export default model('link', LinkSchema)
