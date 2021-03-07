const router = require('express').Router()
const transController = require('../controllers/transactionController.js')
const screeningController = require('../controllers/screeningController');
const {isCustomer} = require('../middlewares/checkRoutes.js')

/*
Checkout Page
*/

// get functions
router.get('/checkout',isCustomer, transController.getCheckout)

// post functions
router.post('/cancelSeats',transController.cancelSeats)

/*
Transaction History
*/

// get functions
router.get('/history', transController.getHistory)

module.exports = router