const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BrandSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, maxLength: 1000 },
})

BrandSchema.virtual('url').get(function () {
  return '/store/brand/' + this._id
})

module.exports = mongoose.model('Brand', BrandSchema)
