const Item = require('../models/item')
const Brand = require('../models/brand')

const async = require('async')
const { body, validationResult } = require('express-validator')

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

exports.itemUpdatePost = [
  // Validate and sanitize fields
  body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
  body('description').optional({ checkFalsy: true }).trim().escape(),
  body('brand', 'Brand must be specified').trim().isLength({ min: 1 }).escape(),
  body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape(),
  body('numberInStock', 'Number in Stock must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  (req, res, next) => {
    console.log('req', req)
    // Extract the validation errors from a request.
    const errors = validationResult(req)

    // Create an item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      colorPrint: req.body.colorPrint === 'on' ? true : false,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      // There are errors. Render form again with sanitized values and error messages.
      Brand.find({}).exec(function (err, brands) {
        if (err) {
          return next(err)
        }
        // Successful, so render.
        res.render('itemForm', {
          title: 'Update Item',
          brands,
          errors: errors.array(),
          item,
        })
      })
      return
    }

    // Data from form is valid. Update the record.
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if (err) {
        return next(err)
      }

      // Successful: redirect to bookinstance detail page.
      res.redirect(theitem.url)
    })
  },
]

exports.itemUpdateGet = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id).populate('brand').exec(callback)
      },
      brands(callback) {
        Brand.find(callback)
      },
    },
    (err, results) => {
      if (err) {
        return next(err)
      }

      if (results.item == null) {
        // No results
        const err = new Error('Item not found')
        err.status = 404
        return next(err)
      }
      // Success
      res.render('itemForm', {
        title: 'Update Item',
        item: results.item,
        brands: results.brands,
      })
    }
  )
}

exports.itemDeletePost = (req, res, next) => {
  Item.findByIdAndRemove(req.body.itemid, (err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/store/items')
  })
}

exports.itemDeleteGet = (req, res, next) => {
  Item.findById(req.params.id).exec((err, item) => {
    if (err) {
      return next(err)
    }
    if (item == null) {
      res.redirect('/store/items')
    }
    res.render('itemDelete', { title: 'Delete Item', item })
  })
}

exports.itemCreatePost = [
  // Validate and sanitize fields
  body('name', 'Name must be specified').trim().isLength({ min: 1 }).escape(),
  body('description').optional({ checkFalsy: true }).trim().escape(),
  body('brand', 'Brand must be specified').trim().isLength({ min: 1 }).escape(),
  body('price', 'Price must be specified').trim().isLength({ min: 1 }).escape(),
  body('numberInStock', 'Number in Stock must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('colorPrint', 'Can color print must be specified')
    .optional()
    .custom((value) => value === 'on'),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req)

    // Create an item object with escaped and trimmed data.
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      price: req.body.price,
      numberInStock: req.body.numberInStock,
      colorPrint: req.body.colorPrint === 'on' ? true : false,
    })

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Brand.find({}).exec(function (err, brands) {
        if (err) {
          return next(err)
        }
        // Successful, so render.
        res.render('itemForm', {
          title: 'Create Item',
          brands,
          errors: errors.array(),
          item,
        })
      })
      return
    }

    // Data from form is valid.
    item.save((err) => {
      if (err) {
        return next(err)
      }
      // Successful: redirect to new record.
      res.redirect(item.url)
    })
  },
]

exports.itemCreateGet = (req, res, next) => {
  Brand.find({}).exec((err, brands) => {
    if (err) {
      return next(err)
    }

    res.render('itemForm', { title: 'Create Item', brands })
  })
}
