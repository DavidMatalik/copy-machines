const mongoose = require('mongoose')

const Schema = mongoose.Schema

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, maxLength: 1000 },
  brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
  price: { type: Number, required: true },
  numberInStock: { type: Number, required: true },
  colorPrint: { type: Boolean, required: true },
})

ItemSchema.virtual('url').get(function () {
  return `/store/item/${this._id}`
})

module.exports = mongoose.model('Item', ItemSchema)
