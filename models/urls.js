const mongoose = require('mongoose')
const Schema = mongoose.Schema

const urlSchema = new Schema({
  link: {
    type: String,
    unique: true,
    required: true
  },

  shortenLink: {
    type: String,
    unique: true,
    required: true
  }
})

module.exports = mongoose.model('urls', urlSchema)