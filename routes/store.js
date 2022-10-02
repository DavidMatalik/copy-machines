const express = require('express')
const router = express.Router()

const itemController = require('../controllers/itemController')
const brandController = require('../controllers/brandController')

/// ITEM ROUTES ///

router.get('/', itemController.index)

router.get('/item/create', itemController.itemCreateGet)
router.post('/item/create', itemController.itemCreatePost)

router.get('/item/:id/delete', itemController.itemDeleteGet)
router.post('/item/:id/delete', itemController.itemDeletePost)

router.get('/item/:id/update', itemController.itemUpdateGet)
router.post('/item/:id/update', itemController.itemUpdatePost)

router.get('/item/:id', itemController.itemDetail)
router.get('/items', itemController.itemList)

/// BRAND ROUTES ///

router.get('/brand/create', brandController.brandCreateGet)
router.post('/brand/create', brandController.brandCreatePost)

router.get('/brand/:id/delete', brandController.brandDeleteGet)
router.post('/brand/:id/delete', brandController.brandDeletePost)

router.get('/brand/:id/update', brandController.brandUpdateGet)
router.post('/brand/:id/update', brandController.brandUpdatePost)

router.get('/brand/:id', brandController.brandDetail)
router.get('/brands', brandController.brandList)

module.exports = router
