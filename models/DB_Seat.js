const mongoose = require('mongoose');
const databaseURL = 'mongodb+srv://OafallasKenneth:a1b2c3d4@ccapdev-mp-bigbrainmovies-mubsx.gcp.mongodb.net/BigBrainDB?retryWrites=true&w=majority';

const options = { useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false };

mongoose.connect(databaseURL, options);

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

//module.exports = mongoose.model('Seat', SeatSchema);
const seatsModel = mongoose.model('Seat',SeatSchema)

exports.getUserSeats = (user,next) => {
    var objArr = []
    seatsModel.find({owner: user}).exec((err,seats) => {
        seats.forEach(item => {
            console.log(item)
            if (item.status == 'R')
            objArr.push(item)
        })
        next(err,objArr)
    })
}