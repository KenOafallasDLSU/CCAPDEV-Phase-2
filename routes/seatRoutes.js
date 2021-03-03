const router = require('express').Router()
const seatController = require('../controllers/seatController.js')
const {isCustomer} = require('../middlewares/checkRoutes.js')

router.get('/:slotid', isCustomer, seatController.renderSeatSelection)

router.post('/getSeatStatus', isCustomer, seatController.getSeatStatus)
router.post('/reserveSeats', isCustomer, seatController.reserveSeats)

module.exports = router