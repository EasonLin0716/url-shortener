const mongoose = require('mongoose')
const Schema = mongoose.Schema

const urlSchema = new Schema({
  link: {
    type: String,
    required: true
  },

  shortenLink: {
    type: String
  }
})

module.exports = mongoose.model('urls', urlSchema)