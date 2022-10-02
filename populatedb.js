#! /usr/bin/env node

console.log(
  'This script populates some test items and brands to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
)

// Get arguments passed on command line
var userArgs = process.argv.slice(2)
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Brand = require('./models/brand')

var mongoose = require('mongoose')
var mongoDB = userArgs[0]
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

var items = []
var brands = []

function itemCreate(
  name,
  description,
  price,
  numberInStock,
  colorPrint,
  brand,
  cb
) {
  var itemDetail = {
    name,
    price,
    numberInStock,
    colorPrint,
  }

  if (description != false) itemDetail.description = description
  if (brand != false) itemDetail.brand = brand

  var item = new Item(itemDetail)

  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item)
    items.push(item)
    cb(null, item)
  })
}

function brandCreate(name, description, cb) {
  var brandDetail = new Brand({ name })

  if (description != false) brandDetail.description = description

  var brand = new Brand(brandDetail)

  brand.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Brand: ' + brand)
    brands.push(brand)
    cb(null, brand)
  })
}

function createBrands(cb) {
  async.series(
    [
      function (callback) {
        brandCreate('HP', 'Hewlett Packard', callback)
      },
      function (callback) {
        brandCreate('Konica Minolta', false, callback)
      },
      function (callback) {
        brandCreate('Canon', false, callback)
      },
    ],
    // optional callback
    cb
  )
}

function createItems(cb) {
  async.series(
    [
      function (callback) {
        itemCreate(
          'OfficeJetPro',
          'Ideal zum Drucken farbiger Arbeitsdokumente',
          199.99,
          55,
          true,
          brands[0],
          callback
        )
      },
      function (callback) {
        itemCreate(
          'LaserJet',
          'Für große Mengen SW-Dokumente',
          149.99,
          30,
          false,
          brands[0],
          callback
        )
      },
      function (callback) {
        itemCreate('bizhub C224e', false, 349.99, 35, true, brands[1], callback)
      },
      function (callback) {
        itemCreate(
          'bizhub 284e',
          'Für große Mengen SW-Dokumente',
          249.99,
          2,
          false,
          brands[1],
          callback
        )
      },
      function (callback) {
        itemCreate(
          'i-SENSYS LBP620',
          'Hochwertiger Farblaserdrucker',
          229.99,
          12,
          true,
          brands[2],
          callback
        )
      },
      function (callback) {
        itemCreate(
          'i-SENSYS LBP660',
          'Hochwertiger, schneller Farblaserdrucker',
          249.99,
          2,
          true,
          brands[2],
          callback
        )
      },
    ],
    // optional callback
    cb
  )
}

async.series(
  [createBrands, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log('FINAL ERR: ' + err)
    } else {
      console.log('items: ' + items)
    }
    // All done, disconnect from database
    mongoose.connection.close()
  }
)
