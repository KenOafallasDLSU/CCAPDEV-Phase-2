const router = require('express').Router()
const transController = require('../controllers/transactionController.js')
const screeningController = require('../controllers/screeningController');
const {isCustomer} = require('../middlewares/checkRoutes.js')
const {checkoutValidation} = require('../validators.js');

/*
Checkout Page
*/

// get functions
router.get('/checkout',isCustomer, transController.getCheckout)

// post functions
router.post('/cancelSeats',isCustomer,transController.cancelSeats)
router.post('/createTransaction',isCustomer, transController.createTransaction)

/*
Transaction History
*/

// get functions
router.get('/history',isCustomer, transController.getHistory)

module.exports = router