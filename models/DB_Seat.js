const mongoose = require('./connection');

const SeatSchema = new mongoose.Schema(
    {
        seatNum: {type: String, required: true},
        status: {type: String, required: true, enum: ["A", "R", "U"], default: "A"},
        slot: {type: mongoose.Schema.Types.ObjectId, ref: "Slot", required: true},
        owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: false}
    },
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

//module.exports = mongoose.model('seats', SeatSchema);


const seatsModel = mongoose.model('Seats',SeatSchema)

exports.getUserSeats = (user,sort,next) => {
    var objArr = []
    seatsModel.find({owner: user}).sort(sort).exec((err,seats) => {
        seats.forEach(item => {
            if (item.status == 'R')
            objArr.push(item)
        })
        next(err,objArr)
    })
}

exports.getOne = (query, next) => {
    seatsModel.findOne(query, (err, slot) => {
        next(err, slot);
    });
  };
