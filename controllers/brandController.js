const Brand = require('../models/brand')
const item = require('../models/item')

const async = require('async')
const { body, validationResult } = require('express-validator')

// Display list of all Brands
exports.brandList = (req, res, next) => {
  Brand.find()
    .sort([['name', 'ascending']])
    .exec((err, listBrands) => {
      if (err) {
        return next(err)
      }

      res.render('brandList', { title: 'Brand List', listBrands })
    })
}

// Display detail page for a specific Brand
exports.brandDetail = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback)
      },
      brandItems(callback) {
        item.find({ brand: req.params.id }).exec(callback)
      },
    },
    (err, results) => {
      if (err) {
        return next(err)
      }
      if (results.brand == null) {
        //No results
        const err = new Error('Brand not found')
        err.status = 404
        return next(err)
      }
      // Successful, so render
      res.render('brandDetail', {
        title: 'Brand detail',
        brand: results.brand,
        brandItems: results.brandItems,
      })
    }
  )
}

exports.brandUpdatePost = [
  // Validate and sanitize fields
  body('name', 'Brand name required').trim().isLength({ min: 1 }).escape(),
  body('description').optional({ checkFalsy: true }).trim().escape(),
  // Process request after validation and sanitization
  (req, res, next) => {
    const errors = validationResult(req)

    // Create a brand object with escaped and trimmed data
    const brand = new Brand({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    })

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with error messages.
      res.render('brandForm', {
        title: 'Update Brand',
        brand,
        errors: errors.array(),
      })
      return
    } else {
      // Data from form is valid
      // Check if Brand with same name already exists
      Brand.findOne({
        name: req.body.name,
        description: req.body.description,
      }).exec((err, foundBrand) => {
        if (err) {
          return next(err)
        }

        if (foundBrand) {
          // Brand exists, redirect to its detail page
          res.redirect(foundBrand.url)
        } else {
          // Data from form is valid. Update the record
          Brand.findByIdAndUpdate(req.params.id, brand, {}, (err, thebrand) => {
            if (err) {
              return next(err)
            }

            // Success
            res.redirect(thebrand.url)
          })
        }
      })
    }
  },
]

exports.brandUpdateGet = (req, res, next) => {
  Brand.findById(req.params.id).exec((err, brand) => {
    if (err) {
      return next(err)
    }
    if (brand == null) {
      // No results
      const err = new Error('Brand not found')
      err.status = 404
      return next(err)
    }
    // Success
    res.render('brandForm', {
      title: 'Update Brand',
      brand,
    })
  })
}

exports.brandDeletePost = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback)
      },
      brandItems(callback) {
        item.find({ brand: req.params.id }).exec(callback)
      },
    },
    (err, results) => {
      if (err) {
        return next(err)
      }
      if (results.brandItems.length > 0) {
        // Brand has items. Render in same way as for GET route.
        res.render('brandDelete', {
          title: 'Delete Brand',
          brand: results.brand,
          brandItems: results.brandItems,
        })
        return
      }
      // Brand has no items. Delete object and redirect to the list of brands.
      Brand.findByIdAndRemove(req.body.brandid, (err) => {
        if (err) {
          return next(err)
        }
        res.redirect('/store/brands')
      })
    }
  )
}

exports.brandDeleteGet = (req, res, next) => {
  async.parallel(
    {
      brand(callback) {
        Brand.findById(req.params.id).exec(callback)
      },
      brandItems(callback) {
        item.find({ brand: req.params.id }).exec(callback)
      },
    },
    (err, results) => {
      if (err) {
        return next(err)
      }
      if (results.brand == null) {
        res.redirect('/store/brands')
      }

      res.render('brandDelete', {
        title: 'Delete Brand',
        brand: results.brand,
        brandItems: results.brandItems,
      })
    }
  )
}

exports.brandCreatePost = [
  // Validate and sanitize fields
  body('name', 'Brand name required').trim().isLength({ min: 1 }).escape(),
  body('description').optional({ checkFalsy: true }).trim().escape(),

  (req, res, next) => {
    const errors = validationResult(req)

    // Create a brand object with escaped and trimmed data
    const brand = new Brand({
      name: req.body.name,
      description: req.body.description,
    })

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with error messages.
      res.render('brandForm', {
        title: 'Update Brand',
        brand,
        errors: errors.array(),
      })
      return
    } else {
      // Data from form is valid
      // Check if Brand with same name already exists
      Brand.findOne({
        name: req.body.name,
        description: req.body.description,
      }).exec((err, foundBrand) => {
        if (err) {
          return next(err)
        }

        if (foundBrand) {
          // Brand exists, redirect to its detail page
          res.redirect(foundBrand.url)
        } else {
          brand.save((err) => {
            if (err) {
              return next(err)
            }
            // Brand saved. Redirect to brand detail page.
            res.redirect(brand.url)
          })
        }
      })
    }
  },
]

exports.brandCreateGet = (req, res) => {
  res.render('brandForm', { title: 'Create Brand' })
}
