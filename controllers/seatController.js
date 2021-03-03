const seatModel = require('../models/DB_Seat')
const screeningModel = require('../models/DB_Screening')
const slotModel = require('../models/DB_Slot')
const ObjectId = require('mongodb').ObjectId;

exports.renderSeatSelection = async (req, res) => {
  req.session.slot = req.params.slotid
  const slot = await slotModel.getOne({"_id": ObjectId(req.params.slotid)})
  screeningModel.getOne({"_id": slot.screening}, function(err, result) {
    if(err) throw err;
    const screening = result;

    res.render("BigBrain_Seats", {
      //header
      user: req.session.fullname,

      //main head
      pageCSS: "BigBrain_Seats",
      pageJS: "BigBrain_Seats",
      pageTitle: "Seat Selection",
      header: "header",
      footer: "footer",

      //body
      screening: screening,
      slot: slot,
      dateFormatted: screening.date.toDateString()
    });
  });
}

/**
 * POST route
 * get statis of seats, whether A,R,U
 */
exports.getSeatStatus = (req, res) => {
  seatModel.getSeatsOfSlot(ObjectId(req.session.slot), (err, result) => {
    if(err) throw err
    res.send(result)
  })
}

/**
 * POST route
 * updates seats selected to Reserved then redirects to checkout
 */
exports.reserveSeats = (req, res) => {
  seatModel.reserveSeats({slot: ObjectId(req.session.slot), seatNum: {$in: req.body.reservedSeats}}, {$set: {status: "R", owner: ObjectId(req.session.user)}}, function(err, result) {
    if (err) throw err
    res.send(result)
  });
}