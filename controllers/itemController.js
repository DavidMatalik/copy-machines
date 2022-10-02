const Item = require('../models/item')
const Brand = require('../models/brand')

const async = require('async')

exports.index = (req, res) => {
  async.parallel(
    {
      itemCount(callback) {
        Item.countDocuments({}, callback)
      },
      brandCount(callback) {
        Brand.countDocuments({}, callback)
      },
    },
    (err, results) => {
      res.render('index', {
        title: 'Copy Machines Home',
        error: err,
        data: results,
      })
    }
  )
}

exports.itemList = (req, res, next) => {
  Item.find()
    .sort([['name', 'ascending']])
    .exec((err, listItems) => {
      if (err) {
        return next(err)
      }

      res.render('itemList', { title: 'Item List', listItems })
    })
}

exports.itemDetail = (req, res, next) => {
  Item.findById(req.params.id)
    .populate('brand')
    .exec((err, item) => {
      if (err) {
        return next(err)
      }
      if (item == null) {
        // No results
        const err = new Error('Item not found')
        err.status = 404
        return next(err)
      }

      res.render('itemDetail', { title: `Item: ${item.name}`, item })
    })
}

exports.itemUpdatePost = (req, res, next) => {
  res.send('Hello')
}

exports.itemUpdateGet = (req, res, next) => {
  res.send('Hello')
}

exports.itemDeletePost = (req, res, next) => {
  res.send('Hello')
}

exports.itemDeleteGet = (req, res, next) => {
  res.send('Hello')
}

exports.itemCreatePost = (req, res, next) => {
  res.send('Hello')
}

exports.itemCreateGet = (req, res, next) => {
  res.send('Hello')
}
